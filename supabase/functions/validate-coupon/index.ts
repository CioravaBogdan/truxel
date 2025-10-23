import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('validate-coupon: Request received');

    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Parse request body
    const { couponCode } = await req.json();
    console.log('validate-coupon: Validating coupon code:', couponCode);

    if (!couponCode || typeof couponCode !== 'string') {
      throw new Error('Invalid coupon code');
    }

    // Validate coupon with Stripe
    let coupon: Stripe.Coupon;
    try {
      coupon = await stripe.coupons.retrieve(couponCode.toUpperCase());
      console.log('validate-coupon: Coupon retrieved from Stripe:', coupon.id);
    } catch (error: any) {
      console.error('validate-coupon: Stripe error:', error.message);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid or expired coupon code' 
        }),
        {
          status: 200, // Return 200 with valid: false instead of error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if coupon is valid (active and not expired)
    if (!coupon.valid) {
      console.log('validate-coupon: Coupon is not valid');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Coupon has expired or is no longer valid' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check redeem_by date if exists
    if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
      console.log('validate-coupon: Coupon redemption period has passed');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Coupon redemption period has passed' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check max_redemptions
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      console.log('validate-coupon: Coupon has reached maximum redemptions');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Coupon has reached its usage limit' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate discount display
    let discountText = '';
    if (coupon.percent_off) {
      discountText = `${coupon.percent_off}% OFF`;
    } else if (coupon.amount_off && coupon.currency) {
      const amount = (coupon.amount_off / 100).toFixed(2);
      discountText = `€${amount} OFF`;
    }

    // Return valid coupon info
    console.log('validate-coupon: Coupon is valid:', discountText);
    return new Response(
      JSON.stringify({
        valid: true,
        coupon: {
          id: coupon.id,
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          currency: coupon.currency,
          duration: coupon.duration,
          duration_in_months: coupon.duration_in_months,
          name: coupon.name,
          discount_text: discountText,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('validate-coupon: Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
