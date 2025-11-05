import { supabase } from '../lib/supabase';
import {
  CommunityPost,
  CreatePostData,
  UpdatePostData,
  PostFilters,
  PostsResponse,
  CanPostResponse,
  InteractionType
} from '../types/community.types';

type ProfileRow = {
  full_name: string;
  company_name?: string | null;
  truck_type?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  phone_number?: string | null;
};

type PostRow = Omit<CommunityPost, 'profile' | 'metadata'> & {
  metadata?: CommunityPost['metadata'] | null;
  profile?: ProfileRow | null;
  profiles?: ProfileRow | null;
  profiles_public?: ProfileRow | null;
};

type SavedPostRow = { post: PostRow | null };

const normalizePostRow = (row: PostRow): CommunityPost => {
  const { profile, profiles, profiles_public, metadata, ...rest } = row;

  const normalized: CommunityPost = {
    ...(rest as CommunityPost),
    metadata: (metadata ?? {}) as CommunityPost['metadata'],
    view_count: (rest as CommunityPost).view_count ?? 0,
    contact_count: (rest as CommunityPost).contact_count ?? 0,
  };

  const profileData = profile ?? profiles ?? profiles_public ?? null;

  if (profileData) {
    normalized.profile = {
      full_name: profileData.full_name,
      company_name: profileData.company_name ?? undefined,
      truck_type: profileData.truck_type ?? undefined,
      avatar_url: profileData.avatar_url ?? undefined,
      email: profileData.email ?? undefined,
      phone_number: profileData.phone_number ?? undefined,
    };
  } else if ('profile' in normalized) {
    delete (normalized as any).profile;
  }

  if ('profiles' in normalized) delete (normalized as any).profiles;
  if ('profiles_public' in normalized) delete (normalized as any).profiles_public;

  return normalized;
};

class CommunityService {
  /**
   * Check if user can create a new post
   */
  async canUserPost(userId: string): Promise<CanPostResponse> {
    const { data, error } = await supabase.rpc('can_user_post', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error checking post permission:', error);
      throw error;
    }

    return data as CanPostResponse;
  }

  /**
   * Create a new community post
   */
  async createPost(userId: string, postData: CreatePostData): Promise<CommunityPost> {
    // First check if user can post
    const canPost = await this.canUserPost(userId);

    if (!canPost.can_post) {
      throw new Error(canPost.reason || 'Cannot create post at this time');
    }

    // Check for duplicate posts (anti-spam) - Include post_type to avoid false positives
    const { data: duplicateCheck } = await supabase.rpc('check_duplicate_post', {
      p_user_id: userId,
      p_origin_city: postData.origin_city,
      p_post_type: postData.post_type
    });

    if (!duplicateCheck) {
      throw new Error('Ai o postare similară activă din același tip. Așteaptă 15 minute.');
    }

    // Create the post
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        ...postData,
        status: 'active',
        view_count: 0,
        contact_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    // Increment usage
    await supabase.rpc('increment_post_usage', { p_user_id: userId });

    const postRow = data as PostRow;

    // Fetch full post with profile to ensure joined data is present
    const enriched = await this.getPost(postRow.id, { skipIncrement: true });
    return enriched ?? normalizePostRow(postRow);
  }

