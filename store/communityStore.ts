import { create } from 'zustand';
import {
  CommunityPost,
  PostType,
  PostFilters,
  CanPostResponse,
  City,
  Country,
} from '../types/community.types';
import { communityService } from '../services/communityService';
import { useAuthStore } from './authStore';

interface CommunityState {
  // Posts data
  posts: CommunityPost[];
  savedPosts: CommunityPost[];
  userActivePosts: CommunityPost[];

  // UI state
  selectedTab: 'availability' | 'routes' | 'saved';
  isLoading: boolean;
  isRefreshing: boolean;
  isCreatingPost: boolean;
  error: string | null;

  // QuickPostBar modal state
  showTemplateModal: boolean;
  showCityModal: boolean;
  selectedPostType: 'availability' | 'route' | null;
  selectedTemplate: any | null;

  // Pagination
  hasMore: boolean;
  nextCursor: string | undefined;

  // Filters
  filters: PostFilters;
  selectedCity: City | null;
  selectedCountry: Country | null;

  // User limits
  postLimits: CanPostResponse | null;

  // Community stats
  communityStats: {
    totalPosts: number;
    activePosts: number;
    conversions: number;
    contacts: number;
  } | null;

  viewedPostIds: Record<string, boolean>;

  // Actions
  loadPosts: (reset?: boolean) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  loadUserActivePosts: (userId: string) => Promise<void>;
  loadSavedPosts: (userId: string) => Promise<void>;
  checkPostLimits: (userId: string) => Promise<void>;
  loadCommunityStats: (userId: string) => Promise<void>;

  // Post actions
  createPost: (userId: string, postData: any) => Promise<CommunityPost>;
  updatePost: (postId: string, userId: string, updates: any) => Promise<void>;
  deletePost: (postId: string, userId: string) => Promise<void>;
  savePost: (postId: string, userId: string) => Promise<void>;
  unsavePost: (postId: string, userId: string) => Promise<void>;
  recordContact: (postId: string, userId: string) => Promise<void>;
  recordView: (postId: string, userId: string) => Promise<void>;
  reportPost: (postId: string, userId: string, reason: string) => Promise<void>;
  blockUser: (blockerId: string, blockedId: string) => Promise<void>;

  // Filter actions
  setSelectedTab: (tab: 'availability' | 'routes' | 'saved') => void;
  setFilters: (filters: Partial<PostFilters>) => void;
  clearFilters: () => void;
  setSelectedCity: (city: City | null) => void;
  setSelectedCountry: (country: Country | null) => void;
  initializeFilters: (filters: { country?: Country | null; city?: City | null }) => void;

  // QuickPostBar modal actions
  setShowTemplateModal: (show: boolean) => void;
  setShowCityModal: (show: boolean) => void;
  setSelectedPostType: (type: 'availability' | 'route' | null) => void;
  setSelectedTemplate: (template: any | null) => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  posts: [],
  savedPosts: [],
  userActivePosts: [],
  selectedTab: 'availability' as const,
  isLoading: false,
  isRefreshing: false,
  isCreatingPost: false,
  error: null,
  hasMore: true,
  nextCursor: undefined,
  filters: {},
  selectedCity: null,
  selectedCountry: null,
  postLimits: null,
  communityStats: null,
  showTemplateModal: false,
  showCityModal: false,
  selectedPostType: null,
  selectedTemplate: null,
  viewedPostIds: {},
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  ...initialState,

