import { supabase } from '@/lib/supabase';
import { SubscriptionTierData, AdditionalSearchPack } from '@/types/database.types';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey;

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
    try {
      // Use REST API directly as Supabase client query hangs
      // Use Constants for production build compatibility
      const url = SUPABASE_URL || 'https://upxocyomsfhqoflwibwn.supabase.co';
      const key = SUPABASE_ANON_KEY;
      
      if (!key) {
        throw new Error('Supabase anon key not configured');
      }
      
      const response = await fetch(
        `${url}/rest/v1/subscription_tiers?tier_name=neq.trial&order=price.asc`,
        {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (err) {
      console.error('stripeService: Exception in getAvailableSubscriptionTiers:', err);
      throw err;
    }
  },

  async getAvailableSearchPacks(): Promise<AdditionalSearchPack[]> {
    try {
      // Use REST API directly as Supabase client query hangs
      // Use Constants for production build compatibility
      const url = SUPABASE_URL || 'https://upxocyomsfhqoflwibwn.supabase.co';
      const key = SUPABASE_ANON_KEY;
      
      if (!key) {
        throw new Error('Supabase anon key not configured');
      }
      
      const response = await fetch(
        `${url}/rest/v1/additional_search_packs?order=price.asc`,
        {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
        }
      );

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (err) {
      console.error('stripeService: Exception in getAvailableSearchPacks:', err);
      throw err;
    }
  },

  async validateCoupon(
    couponCode: string,
    accessToken?: string
  ): Promise<{ valid: boolean; coupon?: any; error?: string }> {

    if (!accessToken) {
      throw new Error('Not authenticated - access token required');
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/validate-coupon`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ couponCode }),
        }
      );


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate coupon');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('stripeService: Validate coupon error:', error);
      throw error;
    }
  },

  async createCheckoutSession(
    priceId: string,
    type: 'subscription' | 'search_pack',
    successUrl: string,
    cancelUrl: string,
    accessToken?: string,
    couponCode?: string
  ): Promise<CheckoutSessionResponse> {

    if (!accessToken) {
      throw new Error('Not authenticated - access token required');
    }

    // Use HTTPS URLs instead of custom scheme for better compatibility
    // These will show a simple HTML page with auto-redirect back to app
    const finalSuccessUrl = 'https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-redirect?status=success&type=' + type;
    const finalCancelUrl = 'https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-redirect?status=cancelled&type=' + type;

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          priceId,
          type,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
          couponCode, // Include coupon code if provided
        }),
      }
    );


    if (!response.ok) {
      const error = await response.json();
      console.error('stripeService: Checkout session error:', error);
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const result = await response.json();
    return result;
  },

  async cancelSubscription(accessToken?: string): Promise<ManageSubscriptionResponse> {

    if (!accessToken) {
      throw new Error('Not authenticated - access token required');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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

  async reactivateSubscription(accessToken?: string): Promise<ManageSubscriptionResponse> {
    console.log('stripeService: reactivateSubscription called');

    if (!accessToken) {
      throw new Error('Not authenticated - access token required');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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

  async upgradeSubscription(newPriceId: string, accessToken?: string): Promise<ManageSubscriptionResponse> {
    console.log('stripeService: upgradeSubscription called', { newPriceId });

    if (!accessToken) {
      throw new Error('Not authenticated - access token required');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'upgrade',
          newPriceId,
        }),
      }
    );

    console.log('stripeService: Upgrade response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('stripeService: Upgrade error:', error);
      throw new Error(error.error || 'Failed to upgrade subscription');
    }

    const result = await response.json();
    console.log('stripeService: Upgrade success:', result);
    return result;
  },

  async downgradeSubscription(newPriceId: string, accessToken?: string): Promise<ManageSubscriptionResponse> {
    console.log('stripeService: downgradeSubscription called', { newPriceId });

    if (!accessToken) {
      throw new Error('Not authenticated - access token required');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'downgrade',
          newPriceId,
        }),
      }
    );

    console.log('stripeService: Downgrade response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('stripeService: Downgrade error:', error);
      throw new Error(error.error || 'Failed to downgrade subscription');
    }

    const result = await response.json();
    console.log('stripeService: Downgrade success:', result);
    return result;
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
