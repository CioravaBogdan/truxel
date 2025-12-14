import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevenueCatEvent {
  api_version: string;
  event: {
    type: string;
    id: string;
    app_user_id: string;
    aliases: string[];
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number | null;
    environment: string;
    presented_offering_id: string | null;
    transaction_id: string;
    original_transaction_id: string;
    is_trial_conversion: boolean;
    store: string;
    takehome_percentage: number;
    currency: string;
    price: number;
    price_in_purchased_currency: number;
    subscriber_attributes: Record<string, any>;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authorization (optional - RevenueCat doesn't require it, but good practice)
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      console.log('✅ Authorization header present');
    } else {
      console.log('ℹ️ No authorization header (RevenueCat test events don\'t include it)');
    }

    // Initialize Supabase client (using SERVICE_ROLE_KEY to bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse webhook payload
    const payload: RevenueCatEvent = await req.json();
    console.log('📦 RevenueCat Webhook Received:', {
      type: payload.event.type,
      userId: payload.event.app_user_id,
      productId: payload.event.product_id,
      entitlements: payload.event.entitlement_ids,
    });

    const event = payload.event;
    const userId = event.app_user_id;

    // Map RevenueCat entitlements to Truxel subscription tiers
    // Order matters! Check highest tier first
    const getTierFromEntitlements = (entitlements: string[]): string => {
      if (entitlements.includes('pro_freighter_access')) return 'pro_freighter';
      if (entitlements.includes('pro_access')) return 'pro';
      if (entitlements.includes('fleet_manager_access')) return 'fleet_manager';
      if (entitlements.includes('standard_access')) return 'standard';
      return 'trial';
    };
    
    // Get searches per month for each tier
    const getSearchesForTier = (tier: string): number => {
      const searchLimits: Record<string, number> = {
        'pro_freighter': 50,
        'pro': 50,
        'fleet_manager': 30,
        'standard': 30,
        'trial': 5,
      };
      return searchLimits[tier] || 5;
    };

    // Handle different event types
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE': {
        const tier = getTierFromEntitlements(event.entitlement_ids);
        const searchCredits = getSearchesForTier(tier);
        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null;

        console.log(`✅ Updating subscription: userId=${userId}, tier=${tier}, searchCredits=${searchCredits}`);

        // Update profile with new subscription
        // - Reset monthly_searches_used to 0 on new subscription/renewal/upgrade
        // - Set available_search_credits based on tier
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_renewal_date: expiresAt,
            subscription_start_date: new Date().toISOString(),
            monthly_searches_used: 0, // Reset on subscription change
            available_search_credits: searchCredits, // Set based on tier
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (profileError) {
          console.error('❌ Error updating profile:', profileError);
          throw profileError;
        }

        // Add BONUS search credits if search pack purchased (on top of tier credits)
        if (event.entitlement_ids.includes('search_credits')) {
          const bonusCredits = event.product_id.includes('25') ? 25 : 10;

          const { error: creditsError } = await supabase.rpc('increment_search_credits', {
            p_user_id: userId,
            p_credits: bonusCredits,
          });

          if (creditsError) {
            console.warn('⚠️ Error adding bonus search credits:', creditsError);
          } else {
            console.log(`✅ Added ${bonusCredits} bonus search credits to user ${userId}`);
          }
        }

        // Log transaction
        const { error: transactionError } = await supabase.from('transactions').insert({
          user_id: userId,
          transaction_type: event.product_id.includes('onetime') ? 'search_pack' : 'subscription',
          tier_or_pack_name: tier,
          amount: event.price_in_purchased_currency / 100, // Convert cents to dollars
          stripe_payment_id: event.transaction_id,
          status: 'completed',
        });

        if (transactionError) {
          console.warn('⚠️ Error logging transaction:', transactionError);
        }

        break;
      }

      case 'CANCELLATION': {
        console.log(`⚠️ Subscription cancelled: userId=${userId}`);

        // Mark subscription as cancelled (but keep access until expiry)
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Error updating cancellation:', error);
          throw error;
        }

        break;
      }

      case 'EXPIRATION': {
        console.log(`❌ Subscription expired: userId=${userId}`);

        // Downgrade to trial tier
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'trial',
            subscription_status: 'expired',
            subscription_renewal_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Error updating expiration:', error);
          throw error;
        }

        break;
      }

      case 'BILLING_ISSUE': {
        console.log(`⚠️ Billing issue: userId=${userId}`);

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Error updating billing issue:', error);
          throw error;
        }

        break;
      }

      case 'TEST': {
        console.log(`🧪 Test event received: userId=${userId}`);
        // Simply acknowledge test events without database changes
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_type: event.type,
        user_id: userId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Webhook error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
