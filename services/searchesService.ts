import { supabase } from '@/lib/supabase';
import { Search, Profile } from '@/types/database.types';
import axios from 'axios';

const WEBHOOK_URL = 'https://n8n.byinfant.com/webhook/logistics-lead-webhook';

interface SearchParams {
  keywords: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export const searchesService = {
  async getSearches(userId: string): Promise<Search[]> {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSearch(id: string): Promise<Search | null> {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async canUserSearch(profile: Profile): Promise<boolean> {
    if (profile.subscription_tier === 'trial') {
      return profile.trial_searches_used < 5;
    }

    const tierLimits = {
      standard: 15,
      premium: 100,
    };

    const limit = tierLimits[profile.subscription_tier as keyof typeof tierLimits] || 0;
    return profile.monthly_searches_used < limit;
  },

  async getSearchesRemaining(profile: Profile): Promise<number> {
    if (profile.subscription_tier === 'trial') {
      return Math.max(0, 5 - profile.trial_searches_used);
    }

    const tierLimits = {
      standard: 15,
      premium: 100,
    };

    const limit = tierLimits[profile.subscription_tier as keyof typeof tierLimits] || 0;
    return Math.max(0, limit - profile.monthly_searches_used);
  },

  async initiateSearch(
    userId: string,
    profile: Profile,
    params: SearchParams
  ): Promise<Search> {
    const canSearch = await this.canUserSearch(profile);
    if (!canSearch) {
      throw new Error('Insufficient searches remaining');
    }

    const { data: newSearch, error: searchError } = await supabase
      .from('searches')
      .insert({
        user_id: userId,
        search_keywords: params.keywords,
        search_address: params.address,
        latitude: params.latitude,
        longitude: params.longitude,
        radius_km: 5,
        status: 'pending',
      })
      .select()
      .single();

    if (searchError) throw searchError;

    if (profile.subscription_tier === 'trial') {
      await supabase
        .from('profiles')
        .update({ trial_searches_used: profile.trial_searches_used + 1 })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('profiles')
        .update({ monthly_searches_used: profile.monthly_searches_used + 1 })
        .eq('user_id', userId);
    }

    try {
      await axios.post(WEBHOOK_URL, {
        search_id: newSearch.id,
        user_id: userId,
        keywords: params.keywords,
        address: params.address,
        latitude: params.latitude,
        longitude: params.longitude,
        radius_km: 5,
      });

      await supabase
        .from('searches')
        .update({ webhook_sent_at: new Date().toISOString() })
        .eq('id', newSearch.id);
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);

      await supabase
        .from('searches')
        .update({
          status: 'failed',
          error_message: 'Failed to send webhook request',
        })
        .eq('id', newSearch.id);

      if (profile.subscription_tier === 'trial') {
        await supabase
          .from('profiles')
          .update({ trial_searches_used: profile.trial_searches_used })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('profiles')
          .update({ monthly_searches_used: profile.monthly_searches_used })
          .eq('user_id', userId);
      }

      throw new Error('Failed to initiate search');
    }

    return newSearch;
  },

  subscribeToSearchUpdates(userId: string, callback: (search: Search) => void) {
    const channel = supabase
      .channel('search-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'searches',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Search);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
