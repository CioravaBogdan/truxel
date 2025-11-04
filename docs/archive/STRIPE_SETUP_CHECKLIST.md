# Stripe & Supabase Integration - Setup Checklist

Use this checklist to ensure you complete all steps for Stripe integration.

## Phase 1: Database Setup

- [ ] **Apply Database Migration**
  - Location: `supabase/migrations/20251022084011_add_pro_tier_and_stripe_integration.sql`
  - Method: Copy and paste into Supabase SQL Editor
  - Verify: Run `verify_database_setup.sql` to check

- [ ] **Verify Tables Created**
  - [ ] `profiles` (with Stripe columns)
  - [ ] `subscription_tiers`
  - [ ] `additional_search_packs`
  - [ ] `transactions`
  - [ ] `user_search_credits`
  - [ ] `stripe_webhook_events`
  - [ ] `leads` (with enhanced columns)
  - [ ] `searches`

- [ ] **Verify RLS is Enabled**
  - Check all tables have Row Level Security enabled
  - Verify policies exist for user access

- [ ] **Verify Database Functions**
  - [ ] `get_total_search_credits()` exists
  - [ ] `consume_search_credit()` exists
  - [ ] `update_updated_at_column()` exists

## Phase 2: Stripe Account Setup

- [ ] **Create/Access Stripe Account**
  - URL: https://dashboard.stripe.com
  - [ ] Switch to Test Mode (toggle in top right)

- [ ] **Get API Keys**
  - Location: Developers → API keys
  - [ ] Copy Publishable key (pk_test_...)
  - [ ] Copy Secret key (sk_test_...) - **Keep secure!**

## Phase 3: Create Stripe Products

### Subscription Products

- [ ] **Standard Tier**
  - Name: "Standard Plan"
  - Price: €9.99/month
  - Metadata: `tier_name=standard`, `searches_per_month=15`
  - [ ] Copy Price ID: ________________

- [ ] **Pro Tier**
  - Name: "Pro Plan"
  - Price: €49.99/month
  - Metadata: `tier_name=pro`, `searches_per_month=30`
  - [ ] Copy Price ID: ________________

- [ ] **Premium Tier**
  - Name: "Premium Plan"
  - Price: €99.99/month
  - Metadata: `tier_name=premium`, `searches_per_month=100`
  - [ ] Copy Price ID: ________________

### Search Pack Products (One-time payments)

- [ ] **10 Searches Pack**
  - Name: "10 Additional Searches"
  - Price: €4.99 (one-time)
  - Metadata: `pack_name=10_searches`, `searches_count=10`
  - [ ] Copy Price ID: ________________

- [ ] **25 Searches Pack**
  - Name: "25 Additional Searches"
  - Price: €9.99 (one-time)
  - Metadata: `pack_name=25_searches`, `searches_count=25`
  - [ ] Copy Price ID: ________________

- [ ] **50 Searches Pack**
  - Name: "50 Additional Searches"
  - Price: €17.99 (one-time)
  - Metadata: `pack_name=50_searches`, `searches_count=50`
  - [ ] Copy Price ID: ________________

## Phase 4: Update Database with Price IDs

- [ ] **Update subscription_tiers table**
  - [ ] Standard tier with Price ID
  - [ ] Pro tier with Price ID
  - [ ] Premium tier with Price ID

- [ ] **Insert/Update additional_search_packs table**
  - [ ] 10 searches pack with Price ID
  - [ ] 25 searches pack with Price ID
  - [ ] 50 searches pack with Price ID

- [ ] **Verify Updates**
  - Run verification queries from `update_stripe_price_ids.sql`
  - Confirm no missing Price IDs

## Phase 5: Supabase Edge Functions

- [ ] **Configure Secrets in Supabase**
  - Location: Project Settings → Edge Functions → Environment Variables
  - [ ] Add `STRIPE_SECRET_KEY` = sk_test_...
  - [ ] Add `STRIPE_WEBHOOK_SECRET` = (will be added after webhook setup)

- [ ] **Deploy Edge Functions**
  - [ ] Deploy `create-checkout-session`
  - [ ] Deploy `stripe-webhook`
  - [ ] Deploy `manage-subscription`

- [ ] **Note Function URLs**
  - Checkout: `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/create-checkout-session`
  - Webhook: `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook`
  - Manage: `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/manage-subscription`

## Phase 6: Stripe Webhook Configuration

- [ ] **Create Webhook Endpoint**
  - Location: Stripe Dashboard → Developers → Webhooks
  - URL: `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook`

- [ ] **Select Events to Listen**
  - [ ] `invoice.paid`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`

- [ ] **Copy Webhook Secret**
  - [ ] Reveal and copy Signing Secret (whsec_...)
  - [ ] Add to Supabase Edge Functions secrets as `STRIPE_WEBHOOK_SECRET`

- [ ] **Test Webhook**
  - Send test webhook from Stripe Dashboard
  - Verify it appears in function logs
  - Check `stripe_webhook_events` table

## Phase 7: Mobile App Configuration

- [ ] **Update .env File**
  - [ ] Verify `EXPO_PUBLIC_SUPABASE_URL` is set
  - [ ] Verify `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set
  - [ ] Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_...

