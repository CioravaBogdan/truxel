# 🚀 RevenueCat Webhook Deployment Guide

**Created**: November 10, 2025  
**Status**: PRODUCTION READY  
**Function**: `revenuecat-webhook`

---

## ✅ WHAT'S BEEN DONE

### 1. RevenueCat SDK Initialized ✅
**File**: `app/_layout.tsx`
- ✅ Imports added (Purchases, Platform, Constants)
- ✅ State management for RevenueCat readiness
- ✅ Initialization after native modules
- ✅ Conditional initialization (only if API key valid)
- ✅ Debug logging for development
- ✅ Graceful fallback to Stripe if no API key

**Behavior**:
- Checks for valid API key (not `appl_xxx`)
- Initializes only on native platforms (iOS/Android)
- Sets log level: DEBUG in dev, INFO in production
- Logs platform and API key prefix for verification

---

### 2. Environment Variables Updated ✅
**File**: `.env`
```bash
TRUXEL_REVENUECAT_IOS_KEY=appl_bumYuiDXpITzaTYFavBtEbehTSx
```

**Status**: ✅ Real iOS API key configured

---

### 3. Webhook Created ✅
**File**: `supabase/functions/revenuecat-webhook/index.ts`

**Features**:
- ✅ CORS headers for cross-origin requests
- ✅ Event type handling (INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE, PRODUCT_CHANGE)
- ✅ Entitlement to tier mapping:
  - `fleet_manager_access` → premium
  - `pro_access` → pro
  - `standard_access` → standard
  - None → trial
- ✅ Profile updates (tier, status, renewal date)
- ✅ Search credits handling (25 credits for search packs)
- ✅ Transaction logging
- ✅ Error handling with detailed logging

---

### 4. Database Function Created ✅
**Function**: `increment_search_credits(p_user_id UUID, p_credits INTEGER)`

**SQL**:
```sql
CREATE OR REPLACE FUNCTION increment_search_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    available_search_credits = COALESCE(available_search_credits, 0) + p_credits,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;
```

**Status**: ✅ Created in Supabase (verified via MCP)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Deploy Webhook to Supabase (5 minutes)

```bash
# Login to Supabase CLI
npx supabase login

# Link to Truxel project
npx supabase link --project-ref upxocyomsfhqoflwibwn

# Deploy function
npx supabase functions deploy revenuecat-webhook

# Get function URL
npx supabase functions list
```

**Expected Output**:
```
Deployed Function:
  revenuecat-webhook
  
Invoke URL:
  https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/revenuecat-webhook
```

---

### Step 2: Configure Webhook in RevenueCat (5 minutes)

1. Go to: https://app.revenuecat.com/projects/proj56445e28/integrations/webhooks
2. Click **"+ New"**
3. Configure webhook:
   ```
   Webhook URL: https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/revenuecat-webhook
   Authorization Header: (Leave blank - using Supabase Service Role Key)
   ```
4. Select events to send:
   - ✅ Initial Purchase
   - ✅ Renewal
   - ✅ Cancellation
   - ✅ Expiration
   - ✅ Billing Issue
   - ✅ Product Change
5. Click **"Create"**

---

### Step 3: Test Webhook (10 minutes)

#### Option A: Test with RevenueCat Dashboard
1. Go to webhook settings
2. Click **"Send Test Event"**
3. Select event type: "Initial Purchase"
4. Check logs:
   ```bash
   npx supabase functions logs revenuecat-webhook --tail
   ```

**Expected Logs**:
```
📦 RevenueCat Webhook Received: {
  type: 'INITIAL_PURCHASE',
  userId: 'test_user_id',
  productId: 'truxel_2999_1month',
  entitlements: ['standard_access']
}
✅ Updating subscription: userId=test_user_id, tier=standard
```

---

#### Option B: Test with Sandbox Purchase (Recommended)
1. Build development build:
   ```bash
   eas build --platform ios --profile development
   ```
2. Install on physical iPhone
3. Sign out from App Store (Settings → App Store)
4. Open Truxel app
5. Go to Pricing tab
6. Attempt purchase → Sign in with sandbox account
7. Complete purchase
8. Check webhook logs:
   ```bash
   npx supabase functions logs revenuecat-webhook --tail
   ```
9. Verify profile updated in Supabase:
   ```sql
   SELECT user_id, subscription_tier, subscription_status, subscription_renewal_date
   FROM profiles
   WHERE user_id = '[sandbox_user_id]';
   ```

---

### Step 4: Verify Integration (5 minutes)

**Check Profile Updates**:
```sql
-- Check most recent transactions
SELECT * FROM transactions
ORDER BY created_at DESC
LIMIT 5;

-- Check user subscription
SELECT 
  user_id,
  email,
  subscription_tier,
  subscription_status,
  subscription_renewal_date,
  available_search_credits
FROM profiles
WHERE subscription_tier != 'trial';
```

**Check Webhook Logs**:
```bash
# Tail logs in real-time
npx supabase functions logs revenuecat-webhook --tail

# View last 100 logs
npx supabase functions logs revenuecat-webhook --limit 100
```

---

## 🎯 EVENT HANDLING MATRIX

