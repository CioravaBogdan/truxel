# 🎯 Complete RevenueCat Implementation Plan

**Date**: November 10, 2025  
**Objective**: Replace hardcoded Stripe usage with conditional RevenueCat logic for App Store/Play Store readiness

---

## 📋 Current Status

### ✅ What's Already Working
- RevenueCat SDK initialized in `app/_layout.tsx` (lines 41-80)
- Expo Go detection prevents initialization in dev mode
- iOS API Key configured: `appl_bumYuiDXpITzaTYFavBtEbehTSx`
- Webhook deployed to Supabase Edge Functions
- Complete RevenueCat implementation exists in `app/_backup_pricing/pricing_revenuecat.tsx`
- Database schema supports both Stripe and RevenueCat

### ❌ What's Broken
- `app/(tabs)/pricing.tsx` hardcoded to Stripe even in native builds
- Android API key not obtained yet (`goog_xxx` placeholder)
- EAS environment variables missing RevenueCat keys
- Apple Sign In Service ID not configured

---

## 🔧 Implementation Steps

### Step 1: Update `app/(tabs)/pricing.tsx` - Conditional Logic

**Location**: Lines 1-900 (entire file)

**Strategy**: Add conditional rendering based on `isNativeBuild` variable (already defined on line 48)

**Changes**:
1. Create two separate state management blocks:
   - RevenueCat state (offerings, packages, customerInfo)
   - Stripe state (tiers, searchPacks - current)

2. Create two separate loading functions:
   - `loadRevenueCatOfferings()` - Calls revenueCatService
   - `loadStripePricingData()` - Current implementation

3. Create two separate purchase handlers:
   - `handleRevenueCatPurchase(pkg)` - Native IAP
   - `handleStripePurchase(tier)` - Web Checkout (current)

4. Conditional rendering:
```tsx
useEffect(() => {
  if (isNativeBuild) {
    loadRevenueCatOfferings();
  } else {
    loadStripePricingData();
  }
}, [isNativeBuild]);

const handlePurchase = (item: any) => {
  if (isNativeBuild) {
    handleRevenueCatPurchase(item);
  } else {
    handleStripePurchase(item);
  }
};
```

**Implementation Pattern** (from `pricing_revenuecat.tsx`):
```tsx
// RevenueCat state
const [subscriptions, setSubscriptions] = useState<OfferingPackage[]>([]);
const [searchPacks, setSearchPacks] = useState<OfferingPackage[]>([]);
const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

// RevenueCat loading
const loadRevenueCatOfferings = async () => {
  const offerings = await getOfferings();
  setSubscriptions(offerings.subscriptions);
  setSearchPacks(offerings.searchPacks);
  
  const info = await getCustomerInfo();
  setCustomerInfo(info);
};

// RevenueCat purchase
const handleRevenueCatPurchase = async (pkg: OfferingPackage) => {
  const info = await purchasePackage(pkg);
  setCustomerInfo(info);
  await authStore.refreshProfile?.();
  await loadRevenueCatOfferings();
};
```

### Step 2: Add RevenueCat Keys to EAS

**Required Actions**:
```bash
# Add iOS key (already have)
eas secret:create --name TRUXEL_REVENUECAT_IOS_KEY --value appl_bumYuiDXpITzaTYFavBtEbehTSx --scope project

# Add Android key (GET FROM REVENUECAT FIRST)
eas secret:create --name TRUXEL_REVENUECAT_ANDROID_KEY --value goog_XXXXXXXXXXXXXXXX --scope project
```

**Get Android Key**:
1. Go to: https://app.revenuecat.com/projects/proj56445e28
2. Click "Apps & providers" → "+ Add app config"
3. Select "Google Play Store"
4. Copy SDK API Key (starts with `goog_`)

### Step 3: Verify Environment Variables in `app.config.js`

**Already present**:
```javascript
extra: {
  revenueCatIosKey: process.env.TRUXEL_REVENUECAT_IOS_KEY,
  revenueCatAndroidKey: process.env.TRUXEL_REVENUECAT_ANDROID_KEY,
  // ... other vars
}
```

**Verify keys are accessible**:
```tsx
import Constants from 'expo-constants';
const iosKey = Constants.expoConfig?.extra?.revenueCatIosKey;
const androidKey = Constants.expoConfig?.extra?.revenueCatAndroidKey;
```

### Step 4: Apple Sign In Service ID Configuration