  // Load posts with current filters
  loadPosts: async (reset = false) => {
    const { filters, selectedTab, nextCursor } = get();
    const userId = useAuthStore.getState().user?.id;

    if (reset) {
      set({ posts: [], nextCursor: undefined, hasMore: true });
    }

    set({ isLoading: true, error: null });

    try {
      const postType: PostType = selectedTab === 'availability' ? 'DRIVER_AVAILABLE' : 'LOAD_AVAILABLE';

      const response = await communityService.getPosts({
        ...filters,
        post_type: postType,
        cursor: reset ? undefined : nextCursor,
        exclude_blocked_by: userId,
      });

      set({
        posts: reset ? response.data : [...get().posts, ...response.data],
        hasMore: response.hasMore,
        nextCursor: response.nextCursor,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading posts:', error);
      set({
        error: 'Nu am putut încărca postările. Încearcă din nou.',
        isLoading: false
      });
    }
  },

  // Load more posts (pagination)
  loadMorePosts: async () => {
    const { hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;

    await get().loadPosts(false);
  },

  // Refresh posts (pull to refresh)
  refreshPosts: async () => {
    set({ isRefreshing: true });
    await get().loadPosts(true);
    set({ isRefreshing: false });
  },

  // Load user's active posts
  loadUserActivePosts: async (userId: string) => {
    try {
      const posts = await communityService.getUserActivePosts(userId);
      set({ userActivePosts: posts });
    } catch (error) {
      console.error('Error loading user posts:', error);
    }
  },

  // Load saved posts
  loadSavedPosts: async (userId: string) => {
    try {
      const posts = await communityService.getSavedPosts(userId);
      set({ savedPosts: posts });
    } catch (error) {
      console.error('[loadSavedPosts] ❌ ERROR:', error);
    }
  },

  // Check post limits
  checkPostLimits: async (userId: string) => {
    try {
      const limits = await communityService.canUserPost(userId);
      set({ postLimits: limits });
    } catch (error) {
      console.error('Error checking post limits:', error);
    }
  },

  // Load community stats
  loadCommunityStats: async (userId: string) => {
    try {
      const stats = await communityService.getCommunityStats(userId);
      set({ communityStats: stats });
    } catch (error) {
      console.error('Error loading community stats:', error);
    }
  },

  // Create a new post
  createPost: async (userId: string, postData: any) => {
    set({ isCreatingPost: true, error: null });

    try {
      const post = await communityService.createPost(userId, postData);

      // Add to posts list if it matches current filters
      const { selectedTab } = get();
      const postType = selectedTab === 'availability' ? 'DRIVER_AVAILABLE' : 'LOAD_AVAILABLE';

      if (post.post_type === postType) {
        set(state => ({
          posts: [post, ...state.posts],
          userActivePosts: [post, ...state.userActivePosts],
          isCreatingPost: false,
        }));
      } else {
        set({ isCreatingPost: false });
      }

      // Refresh limits
      await get().checkPostLimits(userId);

      return post;
    } catch (error: any) {
      set({
        error: error.message || 'Nu am putut crea postarea.',
        isCreatingPost: false
      });
      throw error;
    }
  },

  // Update a post
  updatePost: async (postId: string, userId: string, updates: any) => {
    try {
      const updatedPost = await communityService.updatePost(postId, userId, updates);

      set(state => ({
        posts: state.posts.map(p => p.id === postId ? updatedPost : p),
        userActivePosts: state.userActivePosts.map(p => p.id === postId ? updatedPost : p),
      }));
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete/cancel a post
  deletePost: async (postId: string, userId: string) => {
    try {
      await communityService.deletePost(postId, userId);

      set(state => ({
        posts: state.posts.filter(p => p.id !== postId),
        userActivePosts: state.userActivePosts.filter(p => p.id !== postId),
      }));

      // Refresh limits
      await get().checkPostLimits(userId);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Save a post
  savePost: async (postId: string, userId: string) => {
    try {
      const { inserted } = await communityService.recordInteraction(postId, userId, 'saved');

      if (!inserted) {
        const existsLocally = get().savedPosts.some(p => p.id === postId);
        
        if (!existsLocally) {
          // Force reload saved posts to sync with DB
          await get().loadSavedPosts(userId);
        }
        return;
      }

      // Find post in current tab
      let post = get().posts.find(p => p.id === postId);
      
      // If not in current posts, try savedPosts (edge case)
      if (!post) {
        post = get().savedPosts.find(p => p.id === postId);
      }

      if (post) {
        
        // Check if already exists (double-check)
        const alreadyExists = get().savedPosts.some(p => p.id === postId);
        if (alreadyExists) {

          return;
        }
        
        set(state => ({
          savedPosts: [post, ...state.savedPosts],
        }));
      } else {
        console.error('[savePost] ❌ CRITICAL: Post not found in any array!', postId);
      }
    } catch (error) {
      console.error('[savePost] ❌ ERROR:', error);
    }
  },

  // Unsave a post
  unsavePost: async (postId: string, userId: string) => {
    try {
      console.log('[unsavePost] START - postId:', postId, 'userId:', userId, 'current savedPosts count:', get().savedPosts.length);
      console.log('[unsavePost] Current saved IDs:', get().savedPosts.map(p => p.id));
      
      console.log('[unsavePost] Removing from database with params:', { postId, userId, type: 'saved' });
      await communityService.deleteInteraction(postId, userId, 'saved');
      console.log('[unsavePost] ✅ DB DELETE CONFIRMED - record removed from community_interactions');
      
      const existsInArray = get().savedPosts.some(p => p.id === postId);
      console.log('[unsavePost] Post exists in savedPosts array?', existsInArray);
      
      console.log('[unsavePost] Removing from savedPosts array...');
      set(state => ({
        savedPosts: state.savedPosts.filter(p => p.id !== postId),
      }));
      console.log('[unsavePost] ✅ SUCCESS! New savedPosts length:', get().savedPosts.length);
      console.log('[unsavePost] Remaining saved IDs:', get().savedPosts.map(p => p.id));
    } catch (error) {
      console.error('[unsavePost] ❌ ERROR during unsave:', error);
      throw error;
    }
  },

  // Record contact action
  recordContact: async (postId: string, userId: string) => {
    try {
      const { inserted } = await communityService.recordInteraction(postId, userId, 'contacted');

      if (inserted) {
        // Update contact count in local state
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId
              ? { ...p, contact_count: (p.contact_count || 0) + 1 }
              : p
          ),
        }));
      }
    } catch (error) {
      console.error('Error recording contact:', error);
    }
  },

  recordView: async (postId: string, userId: string) => {
    const { viewedPostIds } = get();

    if (viewedPostIds[postId]) {
      return;
    }

    try {
      const inserted = await communityService.recordView(postId, userId);

      if (inserted) {
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId ? { ...p, view_count: (p.view_count || 0) + 1 } : p
          ),
          userActivePosts: state.userActivePosts.map(p =>
            p.id === postId ? { ...p, view_count: (p.view_count || 0) + 1 } : p
          ),
          savedPosts: state.savedPosts.map(p =>
            p.id === postId ? { ...p, view_count: (p.view_count || 0) + 1 } : p
          ),
        }));
      }
    } catch (error) {
      console.error('Error recording view:', error);
    } finally {
      set(state => ({
        viewedPostIds: {
          ...state.viewedPostIds,
          [postId]: true,
        },
      }));
    }
  },

  reportPost: async (postId, userId, reason) => {
    try {
      await communityService.reportPost(postId, userId, reason);
    } catch (error) {
      console.error('Error reporting post:', error);
      throw error;
    }
  },

  blockUser: async (blockerId, blockedId) => {
    const removeUserPosts = () => {
      set((state) => ({
        posts: state.posts.filter(p => p.user_id !== blockedId),
        savedPosts: state.savedPosts.filter(p => p.user_id !== blockedId),
        userActivePosts: state.userActivePosts.filter(p => p.user_id !== blockedId)
      }));
    };

    try {
      await communityService.blockUser(blockerId, blockedId);
      removeUserPosts();
    } catch (error: any) {
      // Handle duplicate block (already blocked) as success
      if (error?.code === '23505') {
        console.log('User already blocked, updating local state anyway');
        removeUserPosts();
        return;
      }
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  // Set selected tab
  setSelectedTab: (tab: 'availability' | 'routes' | 'saved') => {
    set({ selectedTab: tab, posts: [], nextCursor: undefined, hasMore: true });
    
    // Don't call loadPosts for 'saved' tab - it will be loaded separately
    if (tab !== 'saved') {
      get().loadPosts(true);
    }
  },

  // Set filters
  setFilters: (newFilters: Partial<PostFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().loadPosts(true);
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {}, selectedCity: null });
    get().loadPosts(true);
  },

  // Set selected city
  setSelectedCity: (city: City | null) => {
    set({ selectedCity: city });

    if (city) {
      get().setFilters({ origin_city: city.name });
    } else {
      const { filters } = get();
      const { origin_city, ...restFilters } = filters;
      set({ filters: restFilters });
      get().loadPosts(true);
    }
  },

  // Set selected country and refresh posts
  setSelectedCountry: (country: Country | null) => {
    set((state) => {
      const nextFilters = { ...state.filters };

      if (country) {
        nextFilters.origin_country = country.code;
        nextFilters.origin_country_name = country.name;
      } else {
        delete nextFilters.origin_country;
        delete nextFilters.origin_country_name;
      }

      const cityMatchesCountry =
        country && state.selectedCity?.country_code === country.code;

      if (!cityMatchesCountry) {
        delete nextFilters.origin_city;
      }

      return {
        filters: nextFilters,
        selectedCountry: country,
        selectedCity: cityMatchesCountry ? state.selectedCity : null,
      };
    });

    get().loadPosts(true);
  },

  // Initialize filters in one shot (used on first load with user location)
  initializeFilters: ({ country = null, city = null }) => {
    set((state) => {
      const nextFilters = { ...state.filters };

      if (country) {
        nextFilters.origin_country = country.code;
        nextFilters.origin_country_name = country.name;
      } else {
        delete nextFilters.origin_country;
        delete nextFilters.origin_country_name;
      }

      if (city) {
        nextFilters.origin_city = city.name;
      } else {
        delete nextFilters.origin_city;
      }

      return {
        filters: nextFilters,
        selectedCountry: country,
        selectedCity: city,
      };
    });

    get().loadPosts(true);
  },

  // QuickPostBar modal actions
  setShowTemplateModal: (show: boolean) => set({ showTemplateModal: show }),
  setShowCityModal: (show: boolean) => set({ showCityModal: show }),
  setSelectedPostType: (type: 'availability' | 'route' | null) => set({ selectedPostType: type }),
  setSelectedTemplate: (template: any | null) => set({ selectedTemplate: template }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),
}));