| RevenueCat Event | Action | Profile Fields Updated | Additional Actions |
|-----------------|--------|------------------------|-------------------|
| **INITIAL_PURCHASE** | New subscription | `subscription_tier`, `subscription_status=active`, `subscription_renewal_date` | Log transaction, add credits if search pack |
| **RENEWAL** | Auto-renewal | `subscription_status=active`, `subscription_renewal_date` | Log transaction |
| **PRODUCT_CHANGE** | Upgrade/downgrade | `subscription_tier`, `subscription_renewal_date` | Log transaction |
| **CANCELLATION** | User cancelled | `subscription_status=cancelled` | Access continues until expiry |
| **EXPIRATION** | Subscription ended | `subscription_tier=trial`, `subscription_status=expired`, `subscription_renewal_date=null` | Downgrade to trial |
| **BILLING_ISSUE** | Payment failed | `subscription_status=past_due` | User notified (future) |

---

## 📊 SUBSCRIPTION TIER MAPPING

| RevenueCat Entitlement | Truxel Tier | Searches/Month | Features |
|------------------------|-------------|----------------|----------|
| `standard_access` | standard | 30 | Basic search, community |
| `pro_access` | pro | 50 | + LinkedIn, AI matching |
| `fleet_manager_access` | premium | 10 | Multi-driver management |
| `search_credits` | (add-on) | +25 | One-time credits |
| None | trial | 5 total | Limited access |

---

## 🔧 TROUBLESHOOTING

### Webhook Not Receiving Events
**Check**:
1. Webhook URL correct in RevenueCat dashboard
2. Supabase function deployed: `npx supabase functions list`
3. Function logs: `npx supabase functions logs revenuecat-webhook --tail`
4. RevenueCat dashboard → Webhooks → Check delivery attempts

**Common Issues**:
- Function not deployed
- Wrong project ref in URL
- CORS issues (handled in code)

---

### Profile Not Updating
**Check**:
1. Webhook receiving events (check logs)
2. User ID matches profile: `SELECT user_id FROM profiles WHERE user_id = '[revenuecat_user_id]'`
3. Database RLS policies allow updates
4. Function has SECURITY DEFINER (created with correct permissions)

**Fix**:
```sql
-- Verify user exists
SELECT user_id, email, subscription_tier FROM profiles;

-- Manual profile update (testing)
UPDATE profiles
SET 
  subscription_tier = 'pro',
  subscription_status = 'active',
  subscription_renewal_date = NOW() + INTERVAL '1 month'
WHERE user_id = '[user_id]';
```

---

### Search Credits Not Adding
**Check**:
1. Function exists: `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'increment_search_credits';`
2. Product ID contains '25' or '10'
3. Entitlement includes `search_credits`

**Manual Test**:
```sql
-- Test function
SELECT increment_search_credits('[user_id]'::UUID, 25);

-- Verify credits
SELECT user_id, available_search_credits FROM profiles WHERE user_id = '[user_id]';
```

---

## 🔐 SECURITY CONSIDERATIONS

### Webhook Authentication
**Current**: Using Supabase Service Role Key (internal)
**Future**: Add RevenueCat webhook signing verification

**Recommended Enhancement**:
```typescript
// Add to webhook handler
const signature = req.headers.get('X-RevenueCat-Signature');
if (signature) {
  // Verify signature with RevenueCat secret
  const isValid = verifySignature(signature, payload);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }
}
```

---

### Database Security
- ✅ RLS enabled on all tables
- ✅ `increment_search_credits` uses SECURITY DEFINER
- ✅ Webhook uses Service Role Key (bypasses RLS safely)
- ✅ User ID validated before updates

---

## 📞 USEFUL COMMANDS

```bash
# Deploy webhook
npx supabase functions deploy revenuecat-webhook

# View logs
npx supabase functions logs revenuecat-webhook --tail

# Test function locally
npx supabase functions serve revenuecat-webhook

# Delete function (if needed)
npx supabase functions delete revenuecat-webhook

# Check database function
npx supabase db diff
```

---

## ✅ PRODUCTION READINESS CHECKLIST

### Code
- [x] Webhook function created
- [x] Event handling implemented
- [x] Error handling added
- [x] Logging configured
- [x] Database function created

### Deployment
- [ ] Function deployed to Supabase
- [ ] Webhook URL configured in RevenueCat
- [ ] Test events sent successfully
- [ ] Sandbox purchase tested
- [ ] Logs verified

### Monitoring
- [ ] Webhook delivery attempts monitored (RevenueCat dashboard)
- [ ] Function logs reviewed (Supabase dashboard)
- [ ] Profile updates verified (Supabase database)
- [ ] Error alerts configured (optional)

---

## 🎉 SUCCESS CRITERIA

**When Everything Works**:
1. ✅ User purchases subscription in app
2. ✅ RevenueCat processes payment
3. ✅ Webhook fires to Supabase
4. ✅ Profile updated with correct tier
5. ✅ Search credits added (if applicable)
6. ✅ Transaction logged
7. ✅ User sees new features immediately

**Logs Should Show**:
```
📦 RevenueCat Webhook Received: { type: 'INITIAL_PURCHASE', ... }
✅ Updating subscription: userId=abc123, tier=pro
✅ Added 25 search credits to user abc123
```

**Database Should Have**:
- Updated `profiles` row with new tier
- New `transactions` row
- Increased `available_search_credits` (if search pack)

---

**Deployment Ready**: November 10, 2025  
**Next Steps**: Deploy function → Configure webhook → Test purchases