**Manual Steps** (User must do this in Apple Developer Console):
1. Go to: https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click **"+"** to add new Service ID
3. Enter:
   - Description: `Truxel iOS App`
   - Identifier: `io.truxel.app` (MUST match bundle ID)
4. Check **"Sign In with Apple"**
5. Click **"Configure"**:
   - Primary App ID: Select your existing Truxel app
   - Domains: `upxocyomsfhqoflwibwn.supabase.co`
   - Return URLs: `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`
6. Save and enable

**Revoke cached tokens** (User must test on device):
```bash
# User must sign out completely from Settings → [User Name] → Sign-In & Security
# Then delete app cache:
# Settings → General → iPhone Storage → Truxel → Delete App
```

### Step 5: Testing Checklist

**Before Rebuild**:
- [ ] RevenueCat keys added to EAS secrets
- [ ] Conditional logic implemented in pricing.tsx
- [ ] Apple Service ID configured
- [ ] User revoked cached Apple tokens

**TestFlight Testing**:
- [ ] Launch app → See RevenueCat offerings (not Stripe checkout)
- [ ] Tap "Subscribe" → Opens iOS native payment sheet (not browser)
- [ ] Complete purchase → Webhook updates database
- [ ] Check profile → Tier updated correctly
- [ ] Check search credits → Credits added correctly

**Apple Sign In Testing**:
- [ ] Tap "Sign in with Apple"
- [ ] No infinite loading
- [ ] No "Unacceptable audience" error
- [ ] Successfully creates/logs in user

---

## 📂 Files Modified

### Primary Changes
1. **`app/(tabs)/pricing.tsx`** - Add conditional logic
   - Lines 48-900: Add RevenueCat state, loading, and purchase handlers
   - Keep existing Stripe logic for Expo Go/web fallback

### No Changes Needed
2. **`app/_layout.tsx`** - Already has RevenueCat initialization ✅
3. **`services/revenueCatService.ts`** - Already functional ✅
4. **`supabase/functions/revenuecat-webhook/index.ts`** - Already deployed ✅
5. **`app.config.js`** - Already exposes env vars ✅

---

## 🚀 Deployment Steps

### 1. Add Environment Variables
```bash
# Verify current secrets
eas secret:list

# Add RevenueCat iOS key
eas secret:create --name TRUXEL_REVENUECAT_IOS_KEY --value appl_bumYuiDXpITzaTYFavBtEbehTSx --scope project --type string

# Get Android key from RevenueCat, then:
eas secret:create --name TRUXEL_REVENUECAT_ANDROID_KEY --value goog_XXXXXXXXXXXXXXXX --scope project --type string
```

### 2. Implement Conditional Logic in Pricing Screen
**(This is the main task - see detailed implementation below)**

### 3. Test Locally with Expo Go
```bash
npx expo start --clear
# Verify Stripe checkout still works (fallback mode)
```

### 4. Build iOS Production
```bash
eas build --platform ios --profile production
```

### 5. Test in TestFlight
- Install new build
- Verify RevenueCat offerings load
- Test purchase flow (native IAP, not Stripe)
- Verify webhook updates database
- Test Apple Sign In (no audience error)

### 6. Build Android Production (After Testing iOS)
```bash
eas build --platform android --profile production
```

---

## 🎯 Success Criteria

### App Store Readiness
- ✅ Native IAP implementation (RevenueCat)
- ✅ No hardcoded Stripe checkout in native builds
- ✅ Apple Sign In working (Service ID configured)
- ✅ Webhook syncing subscriptions to database
- ✅ All environment variables in EAS

### Technical Verification
- ✅ `isNativeBuild` correctly detects platform
- ✅ RevenueCat offerings load in TestFlight
- ✅ Purchase completes via iOS App Store
- ✅ Webhook receives INITIAL_PURCHASE event
- ✅ Database updated with tier and credits
- ✅ Profile refreshes to show new tier

### User Experience
- ✅ No browser opens for purchases
- ✅ Native payment sheet shows iOS pricing
- ✅ Immediate feedback after purchase
- ✅ Search credits appear instantly
- ✅ No "Unacceptable audience" errors

---

## 📝 Implementation Code Template

