import { supabase } from '@/lib/supabase';
import { Search, Profile } from '@/types/database.types';
import axios from 'axios';
import Constants from 'expo-constants';

// N8N webhook URL from environment variables
const WEBHOOK_URL = Constants.expoConfig?.extra?.n8nSearchWebhook || 'https://automation.truxel.io/webhook/51f66c9a-0283-4711-b034-337c66e1bedd';

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

  async canUserSearch(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('get_total_search_credits', {
      p_user_id: userId,
    });

    if (error || !data || data.length === 0) return false;

    return data[0].total_available > 0;
  },

  async getSearchesRemaining(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_total_search_credits', {
      p_user_id: userId,
    });

    if (error || !data || data.length === 0) return 0;

    return data[0].total_available || 0;
  },

  async getSearchCreditsBreakdown(userId: string) {
    const { data, error } = await supabase.rpc('get_total_search_credits', {
      p_user_id: userId,
    });

    if (error || !data || data.length === 0) {
      return {
        purchasedCredits: 0,
        subscriptionSearchesRemaining: 0,
        totalAvailable: 0,
      };
    }

    return {
      purchasedCredits: data[0].purchased_credits || 0,
      subscriptionSearchesRemaining: data[0].subscription_searches_remaining || 0,
      totalAvailable: data[0].total_available || 0,
    };
  },

  async getTierFeatures(tierName: string) {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('tier_name', tierName)
      .maybeSingle();

    if (error || !data) {
      return {
        linkedinEnabled: false,
        aiMatchingEnabled: false,
        advancedResearchEnabled: false,
        maxResultsPerSearch: 10,
      };
    }

    return {
      linkedinEnabled: data.linkedin_enabled,
      aiMatchingEnabled: data.ai_matching_enabled,
      advancedResearchEnabled: data.advanced_research_enabled,
      maxResultsPerSearch: data.max_results_per_search,
    };
  },

  async initiateSearch(
    userId: string,
    profile: Profile,
    params: SearchParams
  ): Promise<Search> {
    const canSearch = await this.canUserSearch(userId);
    if (!canSearch) {
      throw new Error('Insufficient searches remaining');
    }

    const { data: consumeResult, error: consumeError } = await supabase.rpc(
      'consume_search_credit',
      { p_user_id: userId }
    );

    if (consumeError || !consumeResult || consumeResult.length === 0 || !consumeResult[0].success) {
      throw new Error('Failed to consume search credit');
    }

    const creditSource = consumeResult[0].credit_source;

    const { data: newSearch, error: searchError } = await supabase
      .from('searches')
      .insert({
        user_id: userId,
        search_keywords: params.keywords,
        search_address: params.address,
        latitude: params.latitude,
        longitude: params.longitude,
        radius_km: profile.search_radius_km || 5,
        status: 'pending',
      })
      .select()
      .single();

    if (searchError) throw searchError;

    const tierFeatures = await this.getTierFeatures(profile.subscription_tier);

    const webhookPayload = {
      search_id: newSearch.id,
      user_id: userId,
      keywords: params.keywords,
      address: params.address,
      latitude: params.latitude,
      longitude: params.longitude,
      radius_km: profile.search_radius_km || 5,
      tier: profile.subscription_tier,
      features: tierFeatures,
      credit_source: creditSource,
    };

    try {
      console.log('🚀 Sending webhook to n8n:', WEBHOOK_URL);
      console.log('📦 Webhook payload:', JSON.stringify(webhookPayload, null, 2));

      // n8n webhook is configured for POST method (confirmed in n8n UI)
      const response = await axios.post(WEBHOOK_URL, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('✅ Webhook response status:', response.status);
      console.log('📥 Webhook response data:', response.data);

      await supabase
        .from('searches')
        .update({ webhook_sent_at: new Date().toISOString() })
        .eq('id', newSearch.id);
    } catch (webhookError: any) {
      console.error('❌ Webhook error:', webhookError);
      console.error('📋 Error details:', {
        message: webhookError.message,
        code: webhookError.code,
        response: webhookError.response?.data,
        status: webhookError.response?.status,
      });

      await supabase
        .from('searches')
        .update({
          status: 'failed',
          error_message: `Failed to send webhook request: ${webhookError.message}`,
        })
        .eq('id', newSearch.id);

      throw new Error(`Failed to initiate search: ${webhookError.message}`);
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