  /**
   * Get posts with filters and pagination
   */
  async getPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profiles_public!community_posts_user_id_profiles_public_fkey (
          full_name,
          company_name,
          truck_type,
          avatar_url,
          email,
          phone_number
        )
      `)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.post_type) {
      query = query.eq('post_type', filters.post_type);
    }

    // Country filter - match either ISO code or full name (for legacy posts)
    if (filters.origin_country || filters.origin_country_name) {
      const countryValues = [filters.origin_country, filters.origin_country_name].filter(Boolean) as string[];
      if (countryValues.length > 0) {
        query = query.in('origin_country', countryValues);
      }
    }

    if (filters.origin_city) {
      query = query.ilike('origin_city', `%${filters.origin_city}%`);
    }

    if (filters.dest_city) {
      query = query.eq('dest_city', filters.dest_city);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    // Pagination
    const limit = filters.limit || 20;
    query = query.limit(limit);

    if (filters.cursor) {
      query = query.lt('created_at', filters.cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    const rows = (data ?? []) as PostRow[];
    const posts = rows.map(normalizePostRow);

    return {
      data: posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].created_at : undefined,
      hasMore: posts.length === limit
    };
  }

  /**
   * Get a single post by ID
   */
  async getPost(postId: string, options: { skipIncrement?: boolean } = {}): Promise<CommunityPost | null> {
    const row = await this.fetchPostRow(postId);

    if (!row) {
      return null;
    }

    if (!options.skipIncrement) {
      await this.incrementViewCount(postId);
    }

    return normalizePostRow(row);
  }

  /**
   * Update a post
   */
  async updatePost(postId: string, userId: string, updates: UpdatePostData): Promise<CommunityPost> {
    const { data, error } = await supabase
      .from('community_posts')
      .update(updates)
      .eq('id', postId)
      .eq('user_id', userId) // Ensure user owns the post
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }

    const postRow = data as PostRow;
    const enriched = await this.getPost(postId, { skipIncrement: true });
    return enriched ?? normalizePostRow(postRow);
  }

  /**
   * Delete/Cancel a post
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    const { data, error } = await supabase.rpc('delete_user_post', {
      p_post_id: postId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }

    const result = data as { success: boolean; error?: string };
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete post');
    }
  }

  /**
   * Get user's active posts
   */
  async getUserActivePosts(userId: string): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles_public!community_posts_user_id_profiles_public_fkey (
          full_name,
          company_name,
          truck_type,
          avatar_url,
          email,
          phone_number
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }

    const rows = (data ?? []) as PostRow[];
    return rows.map(normalizePostRow);
  }

  /**
   * Record an interaction with a post
   */
  async recordInteraction(
    postId: string,
    userId: string,
    interactionType: InteractionType,
    metadata?: Record<string, any>
  ): Promise<{ inserted: boolean }> {
    const { data, error } = await supabase.rpc('record_community_interaction', {
      p_post_id: postId,
      p_user_id: userId,
      p_interaction_type: interactionType,
      p_metadata: metadata ?? null,
    });

    if (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }

    const inserted = Boolean((data as { inserted?: boolean } | null)?.inserted);

    return { inserted };
  }

  /**
   * Delete an interaction with a post (e.g., unsave)
   */
  async deleteInteraction(
    postId: string,
    userId: string,
    interactionType: InteractionType
  ): Promise<void> {
    const { error } = await supabase
      .from('community_interactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('interaction_type', interactionType);

    if (error) {
      console.error('Error deleting interaction:', error);
      throw error;
    }
  }

  /**
   * Record a view interaction and increment counters once per user
   */
  async recordView(postId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('record_community_interaction', {
        p_post_id: postId,
        p_user_id: userId,
        p_interaction_type: 'view',
        p_metadata: null,
      });

      if (error) {
        throw error;
      }

      const inserted = Boolean((data as { inserted?: boolean } | null)?.inserted);

      if (inserted) {
        await this.incrementViewCount(postId);
      }

      return inserted;
    } catch (error) {
      console.error('Error recording view interaction:', error);

      try {
        await this.incrementViewCount(postId);
      } catch (incrementError) {
        console.error('Fallback view counter increment failed:', incrementError);
      }

      return false;
    }
  }

  /**
   * Get saved posts for a user
   */
  async getSavedPosts(userId: string): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_interactions')
      .select(`
        post:community_posts (
          *,
          profiles_public!community_posts_user_id_profiles_public_fkey (
            full_name,
            company_name,
            truck_type,
            avatar_url,
            email,
            phone_number
          )
        )
      `)
      .eq('user_id', userId)
      .eq('interaction_type', 'saved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }

    const rows: SavedPostRow[] = ((data as unknown) as SavedPostRow[] | null) ?? [];

    return rows
      .map((item) => (item.post ? normalizePostRow(item.post) : null))
      .filter((post): post is CommunityPost => Boolean(post));
  }

  /**
   * Subscribe to real-time post updates
   */
  subscribeToNewPosts(
    filters: PostFilters,
    callback: (post: CommunityPost) => void
  ) {
    const channel = supabase
      .channel('community_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
          filter: filters.origin_city ? `origin_city=eq.${filters.origin_city}` : undefined
        },
        async (payload) => {
          if (payload.new) {
            // Fetch complete post with profile
            const post = await this.getPost(payload.new.id, { skipIncrement: true });
            if (post) {
              callback(post);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Convert post to lead
   */
  async convertToLead(postId: string, userId: string): Promise<void> {
    const post = await this.getPost(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // Create lead from post
    const { error } = await supabase
      .from('leads')
      .insert({
        user_id: userId,
        company_name: post.profile?.company_name || 'Contact Comunitate',
        contact_person_name: post.profile?.full_name,
        phone: post.contact_phone,
        city: post.dest_city || post.origin_city,
        industry: 'Transport',
        source_type: 'community',
        source_id: postId,
        status: 'new',
        ai_match_score: 0.8,
        match_reasons: [
          { reason: 'Contact direct din comunitate', weight: 0.8 }
        ]
      });

    if (error) {
      console.error('Error converting to lead:', error);
      throw error;
    }
  }

  /**
   * Private: Fetch post row with profile join (no side effects)
   */
  private async fetchPostRow(postId: string): Promise<PostRow | null> {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles_public!community_posts_user_id_profiles_public_fkey (
          full_name,
          company_name,
          truck_type,
          avatar_url,
          email,
          phone_number
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    return data as PostRow;
  }

  /**
   * Private: Increment view count
   */
  private async incrementViewCount(postId: string): Promise<void> {
    try {
      await supabase.rpc('increment', {
        table_name: 'community_posts',
        column_name: 'view_count',
        row_id: postId
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get community statistics
   */
  async getCommunityStats(userId: string): Promise<{
    totalPosts: number;
    activePosts: number;
    conversions: number;
    contacts: number;
  }> {
    // Get total and active posts
    const { count: totalPosts } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: activePosts } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    // Get conversions (leads from community)
    const { count: conversions } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source_type', 'community');

    // Get total contacts
    const { data: contactData } = await supabase
      .from('community_posts')
      .select('contact_count')
      .eq('user_id', userId);

    const contacts = contactData?.reduce((sum, post) => sum + (post.contact_count || 0), 0) || 0;

    return {
      totalPosts: totalPosts || 0,
      activePosts: activePosts || 0,
      conversions: conversions || 0,
      contacts
    };
  }
}

export const communityService = new CommunityService();