### New State Variables (Add to pricing.tsx)
```tsx
// RevenueCat-specific state
const [rcSubscriptions, setRcSubscriptions] = useState<OfferingPackage[]>([]);
const [rcSearchPacks, setRcSearchPacks] = useState<OfferingPackage[]>([]);
const [rcCustomerInfo, setRcCustomerInfo] = useState<CustomerInfo | null>(null);
const [userCurrency, setUserCurrency] = useState<'EUR' | 'USD'>('EUR');
```

### New Loading Function
```tsx
const loadRevenueCatOfferings = useCallback(async () => {
  try {
    setIsLoading(true);
    console.log('📦 Loading RevenueCat offerings...');
    
    const offerings = await getRevenueCatOfferings();
    setRcSubscriptions(offerings.subscriptions);
    setRcSearchPacks(offerings.searchPacks);
    setUserCurrency(offerings.userCurrency);
    
    const info = await getCustomerInfo();
    setRcCustomerInfo(info);
    
    console.log('✅ RevenueCat offerings loaded');
  } catch (error: any) {
    console.error('❌ RevenueCat error:', error);
    Toast.show({
      type: 'error',
      text1: t('common.error'),
      text2: error.message,
    });
  } finally {
    setIsLoading(false);
  }
}, [t]);
```

### New Purchase Handler
```tsx
const handleRevenueCatPurchase = async (pkg: OfferingPackage) => {
  if (!profile) return;
  
  try {
    setPurchasingPackage(pkg.identifier);
    console.log('🛒 RevenueCat purchase:', pkg.identifier);
    
    const info = await purchaseRevenueCatPackage(pkg);
    setRcCustomerInfo(info);
    
    await authStore.refreshProfile?.();
    
    Toast.show({
      type: 'success',
      text1: t('subscription.activated'),
      text2: 'Purchase successful! 🎉',
    });
    
    await loadRevenueCatOfferings();
  } catch (error: any) {
    if (error.message !== 'User cancelled purchase') {
      Alert.alert(t('common.error'), error.message);
    }
  } finally {
    setPurchasingPackage(null);
  }
};
```

### Conditional Loading (Replace current useEffect)
```tsx
useEffect(() => {
  console.log('PricingScreen mounted, isNativeBuild:', isNativeBuild);
  
  if (isNativeBuild) {
    loadRevenueCatOfferings();
  } else {
    loadPricingData(); // Current Stripe function
  }
  
  checkSubscriptionStatus();
}, [isNativeBuild, loadRevenueCatOfferings, loadPricingData]);
```

### Conditional Rendering (Modify existing tier cards)
```tsx
{isNativeBuild ? (
  // RevenueCat packages
  rcSubscriptions.map(pkg => (
    <PackageCard 
      key={pkg.identifier}
      package={pkg}
      onPurchase={() => handleRevenueCatPurchase(pkg)}
    />
  ))
) : (
  // Stripe tiers (current implementation)
  tiers.map(tier => (
    <TierCard 
      key={tier.id}
      tier={tier}
      onSubscribe={() => handleSubscribe(tier)}
    />
  ))
)}
```

---

## 🐛 Known Issues & Fixes

### Issue 1: "Install SDK" in RevenueCat Dashboard
**Status**: Expected behavior  
**Fix**: Dashboard updates automatically after first native app connection  
**Action**: None - wait for TestFlight users to connect

### Issue 2: Apple Sign In "Unacceptable audience"
**Status**: Requires manual configuration  
**Fix**: Add Service ID `io.truxel.app` in Apple Developer Console  
**Action**: User must configure (see Step 4 above)

### Issue 3: Infinite loading on first Apple Sign In
**Status**: Under investigation  
**Possible Cause**: OAuth flow timeout or network error  
**Action**: Test with Service ID configured first, then debug if persists

### Issue 4: Android API key placeholder
**Status**: Not yet obtained  
**Fix**: Get from RevenueCat dashboard (Apps & providers)  
**Action**: Required before Android build

---

## 📚 Related Documentation
- `docs/MISSING_EAS_VARIABLES.md` - Environment variable checklist
- `docs/FIX_APPLE_SIGNIN_AUDIENCE.md` - Apple OAuth configuration
- `docs/REVENUECAT_SDK_VERIFICATION.md` - Dashboard SDK detection
- `docs/REVENUECAT_WEBHOOK_FLOW.md` - Webhook event handling
- `.github/copilot-instructions.md` - Project standards and patterns

---

**Next Immediate Action**: Implement conditional logic in `app/(tabs)/pricing.tsx` to use RevenueCat when `isNativeBuild === true`
