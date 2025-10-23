import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface ManageSubscriptionRequest {
  action: "cancel" | "reactivate" | "upgrade" | "downgrade";
  newPriceId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || !profile.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: ManageSubscriptionRequest = await req.json();
    const { action, newPriceId } = body;

    switch (action) {
      case "cancel": {
        const cancelResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${profile.stripe_subscription_id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              cancel_at_period_end: "true",
            }),
          }
        );

        const subscription = await cancelResponse.json();

        await supabase
          .from("profiles")
          .update({
            subscription_status: "cancelled",
          })
          .eq("user_id", user.id);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Subscription will be cancelled at period end",
            subscription,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "reactivate": {
        const reactivateResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${profile.stripe_subscription_id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              cancel_at_period_end: "false",
            }),
          }
        );

        const subscription = await reactivateResponse.json();

        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
          })
          .eq("user_id", user.id);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Subscription reactivated",
            subscription,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "upgrade":
      case "downgrade": {
        if (!newPriceId) {
          return new Response(
            JSON.stringify({ error: "newPriceId is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const subscriptionResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${profile.stripe_subscription_id}`,
          {
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            },
          }
        );

        const subscription = await subscriptionResponse.json();
        const subscriptionItemId = subscription.items.data[0].id;

        // Stripe requires specific format for nested parameters
        const updateParams = new URLSearchParams();
        updateParams.append("items[0][id]", subscriptionItemId);
        updateParams.append("items[0][price]", newPriceId);

        if (action === "upgrade") {
          updateParams.append("proration_behavior", "always_invoice");
        } else {
          updateParams.append("proration_behavior", "none");
        }

        const updateResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${profile.stripe_subscription_id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: updateParams,
          }
        );

        const updatedSubscription = await updateResponse.json();

        if (updatedSubscription.error) {
          throw new Error(updatedSubscription.error.message);
        }

        const { data: newTier } = await supabase
          .from("subscription_tiers")
          .select("*")
          .eq("stripe_price_id", newPriceId)
          .maybeSingle();

        if (newTier) {
          await supabase
            .from("profiles")
            .update({
              subscription_tier: newTier.tier_name,
              monthly_searches_used: 0,
              available_search_credits: newTier.searches_per_month, // FIX: Update search credits
            })
            .eq("user_id", user.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Subscription ${action}d successfully`,
            subscription: updatedSubscription,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Manage subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});