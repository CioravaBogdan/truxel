# Stripe & Supabase Complete Implementation Guide

This guide walks you through the complete setup of Stripe payments integrated with your Supabase backend.

## Prerequisites

- Active Supabase project: `https://upxocyomsfhqoflwibwn.supabase.co`
- Stripe account (create at https://dashboard.stripe.com/register)
- Access to Stripe Dashboard
- Supabase project access

## Step 1: Apply Database Migration

The database migration has already been created and should be applied to your Supabase project.

**Migration file**: `supabase/migrations/20251022084011_add_pro_tier_and_stripe_integration.sql`

This migration creates:
- Enhanced `profiles` table with Stripe fields
- `user_search_credits` table for tracking purchased credits
- `stripe_webhook_events` table for idempotency
- `subscription_tiers` table with feature flags
- `additional_search_packs` table
- RLS policies for all tables
- Database functions for credit management

### To apply the migration:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/20251022084011_add_pro_tier_and_stripe_integration.sql`
4. Paste and execute the SQL
5. Verify all tables are created successfully

**Verification queries:**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'subscription_tiers', 'additional_search_packs', 'user_search_credits', 'stripe_webhook_events');

-- Check subscription tiers
SELECT * FROM subscription_tiers ORDER BY price;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'subscription_tiers', 'user_search_credits', 'stripe_webhook_events');
```

## Step 2: Create Stripe Products

### A. Access Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. **IMPORTANT**: Switch to **Test mode** (toggle in the top right)
3. Navigate to **Products** → **Add product**

### B. Create Subscription Tiers

Create the following subscription products:

#### 1. Standard Tier
- **Product name**: Standard Plan
- **Description**: Basic lead generation with standard features
- **Pricing model**: Recurring
- **Price**: €9.99
- **Billing period**: Monthly
- **Metadata** (add these key-value pairs):
  - `tier_name`: `standard`
  - `searches_per_month`: `15`
- **After creation**: Copy the **Price ID** (starts with `price_`)

#### 2. Pro Tier
- **Product name**: Pro Plan
- **Description**: LinkedIn contacts, AI matching, and advanced research
- **Pricing model**: Recurring
- **Price**: €49.99
- **Billing period**: Monthly
- **Metadata**:
  - `tier_name`: `pro`
  - `searches_per_month`: `30`
- **After creation**: Copy the **Price ID**

#### 3. Premium Tier
- **Product name**: Premium Plan
- **Description**: Unlimited features with maximum results per search
- **Pricing model**: Recurring
- **Price**: €99.99
- **Billing period**: Monthly
- **Metadata**:
  - `tier_name`: `premium`
  - `searches_per_month`: `100`
- **After creation**: Copy the **Price ID**

### C. Create Search Pack Products

Create one-time purchase products for additional searches:

#### 1. Small Search Pack
- **Product name**: 10 Additional Searches
- **Description**: Add 10 extra searches to your account
- **Pricing model**: One-time
- **Price**: €4.99
- **Metadata**:
  - `pack_name`: `10_searches`
  - `searches_count`: `10`
- **After creation**: Copy the **Price ID**

#### 2. Medium Search Pack
- **Product name**: 25 Additional Searches
- **Description**: Add 25 extra searches to your account
- **Pricing model**: One-time
- **Price**: €9.99
- **Metadata**:
  - `pack_name`: `25_searches`
  - `searches_count`: `25`
- **After creation**: Copy the **Price ID**

#### 3. Large Search Pack
- **Product name**: 50 Additional Searches
- **Description**: Add 50 extra searches to your account
- **Pricing model**: One-time
- **Price**: €17.99
- **Metadata**:
  - `pack_name`: `50_searches`
  - `searches_count`: `50`
- **After creation**: Copy the **Price ID**

## Step 3: Update Database with Stripe Price IDs

Once you have all the Price IDs from Stripe, update your Supabase database:

```sql
-- Update subscription tiers with Stripe Price IDs
UPDATE subscription_tiers
SET stripe_price_id = 'price_YOUR_STANDARD_PRICE_ID'
WHERE tier_name = 'standard';

UPDATE subscription_tiers
SET stripe_price_id = 'price_YOUR_PRO_PRICE_ID'
WHERE tier_name = 'pro';

UPDATE subscription_tiers
SET stripe_price_id = 'price_YOUR_PREMIUM_PRICE_ID'
WHERE tier_name = 'premium';

-- Insert or update additional search packs
INSERT INTO additional_search_packs (pack_name, price, searches_count, stripe_price_id)
VALUES
  ('10 Searches', 4.99, 10, 'price_YOUR_10_SEARCHES_PRICE_ID'),
  ('25 Searches', 9.99, 25, 'price_YOUR_25_SEARCHES_PRICE_ID'),
  ('50 Searches', 17.99, 50, 'price_YOUR_50_SEARCHES_PRICE_ID')
ON CONFLICT (pack_name) DO UPDATE SET
  price = EXCLUDED.price,
  searches_count = EXCLUDED.searches_count,
  stripe_price_id = EXCLUDED.stripe_price_id;

