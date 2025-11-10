# 🚀 RevenueCat Deployment Plan - Truxel iOS & Android

**Created**: November 10, 2025  
**Status**: Ready for Implementation  
**Priority**: HIGH - Fix duplicate Pricing tabs in TestFlight

---

## 🚨 PROBLEM IDENTIFIED

### Duplicate Pricing Tabs in TestFlight
**Root Cause**: Expo Router detected 2 files as tabs:
- ✅ `app/(tabs)/pricing.tsx` - Active Stripe version
- ❌ `app/(tabs)/pricing_stripe_backup.tsx` - **DUPLICATE** (moved to `_backup/`)

**Fix Applied**: ✅ Moved `pricing_stripe_backup.tsx` to `app/(tabs)/_backup/`

---

## 📁 Current File Structure

```
app/(tabs)/
  ├── pricing.tsx                          # ✅ Active (Stripe - for Expo Go)
  └── _backup/
      ├── pricing_stripe_backup.tsx        # ✅ Backup (was causing duplicate - FIXED)
      └── pricing_revenuecat.tsx           # ✅ Ready for iOS/Android production

services/
  └── revenueCatService.ts                 # ✅ Complete RevenueCat integration

.env
  ├── TRUXEL_REVENUECAT_IOS_KEY            # ⚠️ Needs real key (currently: appl_xxx)
  └── TRUXEL_REVENUECAT_ANDROID_KEY        # ⚠️ Needs real key (currently: goog_xxx)
```

**✅ VERIFIED VIA MCP (November 10, 2025)**:
- RevenueCat Project: `proj56445e28` (Active)
- iOS App: `app171fed22a7` (Configured with 4 products)
- Stripe App: `app20d77b6d2b` (Active - €32.33 balance)
- Supabase: `upxocyomsfhqoflwibwn` (Healthy - 4 active users)
- Android App: NOT YET CREATED (pending Google Play setup)

---

## 🎯 DEPLOYMENT STRATEGY

### Phase 1: Fix TestFlight (Immediate - Today)
**Goal**: Remove duplicate Pricing tab

**Steps**:
1. ✅ **COMPLETED**: Moved `pricing_stripe_backup.tsx` to `_backup/`
2. **Next**: Build new iOS production build
3. **Next**: Submit to TestFlight

**Commands**:
```bash
# Build iOS production (with current Stripe pricing)
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

**Expected Result**: Only 1 Pricing tab in TestFlight (Stripe version)

---

### Phase 2: Setup RevenueCat (Before iOS Launch)
**Goal**: Get real RevenueCat API keys and initialize SDK

**Steps**:

#### 2.1. Get RevenueCat API Keys (5 minutes)
1. Go to: https://app.revenuecat.com/projects/proj56445e28/apps
2. Click **"Truxel (App Store)"**
3. Go to **"API Keys"** section
4. Copy **iOS API Key** (format: `appl_xxxxxxxxxxxxx`)
5. Update `.env`:
   ```bash
   TRUXEL_REVENUECAT_IOS_KEY=appl_[real_key_here]
   ```

#### 2.2. Initialize RevenueCat SDK in App (30 minutes)
Add to `app/_layout.tsx`:

```typescript
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export default function RootLayout() {
  const [revenueCatReady, setRevenueCatReady] = useState(false);
  
  // Initialize RevenueCat (after native modules)
  useEffect(() => {
    if (!nativeModulesReady) return;
    
    console.log('RootLayout: Initializing RevenueCat...');
    
    const apiKey = Platform.select({
      ios: Constants.expoConfig?.extra?.revenueCatIosKey,
      android: Constants.expoConfig?.extra?.revenueCatAndroidKey,
    });
    
    if (!apiKey || apiKey === '' || apiKey.includes('xxx')) {
      console.warn('⚠️ RevenueCat API key not configured - using Stripe fallback');
      setRevenueCatReady(false);
      return;
    }
    
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG); // For testing
      Purchases.configure({ apiKey });
      console.log('✅ RevenueCat initialized successfully');
      setRevenueCatReady(true);
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      setRevenueCatReady(false);
    }
  }, [nativeModulesReady]);
  
  // ... rest of code
}
```

#### 2.3. Test RevenueCat in Development Build (1-2 hours)

**Requirements**:
- Physical iPhone (not simulator, not Expo Go)
- Apple Sandbox tester account

**Commands**:
```bash
# Build iOS development build (for testing)
eas build --platform ios --profile development

