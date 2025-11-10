# 🎯 RevenueCat-Only Implementation Strategy

**Date**: November 10, 2025  
**Decision**: Use **ONLY RevenueCat** across all platforms (iOS, Android, Web)

---

## 🔍 Why RevenueCat Only?

### Current Problem
- Duplicate logic: Stripe for web, RevenueCat for native
- Complex conditional rendering based on platform
- Two separate payment flows to maintain
- Confusion about which system is authoritative

### RevenueCat Solution
**RevenueCat supports ALL platforms natively:**
- ✅ **iOS**: Native StoreKit integration
- ✅ **Android**: Native Google Play Billing integration
- ✅ **Web**: Built-in Stripe integration via `@revenuecat/purchases-js`

**Key Insight**: RevenueCat Web SDK uses Stripe as backend automatically! We don't need separate Stripe checkout - RevenueCat handles it.

---

## 📦 RevenueCat Web SDK (`purchases-js`)

### Installation
```bash
npm install --save @revenuecat/purchases-js
```

### Configuration
```typescript
import Purchases from '@revenuecat/purchases-js';

// Configure once at app start
Purchases.configure(apiKey, appUserId);

// Get offerings (works on all platforms)
const offerings = await Purchases.getOfferings();

// Purchase (native IAP on mobile, Stripe on web)
const result = await Purchases.purchase({
  productIdentifier: 'monthly_standard',
  offerId: null // Optional promotional offer
});
```

### How It Works
1. **Mobile (iOS/Android)**: Native in-app purchase sheets
2. **Web**: Opens Stripe Checkout automatically
3. **All platforms**: Same webhook to Supabase
4. **Single source of truth**: RevenueCat dashboard

---

## 🔧 Implementation Plan

### Step 1: Remove Stripe Direct Integration
**Files to clean up:**
- ❌ Remove `services/stripeService.ts` (no longer needed)
- ❌ Remove Stripe-specific imports from `pricing.tsx`
- ❌ Remove conditional `isNativeBuild` logic
- ❌ Remove coupon code UI (not supported in native IAP)

**Keep:**
- ✅ `services/revenueCatService.ts` - Universal service
- ✅ Supabase webhook handler - Already configured
- ✅ Database schema - Already supports both systems

### Step 2: Update `pricing.tsx` to Use RevenueCat Only
```typescript
// Simple, no conditionals
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo
} from '@/services/revenueCatService';

// Load offerings (works on all platforms)
const offerings = await getOfferings();

// Purchase (RevenueCat handles platform differences)
const handlePurchase = async (pkg: OfferingPackage) => {
  const result = await purchasePackage(pkg);
  // Done! Webhook updates database automatically
};
```

### Step 3: Update `services/revenueCatService.ts`
**Current state**: Uses `react-native-purchases` (mobile only)

**Needed**: Add platform detection and use `@revenuecat/purchases-js` for web

```typescript
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases'; // Mobile
import PurchasesWeb from '@revenuecat/purchases-js'; // Web

// Detect platform
const isWeb = Platform.OS === 'web';

export const initialize = async (userId: string) => {
  if (isWeb) {
    PurchasesWeb.configure(apiKey, userId);
  } else {
    await Purchases.configure({ apiKey });
    await Purchases.logIn(userId);
  }
};

export const getOfferings = async () => {
  if (isWeb) {
    return await PurchasesWeb.getOfferings();
  } else {
    return await Purchases.getOfferings();
  }
};

// Same pattern for purchase, restore, etc.
```

### Step 4: Verify Webhook Configuration
**Already done!** ✅
- Webhook: `supabase/functions/revenuecat-webhook/index.ts`
- Handles: INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
- Updates: `profiles` table (tier, credits, status)

**No changes needed** - webhook receives events from ALL platforms (iOS, Android, Web)

---

## 🎨 UI Simplification

### Before (Complex)
```tsx
{/* Coupon section - Stripe only */}
{!isNativeBuild && <CouponCard />}

{/* RevenueCat subscriptions - Native only */}
{isNativeBuild && rcSubscriptions.map(...)}

{/* Stripe subscriptions - Web only */}
{!isNativeBuild && tiers.map(...)}
```

