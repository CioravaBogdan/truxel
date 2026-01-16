import { supabase } from '@/lib/supabase';

export interface KeyStat {
  label?: string;
  value: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string | null;
  tags: string[] | null;
  published_at: string;
  created_at: string;
  key_stats: KeyStat[] | null;
  cta: string | null;
}

export const blogService = {
  // Helper to parse key_stats - handles both string arrays and object arrays
  parseKeyStats(data: any): KeyStat[] | null {
    if (!data) return null;
    
    let parsed = data;
    
    // If it's a string, try to parse it as JSON
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch {
        return null;
      }
    }
    
    // If it's not an array, return null
    if (!Array.isArray(parsed)) return null;
    
    // Convert to KeyStat format - handle both string[] and KeyStat[]
    return parsed.map((item: any) => {
      if (typeof item === 'string') {
        // Simple string format - use the string as value
        return { value: item };
      }
      // Already an object with label/value
      return item as KeyStat;
    });
  },

  async getLatestArticles(limit = 3) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }

    return (data || []).map(article => ({
      ...article,
      key_stats: this.parseKeyStats(article.key_stats)
    })) as Article[];
  },

  async getAllArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching all articles:', error);
      return [];
    }

    return (data || []).map(article => ({
      ...article,
      key_stats: this.parseKeyStats(article.key_stats)
    })) as Article[];
  },

  async getArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching article by slug:', error);
      return null;
    }

    return {
      ...data,
      key_stats: this.parseKeyStats(data.key_stats)
    } as Article;
  }
};