# Download .ipa from Expo dashboard
# Install on device via Xcode or direct install
```

**Test Cases**:
- [ ] Open app → No crashes (RevenueCat initialized)
- [ ] Go to Pricing tab → Should still show Stripe (pricing.tsx active)
- [ ] Check logs: `✅ RevenueCat initialized successfully`

---

### Phase 3: Switch to RevenueCat (When Ready for App Store)
**Goal**: Replace Stripe with native iOS/Android purchases

**Steps**:

#### 3.1. Backup Current Pricing (Safety)
```bash
# Already backed up: app/(tabs)/_backup/pricing_stripe_backup.tsx
```

#### 3.2. Activate RevenueCat Pricing Screen
```bash
# Backup current Stripe version
Move-Item "app/(tabs)/pricing.tsx" "app/(tabs)/_backup/pricing_stripe_production.tsx"

# Activate RevenueCat version
Copy-Item "app/(tabs)/_backup/pricing_revenuecat.tsx" "app/(tabs)/pricing.tsx"
```

**Verify Changes**:
```bash
# Check active file
Get-Content "app/(tabs)/pricing.tsx" -Head 30
# Should see: import { getOfferings, purchasePackage } from '@/services/revenueCatService';
```

#### 3.3. Build Production with RevenueCat
```bash
# Build iOS production
eas build --platform ios --profile production

# Test on TestFlight first (critical!)
eas submit --platform ios
```

#### 3.4. Test Purchases (Apple Sandbox)
**Setup Sandbox Tester**:
1. App Store Connect → Users and Access → Sandbox Testers
2. Create test account (use different email from developer account)
3. On iPhone: Settings → App Store → Sign Out
4. Open Truxel app → Attempt purchase → Sign in with sandbox account

**Test Cases**:
- [ ] Load offerings (check EUR/USD currency)
- [ ] View subscription plans (Standard €29.99, Pro €49.99, Fleet Manager €99.99)
- [ ] View search pack (25 credits €24.99)
- [ ] Purchase Standard subscription → Verify entitlement active
- [ ] Upgrade to Pro → Verify entitlement upgraded
- [ ] Purchase search pack → Verify credits added (Supabase)
- [ ] Cancel subscription from iOS Settings → Verify expiry
- [ ] Restore purchases on new device

**Expected Logs**:
```
LOG  ✅ RevenueCat initialized successfully
LOG  📦 Loading RevenueCat offerings...
LOG  ✅ Offerings loaded: { subscriptions: 6, searchPacks: 2, currency: 'EUR' }
LOG  🛒 Purchasing package: $rc_custom_pro_eur
LOG  ✅ Purchase successful! New tier: pro
```

---

## ⚠️ ROLLBACK PLAN (If Something Goes Wrong)

### Quick Revert to Stripe
```bash
# 1. Restore Stripe pricing
Move-Item "app/(tabs)/_backup/pricing_stripe_production.tsx" "app/(tabs)/pricing.tsx" -Force

# 2. Rebuild
eas build --platform ios --profile production

# 3. Resubmit
eas submit --platform ios
```

### Keep Dual System (Development vs Production)
**Option**: Keep both systems for safety during transition

```typescript
// In app/(tabs)/pricing.tsx - Dynamic switcher
import Constants from 'expo-constants';

const USE_REVENUECAT = Constants.expoConfig?.extra?.revenueCatIosKey && 
                       !Constants.expoConfig?.extra?.revenueCatIosKey.includes('xxx');

