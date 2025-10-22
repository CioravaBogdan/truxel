import { supabase } from '@/lib/supabase';
import { SubscriptionTierData, AdditionalSearchPack } from '@/types/database.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface ManageSubscriptionResponse {
  success: boolean;
  message: string;
  subscription?: any;
}

export const stripeService = {
  async getAvailableSubscriptionTiers(): Promise<SubscriptionTierData[]> {
    console.log('stripeService: Starting getAvailableSubscriptionTiers...');
    try {
      // Use REST API directly as Supabase client query hangs
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://upxocyomsfhqoflwibwn.supabase.co';
      const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/subscription_tiers?tier_name=neq.trial&order=price.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      console.log('stripeService: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('stripeService: Returning', data?.length || 0, 'tiers');
      return data || [];
    } catch (err) {
      console.error('stripeService: Exception in getAvailableSubscriptionTiers:', err);
      throw err;
    }
  },

  async getAvailableSearchPacks(): Promise<AdditionalSearchPack[]> {
    console.log('stripeService: Starting getAvailableSearchPacks...');
    try {
      // Use REST API directly as Supabase client query hangs
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://upxocyomsfhqoflwibwn.supabase.co';
      const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/additional_search_packs?order=price.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      console.log('stripeService: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('stripeService: Returning', data?.length || 0, 'packs');
      return data || [];
    } catch (err) {
      console.error('stripeService: Exception in getAvailableSearchPacks:', err);
      throw err;
    }
  },

  async createCheckoutSession(
    priceId: string,
    type: 'subscription' | 'search_pack',
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId,
          type,
          successUrl,
          cancelUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    return await response.json();
  },

  async cancelSubscription(): Promise<ManageSubscriptionResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'cancel',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
    }

    return await response.json();
  },

  async reactivateSubscription(): Promise<ManageSubscriptionResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'reactivate',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reactivate subscription');
    }

    return await response.json();
  },

  async upgradeSubscription(newPriceId: string): Promise<ManageSubscriptionResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'upgrade',
          newPriceId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upgrade subscription');
    }

    return await response.json();
  },

  async downgradeSubscription(newPriceId: string): Promise<ManageSubscriptionResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'downgrade',
          newPriceId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to downgrade subscription');
    }

    return await response.json();
  },

  async getSearchCreditsBreakdown(userId: string) {
    const { data, error } = await supabase
      .rpc('get_total_search_credits', { p_user_id: userId });

    if (error) throw error;

    return {
      purchasedCredits: data[0]?.purchased_credits || 0,
      subscriptionSearchesRemaining: data[0]?.subscription_searches_remaining || 0,
      totalAvailable: data[0]?.total_available || 0,
    };
  },

  async getPurchaseHistory(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return false;

    return (
      data.subscription_tier !== 'trial' &&
      (data.subscription_status === 'active' || data.subscription_status === 'cancelled')
    );
  },
};
