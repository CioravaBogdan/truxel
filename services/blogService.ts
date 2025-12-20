import { supabase } from '@/lib/supabase';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string | null;
  tags: string[] | null;
  published_at: string;
  created_at: string;
}

export const blogService = {
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

    return data as Article[];
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

    return data as Article[];
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

    return data as Article;
  }
};
