// @ts-nocheck
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
    event_timestamp_ms?: number;
    app_user_id: string;
    aliases: string[];
    original_app_user_id: string;
    product_id: string;
    new_product_id?: string | null;
    entitlement_ids: string[] | null;
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
    price: number | null;
    price_in_purchased_currency: number | null;
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
      newProductId: payload.event.new_product_id,
      entitlements: payload.event.entitlement_ids,
    });

    const event = payload.event;
    const incomingAppUserId = event.app_user_id;
    const entitlements = event.entitlement_ids ?? [];

    const isUuid = (value: string): boolean =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

    const resolveSupabaseUserId = (evt: RevenueCatEvent['event']): string | null => {
      if (isUuid(evt.app_user_id)) return evt.app_user_id;
      if (Array.isArray(evt.aliases)) {
        const aliasUuid = evt.aliases.find(isUuid);
        if (aliasUuid) return aliasUuid;
      }
      if (isUuid(evt.original_app_user_id)) return evt.original_app_user_id;
      return null;
    };

    const resolvedUserId = resolveSupabaseUserId(event);
    const userId = resolvedUserId ?? incomingAppUserId;

    let skipReason: string | null = null;

    // For PRODUCT_CHANGE, RevenueCat includes new_product_id (the new plan).
    // Prefer it when present to avoid mapping the *old* product_id.
    const productIdForTier = (event.new_product_id ?? '').trim() || event.product_id;

    // Map RevenueCat entitlements to Truxel subscription tiers
    // Order matters! Check highest tier first
    const getTierFromEntitlements = (entitlements: string[]): string => {
      if (entitlements.includes('pro_freighter_access')) return 'pro_freighter';
      if (entitlements.includes('pro_access')) return 'pro';
      if (entitlements.includes('fleet_manager_access')) return 'fleet_manager';
      if (entitlements.includes('standard_access')) return 'standard';
      return 'trial';
    };

    // Prefer mapping from product_id when present (more reliable at purchase time than entitlements)
    // RevenueCat sends store product IDs (e.g. truxel_4999_1month) in event.product_id.
    const getTierFromProductId = (productId: string | null | undefined): string | null => {
      if (!productId) return null;
      const id = productId.toLowerCase();

      const mapping: Record<string, string> = {
        // iOS (App Store Connect)
        'truxel_2999_1month': 'standard',
        'truxel_4999_1month': 'pro',
        'truxel_2999_fleet_1month': 'fleet_manager',
        'truxel_4999_profreighter_1month': 'pro_freighter',
        'truxel_4999_frighter_1month': 'pro_freighter', // historical typo

        // Search pack add-on (one-time)
        'truxel_2499_onetime': 'search_pack',
        'one_time_25_searches': 'search_pack',
        'truxel_search_pack_25': 'search_pack',

        // Android (Play)
        'truxel_standard_monthly': 'standard',
        'truxel_pro_monthly': 'pro',
        'truxel_fleet_manager_monthly': 'fleet_manager',
        'truxel_pro_freighter_monthly': 'pro_freighter',
      };

      if (mapping[id]) return mapping[id];

      // Heuristics fallback
      if (id.includes('pro_freighter') || id.includes('profreighter') || id.includes('frighter')) return 'pro_freighter';
      if (id.includes('fleet')) return 'fleet_manager';
      if (id.includes('4999') || id.includes('49.99') || id.includes('pro')) return 'pro';
      if (id.includes('2999') || id.includes('29.99') || id.includes('standard')) return 'standard';
      if (id.includes('onetime') || id.includes('search') || id.includes('credits')) return 'search_pack';
      return null;
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
        if (!resolvedUserId) {
          console.warn('⚠️ Skipping DB update: could not resolve UUID for RevenueCat user', {
            app_user_id: incomingAppUserId,
            original_app_user_id: event.original_app_user_id,
            aliases: event.aliases,
          });
          skipReason = 'non_uuid_app_user_id';
          break;
        }

        const productTier = getTierFromProductId(productIdForTier);

        // ✅ One-time search packs should NOT reset subscription usage or change tier.
        // They should only add purchased credits.
        if (productTier === 'search_pack') {
          const bonusCredits = productIdForTier.includes('25') ? 25 : 10;

          console.log(`✅ Handling search pack purchase: userId=${userId}, credits=${bonusCredits}, productIdUsed=${productIdForTier}`);

          // Log transaction first (best-effort)
          const amount = event.price_in_purchased_currency ?? event.price ?? 0;
          const { data: txnRows, error: transactionError } = await supabase
            .from('transactions')
            .insert({
              user_id: userId,
              transaction_type: 'search_pack',
              tier_or_pack_name: 'search_pack',
              amount,
              stripe_payment_id: event.transaction_id,
              status: 'completed',
            })
            .select('id')
            .limit(1);

          if (transactionError) {
            console.warn('⚠️ Error logging search pack transaction:', transactionError);
          }

          // Best-effort: store RevenueCat identifiers for audit/debugging
          try {
            await supabase
              .from('profiles')
              .update({
                revenuecat_customer_id: event.original_app_user_id,
                revenuecat_app_user_id: incomingAppUserId,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
          } catch (e) {
            console.warn('⚠️ Error updating RevenueCat IDs on profile after search pack purchase:', e);
          }

          const purchaseTransactionId = txnRows?.[0]?.id ?? null;

          const { error: creditInsertError } = await supabase.from('user_search_credits').insert({
            user_id: userId,
            credits_purchased: bonusCredits,
            credits_remaining: bonusCredits,
            purchase_transaction_id: purchaseTransactionId,
            expires_at: null,
          });

          if (creditInsertError) {
            console.warn('⚠️ Error inserting user_search_credits row:', creditInsertError);
          } else {
            console.log(`✅ Added ${bonusCredits} purchased search credits to user ${userId}`);
          }

          // Update cached available_search_credits (best-effort) so UI can reflect it
          const { data: creditTotals, error: totalsError } = await supabase.rpc('get_total_search_credits', {
            p_user_id: userId,
          });

          if (totalsError) {
            console.warn('⚠️ Error fetching total search credits after pack purchase:', totalsError);
          } else {
            const totalAvailable = creditTotals?.[0]?.total_available ?? null;
            if (typeof totalAvailable === 'number') {
              const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({
                  available_search_credits: totalAvailable,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

              if (profileUpdateError) {
                console.warn('⚠️ Error updating available_search_credits after pack purchase:', profileUpdateError);
              }
            }
          }

          break;
        }

        const entitlementTier = getTierFromEntitlements(entitlements);
        const tier = productTier && productTier !== 'search_pack' ? productTier : entitlementTier;
        const searchCredits = getSearchesForTier(tier);
        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null;

        console.log(`✅ Updating subscription: userId=${userId}, tier=${tier}, productTier=${productTier ?? 'null'}, entitlementTier=${entitlementTier}, searchCredits=${searchCredits}, productIdUsed=${productIdForTier}, productId=${event.product_id}, newProductId=${event.new_product_id ?? 'null'}`);

        // First check if user exists
        const { data: existingUser, error: lookupError } = await supabase
          .from('profiles')
          .select('user_id, email, subscription_tier')
          .eq('user_id', userId)
          .single();
        
        if (lookupError || !existingUser) {
          console.error(`❌ User not found in profiles: userId=${userId}, error:`, lookupError);
          // Try to find by email from subscriber_attributes
          console.log('🔍 subscriber_attributes:', JSON.stringify(event.subscriber_attributes));
        } else {
          console.log(`✅ Found user: ${existingUser.email}, current tier: ${existingUser.subscription_tier}`);
        }

        // Update profile with new subscription
        // - Reset monthly_searches_used to 0 on new subscription/renewal/upgrade
        // - Set available_search_credits based on tier
        const { error: profileError, count } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_renewal_date: expiresAt,
            subscription_start_date: new Date().toISOString(),
            monthly_searches_used: 0, // Reset on subscription change
            available_search_credits: searchCredits, // Set based on tier
            revenuecat_customer_id: event.original_app_user_id,
            revenuecat_app_user_id: incomingAppUserId,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (profileError) {
          console.error('❌ Error updating profile:', profileError);
          throw profileError;
        }
        
        console.log(`✅ Profile update completed. Rows affected: ${count ?? 'unknown'}`);

        // ✅ Ensure cached available_search_credits reflects TOTAL credits (subscription remaining + purchased packs).
        // The tier-based value can undercount if the user has purchased search packs.
        try {
          const { data: creditTotals, error: totalsError } = await supabase.rpc('get_total_search_credits', {
            p_user_id: userId,
          });

          if (totalsError) {
            console.warn('⚠️ Error fetching total search credits after subscription update:', totalsError);
          } else {
            const totalAvailable = creditTotals?.[0]?.total_available;
            if (typeof totalAvailable === 'number') {
              const { error: cacheUpdateError } = await supabase
                .from('profiles')
                .update({
                  available_search_credits: totalAvailable,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

              if (cacheUpdateError) {
                console.warn('⚠️ Error updating cached available_search_credits after subscription update:', cacheUpdateError);
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Unexpected error refreshing cached credits after subscription update:', e);
        }

        // Add BONUS search credits if an entitlement grants them (on top of tier credits)
        // Note: one-time search packs are handled earlier (productTier === 'search_pack').
        if (entitlements.includes('search_credits')) {
          console.log('ℹ️ search_credits entitlement active; pack purchases are handled separately');
        }

        // Log transaction
        const amount = event.price_in_purchased_currency ?? event.price ?? 0;
        const { error: transactionError } = await supabase.from('transactions').insert({
          user_id: userId,
          transaction_type: productIdForTier.includes('onetime') ? 'search_pack' : 'subscription',
          tier_or_pack_name: tier,
          amount,
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

        if (!resolvedUserId) {
          console.warn('⚠️ Skipping cancellation DB update: could not resolve UUID for RevenueCat user', {
            app_user_id: incomingAppUserId,
            original_app_user_id: event.original_app_user_id,
            aliases: event.aliases,
          });
          skipReason = 'non_uuid_app_user_id';
          break;
        }

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

        if (!resolvedUserId) {
          console.warn('⚠️ Skipping expiration DB update: could not resolve UUID for RevenueCat user', {
            app_user_id: incomingAppUserId,
            original_app_user_id: event.original_app_user_id,
            aliases: event.aliases,
          });
          skipReason = 'non_uuid_app_user_id';
          break;
        }

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

        if (!resolvedUserId) {
          console.warn('⚠️ Skipping billing-issue DB update: could not resolve UUID for RevenueCat user', {
            app_user_id: incomingAppUserId,
            original_app_user_id: event.original_app_user_id,
            aliases: event.aliases,
          });
          skipReason = 'non_uuid_app_user_id';
          break;
        }

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

    const responseBody: Record<string, unknown> = {
      success: true,
      event_type: event.type,
      user_id: userId,
    };

    if (skipReason) {
      responseBody.skipped = true;
      responseBody.skip_reason = skipReason;
    }

    // Helpful for smoke testing without relying on Edge logs.
    if (event.type !== 'TEST') {
      responseBody.product_id = event.product_id;
      responseBody.new_product_id = event.new_product_id ?? null;
      responseBody.product_id_used = productIdForTier;
      responseBody.entitlements = entitlements;
      responseBody.revenuecat_app_user_id = incomingAppUserId;
      responseBody.revenuecat_customer_id = event.original_app_user_id;
    }

    return new Response(
      JSON.stringify(responseBody),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Webhook error:', error);

    const errorMessage = (() => {
      if (error instanceof Error) return error.message;
      try {
        return JSON.stringify(error);
      } catch {
        return String(error);
      }
    })();

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
