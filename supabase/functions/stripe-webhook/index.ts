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

  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;
    const amountPaid = invoice.amount_paid / 100;

    console.log("handleInvoicePaid: Processing invoice", {
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      amountPaid,
    });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (profileError) {
      console.error("handleInvoicePaid: Profile query error:", profileError);
      throw profileError;
    }

    if (!profile) {
      console.error("handleInvoicePaid: Profile not found for customer:", customerId);
      throw new Error(`Profile not found for customer: ${customerId}`);
    }

    console.log("handleInvoicePaid: Found profile:", {
      userId: profile.user_id,
      email: profile.email,
      currentTier: profile.subscription_tier,
    });

    if (subscriptionId) {
      console.log("handleInvoicePaid: Fetching subscription from Stripe:", subscriptionId);
      
      const response = await fetch(
        `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("handleInvoicePaid: Stripe API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
      }

      const subscription = await response.json();
      console.log("handleInvoicePaid: Got subscription:", {
        id: subscription.id,
        status: subscription.status,
        priceId: subscription.items.data[0]?.price.id,
      });

      const priceId = subscription.items.data[0]?.price.id;

      console.log("handleInvoicePaid: Looking up tier for price:", priceId);

      const { data: tier, error: tierError } = await supabase
        .from("subscription_tiers")
        .select("*")
        .eq("stripe_price_id", priceId)
        .maybeSingle();

      if (tierError) {
        console.error("handleInvoicePaid: Tier query error:", tierError);
        throw tierError;
      }

      if (!tier) {
        console.error("handleInvoicePaid: Tier not found for price:", priceId);
        throw new Error(`Tier not found for price: ${priceId}`);
      }

      console.log("handleInvoicePaid: Found tier:", {
        tierName: tier.tier_name,
        price: tier.price,
      });

      console.log("handleInvoicePaid: Updating profile...");
      const { error: updateError } = await supabase
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

      if (updateError) {
        console.error("handleInvoicePaid: Profile update error:", updateError);
        throw updateError;
      }

      console.log("handleInvoicePaid: Profile updated successfully");

      console.log("handleInvoicePaid: Creating transaction...");
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: profile.user_id,
        transaction_type: "subscription",
        tier_or_pack_name: tier.tier_name,
        amount: amountPaid,
        stripe_payment_id: invoice.payment_intent,
        stripe_subscription_id: subscriptionId,
        status: "completed",
      });

      if (transactionError) {
        console.error("handleInvoicePaid: Transaction insert error:", transactionError);
        throw transactionError;
      }

      console.log("handleInvoicePaid: Transaction created successfully");
    } else {
      // Search pack purchase (no subscription)
      console.log("handleInvoicePaid: Processing search pack purchase");
      
      const priceId = invoice.lines.data[0]?.price.id;
      console.log("handleInvoicePaid: Looking up search pack for price:", priceId);

      const { data: searchPack, error: packError } = await supabase
        .from("additional_search_packs")
        .select("*")
        .eq("stripe_price_id", priceId)
        .maybeSingle();

      if (packError) {
        console.error("handleInvoicePaid: Search pack query error:", packError);
        throw packError;
      }

      if (!searchPack) {
        console.error("handleInvoicePaid: Search pack not found for price:", priceId);
        throw new Error(`Search pack not found for price: ${priceId}`);
      }

      console.log("handleInvoicePaid: Found search pack:", {
        packName: searchPack.pack_name,
        searches: searchPack.searches_count,
      });

      console.log("handleInvoicePaid: Creating transaction for search pack...");
      const { data: transaction, error: transactionError } = await supabase
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

      if (transactionError) {
        console.error("handleInvoicePaid: Transaction insert error:", transactionError);
        throw transactionError;
      }

      if (!transaction) {
        console.error("handleInvoicePaid: Transaction not returned after insert");
        throw new Error("Transaction not returned after insert");
      }

      console.log("handleInvoicePaid: Transaction created, adding search credits...");

      const { error: creditsError } = await supabase.from("user_search_credits").insert({
        user_id: profile.user_id,
        credits_purchased: searchPack.searches_count,
        credits_remaining: searchPack.searches_count,
        purchase_transaction_id: transaction.id,
        expires_at: null,
      });

      if (creditsError) {
        console.error("handleInvoicePaid: Credits insert error:", creditsError);
        throw creditsError;
      }

      console.log("handleInvoicePaid: Updating profile with new credits...");
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          available_search_credits: profile.available_search_credits + searchPack.searches_count,
        })
        .eq("user_id", profile.user_id);

      if (profileUpdateError) {
        console.error("handleInvoicePaid: Profile update error:", profileUpdateError);
        throw profileUpdateError;
      }

      console.log("handleInvoicePaid: Search pack processed successfully");
    }

    console.log("handleInvoicePaid: Completed successfully for invoice:", invoice.id);
  } catch (error) {
    console.error("handleInvoicePaid: FATAL ERROR:", error);
    console.error("handleInvoicePaid: Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      invoiceId: invoice.id,
    });
    throw error; // Re-throw to mark webhook as failed
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Webhook error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorStack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});