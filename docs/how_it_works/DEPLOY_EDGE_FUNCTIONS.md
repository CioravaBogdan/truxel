# Deploy Supabase Edge Functions Guide

This guide explains how to deploy the three Edge Functions required for Stripe integration.

## Prerequisites

- Supabase project: `https://upxocyomsfhqoflwibwn.supabase.co`
- Stripe Secret Key (from Stripe Dashboard)
- Stripe Webhook Secret (will be created during webhook setup)

## Edge Functions Overview

Your project includes three Edge Functions:

1. **create-checkout-session** - Creates Stripe Checkout sessions for subscriptions and search packs
2. **stripe-webhook** - Handles Stripe webhook events (payments, subscription updates, etc.)
3. **manage-subscription** - Manages subscription changes (upgrade, downgrade, cancel)

## Deployment Options

### Option 1: Deploy via Supabase Dashboard (Easiest)

This is the recommended method for beginners.

#### Step 1: Configure Secrets

1. Go to https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/settings/functions
2. Click on **Environment Variables** or **Secrets**
3. Add the following secrets:

| Name | Value | Where to get it |
|------|-------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | After creating webhook (see webhook guide) |

**Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available.

#### Step 2: Deploy Functions Manually

For each function, you'll need to:

1. Go to **Edge Functions** section in Supabase Dashboard
2. Click **New Function** or **Deploy**
3. You have two options:

**Option A: Upload via Dashboard**
- Zip the function folder (e.g., `create-checkout-session/`)
- Upload the zip file
- Click Deploy

**Option B: Copy and Paste**
- Create new function with the name
- Copy contents of `index.ts` from each function folder
- Paste into the editor
- Click Deploy

Functions to deploy:
- `create-checkout-session`
- `stripe-webhook`
- `manage-subscription`

#### Step 3: Note Function URLs

After deployment, your function URLs will be:
```
https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/create-checkout-session
https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook
https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/manage-subscription
```

### Option 2: Deploy via Supabase CLI (Advanced)

This method is faster for multiple deployments and updates.

#### Step 1: Install Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop install supabase
```

**Or via npm:**
```bash
npm install -g supabase
```

#### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

#### Step 3: Link Your Project

```bash
cd /path/to/your/project
supabase link --project-ref upxocyomsfhqoflwibwn
```

You'll be prompted for your database password.

#### Step 4: Set Secrets via CLI

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Set webhook secret (after creating webhook in Stripe)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

#### Step 5: Deploy All Functions

```bash
# Deploy all functions at once
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy manage-subscription
```

Or deploy them all at once:
```bash
supabase functions deploy
```

#### Step 6: Verify Deployment

```bash
# List deployed functions
supabase functions list

# View function logs
supabase functions serve create-checkout-session --debug
```

## Testing Edge Functions

### Test create-checkout-session

```bash
curl -X POST \
  'https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_USER_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "priceId": "price_YOUR_PRICE_ID",
    "type": "subscription",
    "successUrl": "myapp://success",
    "cancelUrl": "myapp://cancel"
  }'
```

Expected response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Test stripe-webhook

This function is called by Stripe automatically. To test locally:

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your function
stripe listen --forward-to https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook

# In another terminal, trigger test events
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
```

### Test manage-subscription

```bash
curl -X POST \
  'https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/manage-subscription' \
  -H 'Authorization: Bearer YOUR_USER_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "cancel"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

## Viewing Function Logs

### Via Dashboard

1. Go to **Edge Functions** in Supabase Dashboard
2. Click on a function name
3. Click **Logs** tab
4. View real-time logs and errors

### Via CLI

```bash
# Follow logs in real-time
supabase functions serve create-checkout-session --debug

# View recent logs
supabase functions logs create-checkout-session
```

## Common Issues and Solutions

### Issue: "No authorization header"

**Solution**: Make sure you're sending the Authorization header with a valid user access token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue: "Invalid signature" on webhook

**Solution**:
1. Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
2. Verify the webhook is sending to the correct URL
3. Check that the signing secret matches the one in Stripe Dashboard

### Issue: "Customer not found"

**Solution**:
1. Ensure the user has a profile in the database
2. Verify the user is authenticated
3. Check that the auth token is valid

### Issue: Function times out

**Solution**:
1. Check Stripe API keys are correct
2. Verify network connectivity from Supabase
3. Check function logs for specific errors
4. Ensure Supabase service role key is valid

### Issue: CORS errors

**Solution**: The functions already have CORS headers configured. If you still get errors:
1. Verify the `corsHeaders` object includes your domain
2. Make sure you're handling OPTIONS requests
3. Check that all responses include CORS headers

## Function URLs Reference

After deployment, save these URLs for your app configuration:

```bash
# Checkout session creation
CHECKOUT_URL=https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/create-checkout-session

# Stripe webhook handler
WEBHOOK_URL=https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook

# Subscription management
MANAGE_URL=https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/manage-subscription
```

## Updating Functions

When you need to update a function:

### Via CLI:
```bash
# Edit the function file
# Then redeploy
supabase functions deploy function-name
```

### Via Dashboard:
1. Go to the function in Edge Functions
2. Edit the code
3. Click Deploy

## Environment Variables Management

### List current secrets:
```bash
supabase secrets list
```

### Update a secret:
```bash
supabase secrets set SECRET_NAME=new_value
```

### Delete a secret:
```bash
supabase secrets unset SECRET_NAME
```

## Production Deployment

When moving to production:

1. **Switch to Live Stripe Keys**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
   ```

2. **Update Webhook URL in Stripe**:
   - Create new webhook endpoint with live keys
   - Point to same function URL
   - Update webhook secret in Supabase

3. **Test thoroughly**:
   - Test with real payment methods
   - Verify webhook delivery
   - Check database updates

4. **Monitor**:
   - Watch function logs
   - Set up alerts for errors
   - Monitor Stripe dashboard

## Security Checklist

- [ ] Stripe secret keys are set as environment variables (never in code)
- [ ] Webhook signature verification is enabled
- [ ] Authentication is required for all non-webhook endpoints
- [ ] CORS headers are properly configured
- [ ] Error messages don't expose sensitive data
- [ ] RLS policies are active on all tables
- [ ] Service role key is only used server-side

## Support and Documentation

- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Stripe API**: https://stripe.com/docs/api
- **Supabase CLI**: https://supabase.com/docs/reference/cli
- **Stripe Webhooks**: https://stripe.com/docs/webhooks

## Quick Troubleshooting Commands

```bash
# Check function status
supabase functions list

# View logs
supabase functions logs function-name --limit 50

# Test function locally
supabase functions serve function-name --debug

# Check secrets
supabase secrets list

# Redeploy function
supabase functions deploy function-name

# Link project (if not linked)
supabase link --project-ref upxocyomsfhqoflwibwn
```

---

**Next Steps**: After deploying Edge Functions, proceed to configure the Stripe webhook endpoint using the `stripe-webhook` function URL.