### After (Simple)
```tsx
{/* Universal RevenueCat offerings */}
{subscriptions.map(pkg => (
  <PackageCard
    package={pkg}
    onPurchase={() => handlePurchase(pkg)}
  />
))}

{/* Restore button (all platforms) */}
<Button
  title="Restore Purchases"
  onPress={handleRestorePurchases}
/>
```

---

## 📊 Database Schema (No Changes Needed)

Current `profiles` table already supports RevenueCat:
- ✅ `subscription_tier` - Set by webhook
- ✅ `subscription_status` - active, cancelled, etc.
- ✅ `available_search_credits` - Updated by webhook
- ✅ `revenuecat_customer_id` - User's RevenueCat ID
- ✅ `stripe_customer_id` - Created automatically by RevenueCat for web

**Key**: RevenueCat creates Stripe customers automatically when users purchase on web. We don't manage Stripe directly.

---

## 🔐 Environment Variables

### Keep (Already configured)
```env
TRUXEL_REVENUECAT_IOS_KEY=appl_bumYuiDXpITzaTYFavBtEbehTSx
TRUXEL_REVENUECAT_ANDROID_KEY=goog_xxx (to be obtained)
```

### Remove (No longer needed)
```env
# ❌ Delete these - RevenueCat handles Stripe
TRUXEL_STRIPE_PUBLISHABLE_KEY
TRUXEL_STRIPE_SECRET_KEY
TRUXEL_STRIPE_WEBHOOK_SECRET
```

**Note**: Keep Stripe credentials in `.env` for now (for webhook verification), but don't use them in client code.

---

## 🚀 Benefits

### Developer Experience
- ✅ **Single API**: One service for all platforms
- ✅ **No conditionals**: Same code path everywhere
- ✅ **Simpler testing**: Test once, works everywhere
- ✅ **Less code**: Delete 500+ lines of Stripe logic

### User Experience
- ✅ **Consistent**: Same flow on all platforms
- ✅ **Native**: iOS uses App Store, Android uses Google Play, Web uses Stripe
- ✅ **Seamless**: Users don't see difference between platforms
- ✅ **Restore**: Works automatically across all platforms

### Business Logic
- ✅ **Single dashboard**: RevenueCat shows all revenue
- ✅ **Unified analytics**: One source of truth
- ✅ **Easier support**: Check one system instead of two
- ✅ **Stripe still works**: Revenue shows in Stripe dashboard for web purchases

---

## 📝 Migration Checklist

### 1. Install Web SDK
```bash
npm install --save @revenuecat/purchases-js
```

### 2. Update `services/revenueCatService.ts`
- [ ] Add platform detection
- [ ] Import `@revenuecat/purchases-js` for web
- [ ] Wrap all methods with platform check
- [ ] Test on web browser

### 3. Simplify `app/(tabs)/pricing.tsx`
- [ ] Remove `stripeService` import
- [ ] Remove `isNativeBuild` conditional
- [ ] Remove coupon code section
- [ ] Use only RevenueCat offerings
- [ ] Remove Stripe-specific UI (discount badges, etc.)

### 4. Clean Up Unused Files
- [ ] Delete/archive `services/stripeService.ts`
- [ ] Delete Stripe checkout logic
- [ ] Remove Stripe environment variables from `app.config.js`

### 5. Update Documentation
- [ ] Update README to mention RevenueCat only
- [ ] Remove Stripe setup instructions
- [ ] Add RevenueCat web setup instructions

### 6. Test All Platforms
- [ ] Test iOS purchase (TestFlight)
- [ ] Test Android purchase (when ready)
- [ ] Test web purchase (Expo Go web)
- [ ] Verify webhook updates database for all platforms

---

## 🎯 Next Steps

1. **Install `@revenuecat/purchases-js`**
2. **Update `revenueCatService.ts` with platform detection**
3. **Simplify `pricing.tsx` to use only RevenueCat**
4. **Test on web (Expo Go web view)**
5. **Build and test on iOS (TestFlight)**
6. **Clean up Stripe code**

---

**Result**: One payment system, all platforms, simpler code, better UX! 🎉