-- Verify the updates
SELECT tier_name, price, stripe_price_id FROM subscription_tiers;
SELECT pack_name, price, searches_count, stripe_price_id FROM additional_search_packs;
```

## Step 4: Get Stripe API Keys

1. Go to Stripe Dashboard → **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - **Keep this secure!**

## Step 5: Deploy Supabase Edge Functions

### A. Prepare Environment Variables

Before deploying, you need to set secrets in Supabase:

1. Go to Supabase Dashboard → **Edge Functions** → **Secrets**
2. Add the following secrets:

| Secret Name | Value | Where to get it |
|-------------|-------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Will be created in Step 6 |

**Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available to Edge Functions.

### B. Deploy Edge Functions

The following Edge Functions are already created and need to be deployed:

#### 1. create-checkout-session
```bash
# This function creates Stripe checkout sessions
Location: supabase/functions/create-checkout-session/index.ts
```

#### 2. stripe-webhook
```bash
# This function handles Stripe webhook events
Location: supabase/functions/stripe-webhook/index.ts
```

#### 3. manage-subscription
```bash
# This function manages subscription changes
Location: supabase/functions/manage-subscription/index.ts
```

### Deployment Instructions:

**Option 1: Using Supabase Dashboard (Recommended)**

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **Deploy new function**
3. Upload each function folder or use the Supabase CLI

**Option 2: Using Supabase CLI**

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref upxocyomsfhqoflwibwn

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy manage-subscription
```

After deployment, note down the function URLs. They will be in the format:
- `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/create-checkout-session`
- `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook`
- `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/manage-subscription`

## Step 6: Configure Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL: `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook`
4. Click **Select events** and choose:
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. On the webhook details page, click **Reveal** next to **Signing secret**
7. Copy the signing secret (starts with `whsec_`)
8. Go back to Supabase Dashboard → **Edge Functions** → **Secrets**
9. Add/Update secret: `STRIPE_WEBHOOK_SECRET` with the value you copied

## Step 7: Update Environment Variables in Mobile App

Update your `.env` file with Stripe keys:

```bash
# Existing Supabase config (already present)
EXPO_PUBLIC_SUPABASE_URL=https://upxocyomsfhqoflwibwn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Add Stripe configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**IMPORTANT**:
- Never commit the `.env` file to version control
- Use `.env.example` for documentation only
- The secret key should NEVER be in the mobile app

## Step 8: Testing the Integration

### A. Test Checkout Flow

1. Run the app: `npm run dev`
2. Register a new user or login
3. Navigate to the **Pricing** tab
4. Click **Subscribe** on any tier
5. You should be redirected to Stripe Checkout
6. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any postal code

### B. Verify in Stripe Dashboard

1. Go to **Payments** to see the test payment
2. Go to **Customers** to see the customer was created
3. Go to **Subscriptions** to see the active subscription

### C. Verify in Supabase

```sql
-- Check if profile was updated
SELECT
  email,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id
FROM profiles
WHERE email = 'your-test-email@example.com';

-- Check if transaction was recorded
SELECT * FROM transactions
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'your-test-email@example.com')
ORDER BY created_at DESC;

-- Check webhook events
SELECT stripe_event_id, event_type, processed, created_at
FROM stripe_webhook_events
ORDER BY created_at DESC
LIMIT 10;
```

### D. Test Webhook Locally (Optional)

Use Stripe CLI to test webhooks:

```bash
# Install Stripe CLI
# Follow: https://stripe.com/docs/stripe-cli

# Forward webhooks to local endpoint
stripe listen --forward-to https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook

# Trigger test events
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
```

## Step 9: Test Credit Management

### Test purchased credits:

1. Buy a search pack
2. Perform a search
3. Verify credit was deducted from purchased credits first

```sql
-- Check credits
SELECT * FROM get_total_search_credits('USER_ID_HERE');

-- Check credit consumption
SELECT * FROM user_search_credits WHERE user_id = 'USER_ID_HERE';

-- Check profile credits
SELECT
  trial_searches_used,
  monthly_searches_used,
  available_search_credits
FROM profiles WHERE user_id = 'USER_ID_HERE';
```

## Step 10: Go Live Checklist

When ready for production:

1. **Stripe**:
   - Switch Stripe to **Live mode**
   - Create all products again in Live mode
   - Update database with Live mode Price IDs
   - Create Live webhook endpoint
   - Update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Supabase
   - Update `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in app

2. **Supabase**:
   - Verify all migrations are applied in production
   - Double-check RLS policies are active
   - Review and optimize database indexes
   - Set up database backups

3. **Testing**:
   - Test complete purchase flow with real card
   - Verify webhook delivery is working
   - Test subscription renewal
   - Test failed payment handling
   - Test subscription cancellation

4. **Monitoring**:
   - Set up Stripe email notifications
   - Monitor Supabase logs
   - Set up alerts for failed webhooks
   - Monitor database performance

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct
- Verify webhook secret matches in Supabase secrets
- Check Supabase function logs for errors
- Test webhook with Stripe CLI

### Customer not created
- Verify Stripe secret key is correct
- Check Edge Function logs
- Ensure user is authenticated when creating checkout

### Credits not added after purchase
- Check webhook was received and processed
- Verify transaction was created in database
- Check user_search_credits table
- Review stripe_webhook_events for errors

### Payment succeeds but database not updated
- Check webhook signature verification
- Review stripe_webhook_events table
- Check for duplicate event processing
- Verify Supabase service role key is correct

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Expo Environment Variables**: https://docs.expo.dev/guides/environment-variables/

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** before processing
3. **Use RLS policies** to protect user data
4. **Implement rate limiting** on Edge Functions
5. **Log errors** without exposing sensitive data
6. **Regularly rotate** API keys
7. **Monitor** for suspicious activity
8. **Use HTTPS** for all communications

---

## Quick Reference: Stripe Test Cards

| Card Number | Use Case |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Decline (insufficient funds) |
| 4000 0000 0000 0002 | Decline (card declined) |
| 4000 0025 0000 3155 | 3D Secure authentication required |

**For all test cards:**
- Any future expiry date
- Any 3-digit CVC
- Any postal code
