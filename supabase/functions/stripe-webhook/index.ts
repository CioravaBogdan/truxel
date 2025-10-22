import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

async function verifyStripeSignature(payload: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
    const sig = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

    if (!timestamp || !sig) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const expectedSig = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    const expectedSigHex = Array.from(new Uint8Array(expectedSig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expectedSigHex === sig;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

async function handleInvoicePaid(invoice: any, supabase: any) {
  console.log("Handling invoice.paid", invoice.id);

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  const amountPaid = invoice.amount_paid / 100;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (profileError || !profile) {
    console.error("Profile not found for customer:", customerId);
    return;
  }

  if (subscriptionId) {
    const response = await fetch(
      `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    const subscription = await response.json();
    const priceId = subscription.items.data[0]?.price.id;

    const { data: tier } = await supabase
      .from("subscription_tiers")
      .select("*")
      .eq("stripe_price_id", priceId)
      .maybeSingle();

    if (tier) {
      await supabase
        .from("profiles")
        .update({
          subscription_tier: tier.tier_name,
          subscription_status: "active",
          stripe_subscription_id: subscriptionId,
          stripe_subscription_status: subscription.status,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          monthly_searches_used: 0,
          subscription_renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq("user_id", profile.user_id);

      await supabase.from("transactions").insert({
        user_id: profile.user_id,
        transaction_type: "subscription",
        tier_or_pack_name: tier.tier_name,
        amount: amountPaid,
        stripe_payment_id: invoice.payment_intent,
        stripe_subscription_id: subscriptionId,
        status: "completed",
      });
    }
  } else {
    const priceId = invoice.lines.data[0]?.price.id;

    const { data: searchPack } = await supabase
      .from("additional_search_packs")
      .select("*")
      .eq("stripe_price_id", priceId)
      .maybeSingle();

    if (searchPack) {
      const { data: transaction } = await supabase
        .from("transactions")
        .insert({
          user_id: profile.user_id,
          transaction_type: "search_pack",
          tier_or_pack_name: searchPack.pack_name,
          amount: amountPaid,
          stripe_payment_id: invoice.payment_intent,
          searches_added: searchPack.searches_count,
          status: "completed",
        })
        .select()
        .single();

      if (transaction) {
        await supabase.from("user_search_credits").insert({
          user_id: profile.user_id,
          credits_purchased: searchPack.searches_count,
          credits_remaining: searchPack.searches_count,
          purchase_transaction_id: transaction.id,
          expires_at: null,
        });

        await supabase
          .from("profiles")
          .update({
            available_search_credits: profile.available_search_credits + searchPack.searches_count,
          })
          .eq("user_id", profile.user_id);
      }
    }
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log("Handling customer.subscription.updated", subscription.id);

  const customerId = subscription.customer;
  const priceId = subscription.items.data[0]?.price.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) return;

  const { data: tier } = await supabase
    .from("subscription_tiers")
    .select("*")
    .eq("stripe_price_id", priceId)
    .maybeSingle();

  if (tier) {
    const updates: any = {
      stripe_subscription_status: subscription.status,
      stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      subscription_renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
    };

    if (subscription.status === "active") {
      updates.subscription_tier = tier.tier_name;
      updates.subscription_status = "active";
      updates.monthly_searches_used = 0;
    }

    if (subscription.cancel_at_period_end) {
      updates.subscription_status = "cancelled";
    }

    await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", profile.user_id);
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log("Handling customer.subscription.deleted", subscription.id);

  const customerId = subscription.customer;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({
      subscription_tier: "trial",
      subscription_status: "expired",
      stripe_subscription_id: null,
      stripe_subscription_status: null,
      stripe_current_period_end: null,
      monthly_searches_used: 0,
      trial_searches_used: 0,
    })
    .eq("user_id", profile.user_id);
}

async function handlePaymentFailed(invoice: any, supabase: any) {
  console.log("Handling invoice.payment_failed", invoice.id);

  const customerId = invoice.customer;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      stripe_subscription_status: "past_due",
    })
    .eq("user_id", profile.user_id);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload = await req.text();
    const isValid = await verifyStripeSignature(payload, signature);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const event: StripeEvent = JSON.parse(payload);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { data: existingEvent } = await supabase
      .from("stripe_webhook_events")
      .select("*")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingEvent?.processed) {
      console.log("Event already processed:", event.id);
      return new Response(
        JSON.stringify({ received: true, message: "Already processed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
    });

    switch (event.type) {
      case "invoice.paid":
        await handleInvoicePaid(event.data.object, supabase);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, supabase);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }

    await supabase
      .from("stripe_webhook_events")
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("stripe_event_id", event.id);

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});