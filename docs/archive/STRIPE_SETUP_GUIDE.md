# Stripe Integration Setup Guide

This guide explains how to set up and configure the complete Stripe integration for subscription management and payment processing in the Truxel application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Stripe Account Setup](#stripe-account-setup)
4. [Creating Products and Prices](#creating-products-and-prices)
5. [Webhook Configuration](#webhook-configuration)
6. [Environment Variables](#environment-variables)
7. [Testing the Integration](#testing-the-integration)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

## Overview

The application uses Stripe for:
- **Recurring Subscriptions**: Standard (€29.99), Pro (€49.99), Premium (€199.99)
- **One-time Purchases**: Additional search packs (10 searches for €24.99)
- **Automated Webhook Processing**: Subscription lifecycle management
- **Credit System**: Priority-based credit consumption (purchased credits → subscription credits)

## Prerequisites

- Stripe account (create at [stripe.com](https://stripe.com))
- Supabase project with Edge Functions enabled
- Access to Supabase project dashboard
- Node.js and npm installed locally

## Stripe Account Setup

### 1. Create a Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Complete the registration process
3. Verify your email address
4. Complete business information (can skip for testing)

### 2. Enable Test Mode

1. In the Stripe Dashboard, ensure you're in **Test Mode** (toggle in top-right)
2. Test mode allows you to test payments without real money

### 3. Get API Keys

1. Navigate to **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Keep these keys secure and never commit them to version control

## Creating Products and Prices

### Option 1: Manual Creation via Dashboard

#### Create Subscription Products

1. Navigate to **Products** → **Add product**

2. **Standard Subscription**:
   - Name: `Standard Subscription`
   - Description: `15 searches per month`
   - Pricing model: `Recurring`
   - Price: `29.99 EUR`
   - Billing period: `Monthly`
   - Copy the **Price ID** (starts with `price_`)

3. **Pro Subscription**:
   - Name: `Pro Subscription`
   - Description: `30 searches with LinkedIn contacts and AI matching`
   - Pricing model: `Recurring`
   - Price: `49.99 EUR`
   - Billing period: `Monthly`
   - Copy the **Price ID**

4. **Premium Subscription**:
   - Name: `Premium Subscription`
   - Description: `100 searches per month with advanced research`
   - Pricing model: `Recurring`
   - Price: `199.99 EUR`
   - Billing period: `Monthly`
   - Copy the **Price ID**

#### Create One-time Products

1. **10 Search Pack**:
   - Name: `10 Search Pack`
   - Description: `10 additional searches`
   - Pricing model: `One-time`
   - Price: `24.99 EUR`
   - Copy the **Price ID**

### Option 2: Using Stripe CLI

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-brew/stripe

# Login to Stripe
stripe login

# Create Standard Subscription
stripe products create --name="Standard Subscription" --description="15 searches per month"
stripe prices create --product=prod_xxx --currency=eur --unit-amount=2999 --recurring-interval=month

# Create Pro Subscription
stripe products create --name="Pro Subscription" --description="30 searches with LinkedIn & AI"
stripe prices create --product=prod_xxx --currency=eur --unit-amount=4999 --recurring-interval=month

# Create Premium Subscription
stripe products create --name="Premium Subscription" --description="100 searches per month"
stripe prices create --product=prod_xxx --currency=eur --unit-amount=19999 --recurring-interval=month

# Create 10 Search Pack
stripe products create --name="10 Search Pack" --description="10 additional searches"
stripe prices create --product=prod_xxx --currency=eur --unit-amount=2499
```

### Update Database with Price IDs

Run this SQL in your Supabase SQL Editor:

```sql
-- Update subscription tiers with Stripe Price IDs
UPDATE subscription_tiers SET stripe_price_id = 'price_xxx_standard' WHERE tier_name = 'standard';
UPDATE subscription_tiers SET stripe_price_id = 'price_xxx_pro' WHERE tier_name = 'pro';
UPDATE subscription_tiers SET stripe_price_id = 'price_xxx_premium' WHERE tier_name = 'premium';

-- Update search packs with Stripe Price IDs
UPDATE additional_search_packs SET stripe_price_id = 'price_xxx_pack' WHERE pack_name = '10_searches_pack';
```

## Webhook Configuration

Webhooks allow Stripe to notify your application about subscription events.

### 1. Get Webhook Endpoint URL

Your Supabase Edge Function webhook endpoint:
```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

Replace `your-project-ref` with your actual Supabase project reference ID.

### 2. Create Webhook in Stripe Dashboard

1. Navigate to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 3. Test Webhook with Stripe CLI

```bash
# Forward webhooks to local development
stripe listen --forward-to https://your-project-ref.supabase.co/functions/v1/stripe-webhook

# Trigger test events
stripe trigger invoice.paid
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
```

## Environment Variables

### Local Development (.env)

Create a `.env` file in your project root:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Supabase Edge Function Secrets

The Stripe keys are automatically available in Edge Functions as environment variables. Supabase manages these secrets securely.

**Important**: Never commit real API keys to version control!

## Testing the Integration

### Test Subscription Flow

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Navigate to Pricing screen** in the app

3. **Click Subscribe** on any tier

4. **Use Stripe test cards**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires authentication: `4000 0025 0000 3155`
   - Any future expiry date and any 3-digit CVC

5. **Verify in Stripe Dashboard**:
   - Check **Customers** → see new customer
   - Check **Subscriptions** → see active subscription
   - Check **Events** → see webhook events

6. **Verify in Supabase**:
   - Check `profiles` table → `subscription_tier` updated
   - Check `transactions` table → payment recorded
   - Check `stripe_webhook_events` table → events logged

### Test Search Pack Purchase

1. Navigate to **Pricing screen**
2. Click **Buy Now** on a search pack
3. Complete checkout with test card
4. Verify credits added in app
5. Perform a search to test credit consumption

### Test Upgrade/Downgrade

1. Subscribe to Standard tier
2. Navigate to Pricing screen
3. Click Subscribe on Pro tier
4. Verify immediate upgrade and prorated charge
5. Check subscription updated in Stripe and Supabase

### Test Cancellation

1. Have an active subscription
2. Use the Stripe Customer Portal or implement cancel button
3. Verify subscription marked as `cancelled` but remains active until period end
4. Verify access maintained until expiration date

## Production Deployment

### 1. Switch to Production Mode

1. In Stripe Dashboard, toggle to **Production mode**
2. Complete Stripe account activation
3. Provide business information and bank details

### 2. Create Production Products

Repeat the product creation process in production mode, or use:
```bash
stripe products create --live ...
stripe prices create --live ...
```

### 3. Update Environment Variables

Update your production environment with:
- Production Stripe keys (`pk_live_`, `sk_live_`)
- Production webhook secret
- Production Supabase URL

### 4. Create Production Webhook

Create a new webhook endpoint in Stripe Dashboard (production mode) pointing to your production URL.

### 5. Update Database

Run the SQL to update `stripe_price_id` fields with production Price IDs.

## Subscription Flow Details

### Credit Consumption Priority

1. **Purchased Credits First**: Credits from search packs are consumed first (FIFO)
2. **Subscription Credits Second**: Monthly subscription searches used after purchased credits exhausted
3. **Automatic Reset**: Subscription credits reset on renewal date

### Subscription Lifecycle

1. **Trial** → User signs up with 5 free searches
2. **Subscribe** → User selects paid tier, redirected to Stripe Checkout
3. **Payment Success** → Webhook `invoice.paid` fires → Profile updated with new tier
4. **Monthly Renewal** → Stripe charges automatically → Webhook resets `monthly_searches_used`
5. **Upgrade** → Immediate tier change + prorated charge
6. **Downgrade** → Scheduled for end of current period
7. **Cancel** → Access maintained until period end → Then reverts to trial

### Webhook Event Handling

| Event | Action |
|-------|--------|
| `invoice.paid` | Update profile tier, reset searches, record transaction |
| `customer.subscription.updated` | Update tier, renewal date, status |
| `customer.subscription.deleted` | Revert to trial, clear subscription ID |
| `invoice.payment_failed` | Mark status as `past_due`, notify user |
| `checkout.session.completed` | Add search pack credits, record transaction |

## Troubleshooting

### Webhook Not Firing

1. Check webhook endpoint is active in Stripe Dashboard
2. Verify URL is correct (no typos)
3. Check Edge Function logs in Supabase Dashboard
4. Test with Stripe CLI: `stripe trigger invoice.paid`

### Payment Failing

1. Verify using correct test card numbers
2. Check Stripe Dashboard → Events for error details
3. Ensure Edge Functions have correct environment variables
4. Check Supabase logs for errors

### Credits Not Added

1. Verify `consume_search_credit` function exists in database
2. Check `user_search_credits` table for entries
3. Verify `available_search_credits` field in profiles
4. Check transaction was recorded in `transactions` table

### Subscription Not Updating

1. Check webhook events in Stripe Dashboard
2. Verify `stripe_webhook_events` table shows event processed
3. Check for errors in Edge Function logs
4. Verify Price IDs match between Stripe and database

### Testing Webhook Signature Verification

The webhook signature verification ensures webhooks are authentic. To test:

```bash
# Use Stripe CLI to send real signed webhooks
stripe listen --forward-to https://your-url/functions/v1/stripe-webhook

# In another terminal, trigger events
stripe trigger invoice.paid
```

## Support Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Supabase Edge Functions**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **Stripe Testing**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** (already implemented)
4. **Implement idempotency** (already implemented via `stripe_webhook_events`)
5. **Use HTTPS only** for webhook endpoints
6. **Regularly rotate API keys** in production
7. **Monitor webhook failures** in Stripe Dashboard
8. **Set up alerts** for failed payments

## Next Steps

After completing this setup:

1. Test the complete flow from trial to paid subscription
2. Test credit consumption with purchased packs
3. Test upgrade and downgrade flows
4. Implement user-facing subscription management UI
5. Set up email notifications for payment events
6. Monitor webhook success rate
7. Implement analytics for subscription metrics

---

**Need Help?** Check the Stripe Dashboard's Events and Logs tabs for detailed error messages and webhook payloads.
