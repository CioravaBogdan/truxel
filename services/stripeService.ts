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
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .neq('tier_name', 'trial')
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAvailableSearchPacks(): Promise<AdditionalSearchPack[]> {
    const { data, error } = await supabase
      .from('additional_search_packs')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
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