export default function PricingScreen() {
  if (USE_REVENUECAT) {
    // Use RevenueCat components
    return <RevenueCatPricing />;
  } else {
    // Fallback to Stripe
    return <StripePricing />;
  }
}
```

---

## 📋 CHECKLIST - Before Going Live

### iOS Requirements
- [ ] **RevenueCat API Key**: Real iOS key in `.env` (not `appl_xxx`)
- [ ] **App Store Products**: Created in App Store Connect
  - [ ] `truxel_2999_1month` (Standard)
  - [ ] `truxel_4999_1month` (Pro)
  - [ ] `truxel_9999_1month` (Fleet Manager)
  - [ ] `truxel_2499_onetime` (25 Search Credits)
- [ ] **RevenueCat Products**: Linked in RevenueCat Dashboard
- [ ] **Entitlements**: Created in RevenueCat
  - [ ] `standard_access`
  - [ ] `pro_access`
  - [ ] `fleet_manager_access`
  - [ ] `search_credits`
- [ ] **Packages**: Created in RevenueCat Offering
  - [ ] `$rc_custom_standard_eur` → `truxel_2999_1month`
  - [ ] `$rc_custom_pro_eur` → `truxel_4999_1month`
  - [ ] `$rc_custom_fleet_eur` → `truxel_9999_1month`
  - [ ] `$rc_search_25` → `truxel_2499_onetime`
- [ ] **Sandbox Testing**: All purchase flows tested
- [ ] **Webhook**: RevenueCat webhook created (optional - for immediate sync)

### Android Requirements (Future)
- [ ] **Google Play Products**: Created in Play Console
- [ ] **Service Account**: JSON uploaded to RevenueCat
- [ ] **RevenueCat Android API Key**: Real key in `.env`
- [ ] **License Testing**: Configured in Play Console

### App Store Review
- [ ] **Privacy Policy**: Updated with subscription terms
- [ ] **Restore Purchases Button**: Visible in Pricing screen ✅
- [ ] **Subscription Terms**: Clear description of benefits ✅
- [ ] **Auto-renewal Disclaimer**: Present in UI ✅
- [ ] **Screenshots**: Updated with RevenueCat pricing

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

### Issue #1: RevenueCat Not Working in Expo Go
**Problem**: RevenueCat requires native code, doesn't work in Expo Go

**Workaround**: Keep Stripe version active for `npx expo start` testing
- Development: Use Expo Go + Stripe (`pricing.tsx`)
- Production: Use EAS Build + RevenueCat (`pricing_revenuecat.tsx`)

### Issue #2: Missing RevenueCat API Keys
**Current State**: `.env` has placeholder keys (`appl_xxx`)

**Impact**: RevenueCat initialization will fail silently

**Fix**: Get real keys from RevenueCat Dashboard (Phase 2.1)

### Issue #3: Package Lookup Key Mismatch
**Problem**: Old package `pkgef8466ad7d5` had wrong lookup key (`$rc_annual` instead of `$rc_custom_pro_eur`)

**Status**: ✅ FIXED - New package `pkgeb6799caaab` created with correct key

**Action**: Delete old package in RevenueCat Dashboard (optional - doesn't affect functionality)

---

## 🔗 QUICK LINKS

### RevenueCat
- **Dashboard**: https://app.revenuecat.com/projects/proj56445e28
- **iOS App**: https://app.revenuecat.com/projects/proj56445e28/apps (click "Truxel (App Store)")
- **Offerings**: https://app.revenuecat.com/projects/proj56445e28/offerings/ofrnga83aac4b57
- **Documentation**: https://www.revenuecat.com/docs

### Apple
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Sandbox Testers**: https://appstoreconnect.apple.com/access/testers
- **Developer Portal**: https://developer.apple.com/account

### Truxel
- **Supabase Dashboard**: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn
- **GitHub Repo**: https://github.com/CioravaBogdan/truxel
- **Expo Dashboard**: https://expo.dev/@cioravabogdan/truxel

---

## 🎯 SUCCESS METRICS

### Phase 1 Complete (Fix Duplicate Tabs)
- ✅ Only 1 Pricing tab visible in TestFlight
- ✅ No navigation errors
- ✅ Stripe purchases still working

### Phase 2 Complete (RevenueCat Setup)
- ✅ RevenueCat SDK initialized (logs show `✅ initialized`)
- ✅ Real API keys in `.env`
- ✅ No crashes on app launch

### Phase 3 Complete (Switch to RevenueCat)
- ✅ All purchase flows tested with sandbox account
- ✅ Entitlements correctly assigned
- ✅ Restore purchases working
- ✅ Search credits sync to Supabase
- ✅ App approved by Apple App Store Review

---

## 📞 NEXT SESSION COMMANDS

### To Resume Work:

```bash
# Check current status
Get-ChildItem "app/(tabs)/pricing*.tsx"

# View active pricing file
Get-Content "app/(tabs)/pricing.tsx" -Head 50

# View RevenueCat backup
Get-Content "app/(tabs)/_backup/pricing_revenuecat.tsx" -Head 50

# Check environment variables
Get-Content ".env" | Select-String "REVENUECAT"

# Build new TestFlight (fix duplicate tabs)
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios

# View build status
eas build:list --limit 5
```

---

**Created by**: GitHub Copilot  
**Last Updated**: November 10, 2025  
**Version**: 1.0
