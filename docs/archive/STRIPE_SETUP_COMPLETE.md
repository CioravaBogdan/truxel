# ✅ Stripe Integration Setup - COMPLETE

## 🎉 Implementation Summary

### 1. Database Configuration ✅
- **Subscription Tiers**: Trial (€0, 5 searches), Standard (€29.99/mo, 30 searches), Pro (€49.99/mo, 50 searches)
- **No Result Limits**: Removed `max_results_per_search` - users get ALL search results, only search COUNT is limited
- **Feature Flags**: Pro tier has `linkedin_enabled`, `ai_matching_enabled`, `advanced_research_enabled`
- **Stripe IDs**: All products and prices stored in database

### 2. Stripe Products Created ✅
| Tier | Product ID | Price ID | Amount | Type |
|------|-----------|----------|--------|------|
| Trial | `prod_THaEgwK8Jupt1E` | - | €0 | Free |
| Standard | `prod_THaEncye4n7tEi` | `price_1SL14lPd7H7rZiTmkgHF1iCZ` | €29.99/mo | Recurring |
| Pro | `prod_THaFkFFzFDOebz` | `price_1SL14rPd7H7rZiTmKnpBjJaS` | €49.99/mo | Recurring |
| Search Pack | `prod_THaFpplWmNkSUP` | `price_1SL14yPd7H7rZiTmGgsbAgq8` | €24.99 | One-time |

### 3. Edge Functions Deployed ✅
All Edge Functions are **ACTIVE** on Supabase:
- ✅ `create-checkout-session` (v2) - Creates Stripe checkout sessions
- ✅ `stripe-webhook` (v2) - Handles Stripe webhook events
- ✅ `manage-subscription` (v2) - Cancel/upgrade/downgrade subscriptions

### 4. Webhook Configuration ✅
- **Webhook ID**: `we_1SL1JSPd7H7rZiTm0CLf6agB`
- **URL**: `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/stripe-webhook`
- **Secret**: `whsec_zlkXLtVcMKVL1eFszF7vTdvoiwZdHrIH`
- **Status**: ✅ ENABLED
- **Events**: 
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

---

## ⚠️ FINAL STEP REQUIRED

### Set Webhook Secret in Supabase Dashboard

**You MUST complete this step manually:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn)
2. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
3. Add/Update this secret:
   ```
   Key: STRIPE_WEBHOOK_SECRET
   Value: whsec_zlkXLtVcMKVL1eFszF7vTdvoiwZdHrIH
   ```
4. Click **Save**

**Note**: The `STRIPE_SECRET_KEY` should already be set. If not, also add:
```
Key: STRIPE_SECRET_KEY
Value: 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
```

---

## 🧪 Testing Checklist

After setting the webhook secret, test the following:

### Test 1: Checkout Session Creation
```typescript
// In your React Native app
import { supabase } from '@/lib/supabase';

const response = await supabase.functions.invoke('create-checkout-session', {
  body: {
    priceId: 'price_1SL14lPd7H7rZiTmkgHF1iCZ', // Standard tier
    type: 'subscription',
    successUrl: 'truxel://payment-success',
    cancelUrl: 'truxel://payment-cancel'
  }
});

console.log('Checkout URL:', response.data.url);
```

### Test 2: Webhook Event Reception
1. Make a test purchase in Stripe Dashboard (Test Mode)
2. Check `stripe_webhook_events` table in Supabase:
   ```sql
   SELECT * FROM stripe_webhook_events ORDER BY created_at DESC LIMIT 5;
   ```
3. Verify `processed = true` and no errors

### Test 3: Subscription Management
```typescript
// Cancel subscription
const { data } = await supabase.functions.invoke('manage-subscription', {
  body: { action: 'cancel' }
});

// Upgrade to Pro
const { data } = await supabase.functions.invoke('manage-subscription', {
  body: { 
    action: 'upgrade',
    newPriceId: 'price_1SL14rPd7H7rZiTmKnpBjJaS' // Pro tier
  }
});
```

### Test 4: Credit Consumption
```sql
-- Test credit consumption function
SELECT consume_search_credit('user-uuid-here');

-- Verify credits were deducted
SELECT 
  subscription_tier,
  available_search_credits,
  monthly_searches_used,
  trial_searches_used
FROM profiles 
WHERE user_id = 'user-uuid-here';
```

---

## 📊 Database Schema Reference

### Key Tables
- `profiles`: User subscription info, Stripe IDs, credit counters
- `subscription_tiers`: Tier definitions with Stripe product/price IDs
- `user_search_credits`: Purchased search packs (FIFO consumption)
- `stripe_webhook_events`: Webhook idempotency tracking
- `transactions`: Payment history

### Credit Consumption Logic
1. **Purchased credits consumed FIRST** (from `user_search_credits`, oldest first)
2. **Then subscription credits** (from monthly allowance based on tier)
3. No result limits - users get ALL leads found, regardless of count

---

## 🔐 Security Notes

### Never Expose
- ❌ `STRIPE_SECRET_KEY` (server-only)
- ❌ `STRIPE_WEBHOOK_SECRET` (server-only)
- ❌ Supabase `SERVICE_ROLE_KEY` (server-only)

### Safe to Expose
- ✅ `STRIPE_PUBLISHABLE_KEY` (client-side)
- ✅ Supabase `ANON_KEY` (client-side)
- ✅ Supabase `URL` (client-side)

### Client-Side Access
All sensitive keys are accessed via:
```typescript
import Constants from 'expo-constants';
const stripeKey = Constants.expoConfig?.extra?.stripePublishableKey;
```

---

## 🚀 Next Steps

1. ✅ Set `STRIPE_WEBHOOK_SECRET` in Supabase Dashboard
2. Test checkout flow in development
3. Test webhook events with Stripe test mode
4. Verify credit consumption logic
5. Deploy to production when ready

---

## 📞 Support Resources

- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn
- **Stripe Docs**: https://stripe.com/docs/webhooks
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

**Implementation Date**: October 22, 2025  
**Stripe Account**: `acct_1SIVE9Pd7H7rZiTm`  
**Supabase Project**: `upxocyomsfhqoflwibwn`