- [ ] **Verify Services are Configured**
  - [ ] `lib/supabase.ts` - Supabase client initialized
  - [ ] `services/stripeService.ts` - Stripe service ready
  - [ ] Edge function URLs are correct in service

## Phase 8: Testing

### Test Subscription Purchase

- [ ] **Test Flow**
  - [ ] Register/login a test user
  - [ ] Navigate to Pricing tab
  - [ ] Click Subscribe on a tier
  - [ ] Complete checkout with test card (4242 4242 4242 4242)
  - [ ] Verify redirect back to app

- [ ] **Verify in Stripe Dashboard**
  - [ ] Payment appears in Payments section
  - [ ] Customer created in Customers section
  - [ ] Subscription active in Subscriptions section

- [ ] **Verify in Database**
  - [ ] Profile updated with subscription tier
  - [ ] `stripe_customer_id` populated
  - [ ] `stripe_subscription_id` populated
  - [ ] Transaction recorded in `transactions` table
  - [ ] Webhook event in `stripe_webhook_events` table

### Test Search Pack Purchase

- [ ] **Test Flow**
  - [ ] Buy a search pack
  - [ ] Complete payment with test card
  - [ ] Verify credits added to account

- [ ] **Verify in Database**
  - [ ] Transaction recorded
  - [ ] Credits added to `user_search_credits`
  - [ ] `available_search_credits` updated in profile

### Test Credit Consumption

- [ ] **Test Priority Logic**
  - [ ] Perform search - verify purchased credits used first
  - [ ] Exhaust purchased credits
  - [ ] Perform search - verify subscription credits used
  - [ ] Check credit counts are accurate

### Test Subscription Management

- [ ] **Test Cancel**
  - [ ] Cancel subscription from app
  - [ ] Verify status updated to "cancelled"
  - [ ] Verify access continues until period end

- [ ] **Test Upgrade/Downgrade**
  - [ ] Upgrade from Standard to Pro
  - [ ] Verify proration applied
  - [ ] Verify new tier active

## Phase 9: Error Handling

- [ ] **Test Failed Payment**
  - Card: 4000 0000 0000 9995 (decline - insufficient funds)
  - [ ] Verify error shown to user
  - [ ] Verify subscription status updated

- [ ] **Test Network Errors**
  - [ ] Test with airplane mode
  - [ ] Verify appropriate error messages

- [ ] **Test Authentication Errors**
  - [ ] Test with expired token
  - [ ] Verify redirect to login

## Phase 10: Documentation

- [ ] **Read Implementation Guides**
  - [ ] `STRIPE_IMPLEMENTATION_GUIDE.md` - Complete setup guide
  - [ ] `DEPLOY_EDGE_FUNCTIONS.md` - Function deployment guide
  - [ ] `verify_database_setup.sql` - Database verification
  - [ ] `update_stripe_price_ids.sql` - Price ID update script

- [ ] **Save Important Information**
  - [ ] Stripe Publishable Key (for app)
  - [ ] Stripe Secret Key (for Supabase secrets)
  - [ ] Webhook Secret (for Supabase secrets)
  - [ ] All Price IDs from products

## Phase 11: Production Preparation

When ready to go live:

- [ ] **Switch Stripe to Live Mode**
  - [ ] Recreate all products in Live mode
  - [ ] Update database with Live Price IDs
  - [ ] Get Live API keys
  - [ ] Create Live webhook endpoint

- [ ] **Update Secrets**
  - [ ] Update `STRIPE_SECRET_KEY` with Live key
  - [ ] Update `STRIPE_WEBHOOK_SECRET` with Live secret
  - [ ] Update `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in app

- [ ] **Final Testing**
  - [ ] Test with real payment method
  - [ ] Verify webhook delivery
  - [ ] Test subscription renewal
  - [ ] Monitor logs

- [ ] **Enable Monitoring**
  - [ ] Set up Stripe email notifications
  - [ ] Monitor Supabase function logs
  - [ ] Set up alerts for failed webhooks
  - [ ] Monitor database performance

## Quick Reference

### Test Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline (insufficient funds)**: 4000 0000 0000 9995
- **Decline (card declined)**: 4000 0000 0000 0002
- **Requires 3D Secure**: 4000 0025 0000 3155

### Important URLs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn
- **Stripe API Docs**: https://stripe.com/docs/api
- **Supabase Docs**: https://supabase.com/docs

### Support Commands
```bash
# View function logs
supabase functions logs stripe-webhook

# Test webhook locally
stripe listen --forward-to https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook

# Trigger test event
stripe trigger invoice.paid
```

---

## Progress Tracking

**Started**: _______________
**Completed**: _______________
**Production Launch**: _______________

**Notes**:
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Team trained on management
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

**Completion**: Once all checkboxes are checked, your Stripe integration is complete and ready for production!
