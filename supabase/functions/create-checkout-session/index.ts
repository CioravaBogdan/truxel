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

interface CheckoutRequest {
  priceId: string;
  type: "subscription" | "search_pack";
  successUrl: string;
  cancelUrl: string;
  couponCode?: string; // Optional coupon code
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

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: CheckoutRequest = await req.json();
    const { priceId, type, successUrl, cancelUrl, couponCode } = body;

    console.log('create-checkout-session: Request params', { type, priceId, couponCode });

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      console.log('Creating new Stripe customer for user:', user.id);
      
      const customerData = new URLSearchParams({
        email: profile.email,
        name: profile.full_name || profile.email,
        'metadata[user_id]': user.id,
        'metadata[profile_id]': profile.id,
      });

      const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: customerData,
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.json();
        console.error('Stripe customer creation failed:', error);
        throw new Error(error.error?.message || 'Failed to create customer');
      }

      const customer = await customerResponse.json();
      customerId = customer.id;

      console.log('Stripe customer created:', customerId);

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    } else {
      console.log('Using existing Stripe customer:', customerId);
    }

    const sessionParams: any = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: type === "subscription" ? "subscription" : "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        profile_id: profile.id,
        type: type,
      },
    };

    if (type === "subscription") {
      sessionParams.subscription_data = {
        metadata: {
          user_id: user.id,
          profile_id: profile.id,
        },
      };
    }

    console.log('Creating Stripe checkout session for customer:', customerId);

    // Build URLSearchParams for Stripe API
    const sessionData = new URLSearchParams({
      customer: customerId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      mode: type === "subscription" ? "subscription" : "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      'metadata[user_id]': user.id,
      'metadata[profile_id]': profile.id,
      'metadata[type]': type,
    });

    // Apply coupon if provided
    if (couponCode) {
      console.log('Applying coupon code:', couponCode);
      sessionData.append('discounts[0][coupon]', couponCode.toUpperCase());
    }

    if (type === "subscription") {
      sessionData.append('subscription_data[metadata][user_id]', user.id);
      sessionData.append('subscription_data[metadata][profile_id]', profile.id);
    }

    const sessionResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: sessionData,
      }
    );

    if (!sessionResponse.ok) {
      const error = await sessionResponse.json();
      console.error('Stripe session creation failed:', error);
      throw new Error(error.error?.message || 'Failed to create checkout session');
    }

    const session = await sessionResponse.json();

    console.log('Checkout session created:', session.id);

    if (session.error) {
      throw new Error(session.error.message);
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout session error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});