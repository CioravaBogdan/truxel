# Stripe Integration for LogisticsLead Mobile App

Complete Stripe payment integration for subscription management and one-time search pack purchases.

## Overview

This project integrates Stripe payments with Supabase backend to handle:
- **Subscription Tiers**: Trial, Standard (€9.99), Pro (€49.99), Premium (€99.99)
- **Search Packs**: One-time purchases of additional searches (10, 25, 50 searches)
- **Credit Management**: Automatic credit tracking with priority logic (purchased credits used first)
- **Webhook Processing**: Automated handling of payment events

## Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         │ API Calls
         ↓
┌─────────────────┐
│ Supabase        │
│ Edge Functions  │
├─────────────────┤
│ • create-checkout
│ • stripe-webhook
│ • manage-subscription
└────────┬────────┘
         │
         │ Database
         ↓
┌─────────────────┐       Webhooks      ┌──────────┐
│ PostgreSQL DB   │ ←─────────────────→ │  Stripe  │
│ • profiles      │                      │  API     │
│ • subscriptions │                      └──────────┘
│ • transactions  │
└─────────────────┘
```

## Features

### Subscription Management
- Multiple tier options with different feature sets
- Automatic tier upgrades and downgrades
- Subscription renewal tracking
- Cancellation handling with grace period
- Proration for plan changes

### Search Credit System
- Trial tier: 5 free searches
- Subscription-based monthly credits
- Additional search pack purchases
- Priority consumption: purchased credits → subscription credits
- Automatic monthly reset for subscription credits
- Expiration tracking for purchased credits

### Payment Processing
- Secure Stripe Checkout integration
- Test and Live mode support
- Multiple payment methods
- Automatic customer creation
- Transaction history tracking
- Failed payment handling

### Security
- Row Level Security (RLS) on all tables
- Webhook signature verification
- Secure API key management
- User authentication required
- No sensitive data in client code

## Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- Expo CLI
- Supabase account
- Stripe account

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Database Setup
Run the migration in Supabase SQL Editor:
```sql
-- File: supabase/migrations/20251022084011_add_pro_tier_and_stripe_integration.sql
```

### 5. Deploy Edge Functions
See `DEPLOY_EDGE_FUNCTIONS.md` for detailed instructions.

### 6. Configure Stripe
Follow the step-by-step guide in `STRIPE_IMPLEMENTATION_GUIDE.md`.

## Project Structure

```
.
├── app/
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/
│   │   ├── pricing.tsx   # Subscription & pricing UI
│   │   └── profile.tsx   # User profile with subscription info
│   └── _layout.tsx
├── components/           # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── StatusBadge.tsx
├── services/
│   ├── authService.ts    # Authentication logic
│   ├── stripeService.ts  # Stripe API calls
│   └── leadsService.ts   # Lead management
├── store/
│   ├── authStore.ts      # Auth state management
│   └── leadsStore.ts     # Leads state management
├── supabase/
│   ├── functions/        # Edge Functions
│   │   ├── create-checkout-session/
│   │   ├── stripe-webhook/
│   │   └── manage-subscription/
│   └── migrations/       # Database migrations
├── types/
│   └── database.types.ts # TypeScript types
└── lib/
    └── supabase.ts       # Supabase client
```

## Documentation

- **[Complete Setup Guide](STRIPE_IMPLEMENTATION_GUIDE.md)** - Step-by-step Stripe setup
- **[Setup Checklist](STRIPE_SETUP_CHECKLIST.md)** - Track your progress
- **[Deploy Edge Functions](DEPLOY_EDGE_FUNCTIONS.md)** - Function deployment guide
- **[Database Verification](verify_database_setup.sql)** - Verify DB setup
- **[Update Price IDs](update_stripe_price_ids.sql)** - Update Stripe prices

## API Reference

### Edge Functions

#### create-checkout-session
Creates a Stripe Checkout session for subscriptions or search packs.

**Endpoint**: `POST /functions/v1/create-checkout-session`

**Request**:
```json
{
  "priceId": "price_1234567890",
  "type": "subscription",
  "successUrl": "myapp://success",
  "cancelUrl": "myapp://cancel"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### stripe-webhook
Handles Stripe webhook events (called by Stripe, not your app).

**Endpoint**: `POST /functions/v1/stripe-webhook`

**Events Handled**:
- `invoice.paid` - Payment successful
- `invoice.payment_failed` - Payment failed
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled

#### manage-subscription
Manages subscription changes (upgrade, downgrade, cancel, reactivate).

**Endpoint**: `POST /functions/v1/manage-subscription`

**Request**:
```json
{
  "action": "cancel" | "reactivate" | "upgrade" | "downgrade",
  "newPriceId": "price_..." // Required for upgrade/downgrade
}
```

**Response**:
```json
{
  "success": true,
  "message": "Action completed",
  "subscription": { /* subscription object */ }
}
```

## Database Schema

### Key Tables

**profiles**
- User information and subscription status
- Stripe customer and subscription IDs
- Search credit tracking

**subscription_tiers**
- Available subscription plans
- Feature flags per tier
- Stripe Price IDs

**additional_search_packs**
- One-time search pack offerings
- Pricing and quantity
- Stripe Price IDs

**transactions**
- Payment history
- Subscription and purchase records
- Stripe payment references

**user_search_credits**
- Purchased search credits
- Expiration tracking
- Credit consumption history

**stripe_webhook_events**
- Webhook event log
- Idempotency tracking
- Error logging

### Key Functions

**get_total_search_credits(user_id)**
Returns total available credits broken down by source:
- `purchased_credits`: Credits from search packs
- `subscription_searches_remaining`: Monthly subscription credits
- `total_available`: Sum of both

**consume_search_credit(user_id)**
Consumes one search credit with priority logic:
1. Purchased credits (oldest first, FIFO)
2. Subscription monthly credits
Returns success status and remaining credits.

## Testing

### Test Cards (Stripe Test Mode)
```
Success:              4242 4242 4242 4242
Insufficient funds:   4000 0000 0000 9995
Card declined:        4000 0000 0000 0002
Requires 3D Secure:   4000 0025 0000 3155
```

Use any future expiry date, any 3-digit CVC, any postal code.

### Test Flow
1. Register a test user
2. Navigate to Pricing tab
3. Select a subscription tier
4. Complete checkout with test card
5. Verify in Stripe Dashboard: Payments, Customers, Subscriptions
6. Verify in Supabase: Check profile, transactions, webhook events

### Local Webhook Testing
```bash
# Install Stripe CLI
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
```

## Troubleshooting

### Common Issues

**"No authorization header"**
- Ensure user is logged in
- Check Authorization header is being sent
- Verify token is valid

**"Invalid signature" on webhook**
- Verify webhook secret matches Stripe Dashboard
- Check webhook URL is correct
- Ensure function is deployed

**Credits not added after purchase**
- Check webhook was received
- Review stripe_webhook_events table
- Verify transaction was created
- Check user_search_credits table

**Checkout not opening**
- Verify Stripe publishable key is set
- Check Price ID exists in Stripe
- Review function logs for errors

### Debugging

**View Edge Function Logs**:
```bash
supabase functions logs stripe-webhook
```

**Check Database**:
```sql
-- Verify webhook was received
SELECT * FROM stripe_webhook_events
ORDER BY created_at DESC LIMIT 10;

-- Check user subscription
SELECT email, subscription_tier, subscription_status,
       stripe_customer_id, stripe_subscription_id
FROM profiles WHERE email = 'user@example.com';

-- Check credits
SELECT * FROM get_total_search_credits('user_id_here');
```

## Production Checklist

Before going live:

- [ ] Switch Stripe to Live mode
- [ ] Recreate all products in Live mode
- [ ] Update database with Live Price IDs
- [ ] Get Live API keys from Stripe
- [ ] Update Edge Function secrets with Live keys
- [ ] Create Live webhook endpoint
- [ ] Update app with Live publishable key
- [ ] Test complete flow with real payment
- [ ] Verify webhook delivery works
- [ ] Enable monitoring and alerts
- [ ] Set up email notifications
- [ ] Test subscription renewal
- [ ] Test failed payment scenarios

## Monitoring

### Key Metrics to Track
- Successful payments vs failed
- Subscription churn rate
- Average revenue per user
- Search credit usage
- Webhook processing success rate

### Tools
- Stripe Dashboard analytics
- Supabase function logs
- Database queries for custom metrics
- Error tracking for failed webhooks

## Support

### Resources
- Stripe API Docs: https://stripe.com/docs/api
- Supabase Docs: https://supabase.com/docs
- Stripe Test Cards: https://stripe.com/docs/testing
- Stripe Webhooks Guide: https://stripe.com/docs/webhooks

### Getting Help
- Check `STRIPE_IMPLEMENTATION_GUIDE.md` for setup issues
- Review function logs for error messages
- Test webhooks with Stripe CLI
- Verify database setup with `verify_database_setup.sql`

## License

This integration follows your project's existing license.

## Contributing

When contributing to Stripe integration:
1. Test with Stripe test mode first
2. Verify all webhooks are handled
3. Check RLS policies are maintained
4. Update documentation as needed
5. Test credit consumption logic

---

**Current Status**: ✅ Ready for implementation

**Project**: LogisticsLead Mobile App
**Supabase Project**: upxocyomsfhqoflwibwn
**Version**: 1.0.0
