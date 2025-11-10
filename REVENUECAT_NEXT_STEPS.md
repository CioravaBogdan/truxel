# ✅ RevenueCat Implementation Complete - Next Steps

**Date**: November 10, 2025  
**Status**: ✅ Code Complete - Store Configuration Needed

---

## 🎉 What's Been Completed

### ✅ Backend (100%)
- Database migrations applied (currency, Fleet Manager, Stripe Price IDs)
- RevenueCat project configured (proj56445e28)
- 4 Entitlements created
- 2 Offerings created (default + search_packs)
- 8 Packages created (EUR + USD)
- 8 Products created and mapped to Stripe

### ✅ Mobile Code (100%)
- RevenueCat SDK installed (`react-native-purchases`)
- `lib/revenueCat.ts` - Initialization logic
- `services/revenueCatService.ts` - Complete service layer
- `services/authService.ts` - Auto-init RevenueCat on login/logout
- `app/(tabs)/pricing_revenuecat.tsx` - New pricing screen
- `app.config.js` - RevenueCat API keys configured
- `utils/currency.ts` - Auto-detect EUR/USD based on region

---

## 📋 What You Need To Do

### 1. Get RevenueCat API Keys

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/projects/proj56445e28)
2. Click **"Apps"** in left sidebar
3. Create iOS app:
   - Name: Truxel iOS
   - Platform: Apple App Store
   - Bundle ID: `io.truxel.app`
   - Copy **iOS API Key** (starts with `appl_`)
4. Create Android app:
   - Name: Truxel Android
   - Platform: Google Play
   - Package Name: `io.truxel.app`
   - Copy **Android API Key** (starts with `goog_`)

### 2. Add Keys to .env

```bash
# Add these to .env file:
TRUXEL_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxxx
TRUXEL_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Replace Pricing Screen

```bash
# Backup old pricing
mv app/(tabs)/pricing.tsx app/(tabs)/pricing_stripe_old.tsx

# Use new RevenueCat pricing
mv app/(tabs)/pricing_revenuecat.tsx app/(tabs)/pricing.tsx
```

---

## 🍎 iOS App Store Connect Setup

**Estimated Time**: 30-45 minutes  
**Apple Review**: 1-3 business days

### Products to Create:

| Type | Product ID | Price | Description |
|------|-----------|-------|-------------|
| Subscription | `standard_monthly` | €29.99/month | Standard Plan |
| Subscription | `pro_monthly` | €49.99/month | Pro Plan |
| Subscription | `fleet_manager_monthly` | €29.99/month | Fleet Manager Plan |
| Consumable | `search_pack_25` | €24.99 | 25 Search Credits |

### Full Guide:
📄 **See**: `docs/APP_STORE_CONNECT_SETUP.md`

**Key Steps**:
1. Create subscription group in App Store Connect
2. Create 3 subscriptions + 1 consumable
3. Add pricing for EUR, USD, CAD, MXN regions
4. Upload promotional images (1024x1024)
5. Submit products for review
6. Wait 1-3 days for Apple approval
7. Link Product IDs to RevenueCat
8. Test with sandbox accounts

---

## 🤖 Android Google Play Console Setup

**Estimated Time**: 30-45 minutes  
**Google Review**: Instant or few hours

### Products to Create:

| Type | Product ID | Base Plan ID | Price | Description |
|------|-----------|--------------|-------|-------------|
| Subscription | `standard_monthly` | `monthly-autorenew` | €29.99/month | Standard Plan |
| Subscription | `pro_monthly` | `monthly-autorenew` | €49.99/month | Pro Plan |
| Subscription | `fleet_manager_monthly` | `monthly-autorenew` | €29.99/month | Fleet Manager |
| In-App Product | `search_pack_25` | (none) | €24.99 | 25 Search Credits |

### Full Guide:
📄 **See**: `docs/GOOGLE_PLAY_CONSOLE_SETUP.md`

**Key Steps**:
1. Create 3 subscriptions + 1 in-app product in Play Console
2. Add pricing for EUR, USD, CAD, MXN, RON regions
3. Activate all products (no review needed)
4. Create service account for RevenueCat API access
5. Upload service account JSON to RevenueCat
6. Link Product IDs to RevenueCat
7. Test with license testers

---

## 🧪 Testing Plan

### Phase 1: Sandbox Testing (Before Store Approval)

**iOS:**
```bash
# Build development version
eas build --profile development --platform ios

# Install on iPhone
# Create sandbox test account in App Store Connect
# Test purchases with sandbox account
```

**Android:**
```bash
# Build development version
eas build --profile development --platform android

# Upload to Internal Testing
# Add testers in Play Console
# Test purchases with license testers
```

### Phase 2: Production Testing (After Store Approval)

1. Submit apps to App Review (iOS) and Production (Android)
2. Wait for approval (iOS: 1-3 days, Android: instant)
3. Download from stores
4. Test real purchases (you can refund later)
5. Verify RevenueCat webhooks work correctly

---

## 📱 User Flow After Implementation

1. **New User Signs Up**
   - Auto-detect currency (US/CA/MX → USD, rest → EUR)
   - Start with Trial tier (5 searches)
   - RevenueCat initialized with user ID

2. **User Opens Pricing Screen**
   - Fetch offerings from RevenueCat
   - Show only EUR or USD packages (auto-filtered by region)
   - Display: 3 subscriptions + 1 search pack

3. **User Purchases Subscription**
   - iOS/Android native payment sheet
   - Purchase processed by Apple/Google
   - RevenueCat receives webhook
   - Entitlements activated instantly
   - User tier updated in Supabase (via Stripe webhook)

4. **User Cancels Subscription**
   - Cancel from device settings (iOS Settings or Play Store)
   - Subscription continues until end of period
   - RevenueCat marks as "will not renew"
   - Access continues until expiration

5. **User Restores Purchases**
   - Tap "Restore Purchases" button
   - RevenueCat checks Apple/Google servers
   - Entitlements restored if found
   - User tier updated

---

## 🔧 Troubleshooting

### "RevenueCat API key not found"
```bash
# Add to .env:
TRUXEL_REVENUECAT_IOS_KEY=appl_xxx
TRUXEL_REVENUECAT_ANDROID_KEY=goog_xxx

# Rebuild app:
npx expo start --clear
```

### "Product IDs not found"
- **iOS**: Wait 1-2 hours after Apple approves products
- **Android**: Wait 10-15 minutes after activating products
- Verify Product IDs match exactly in RevenueCat

### "Cannot connect to billing"
- **iOS**: Make sure using sandbox test account, not real Apple ID
- **Android**: Check Google Play Services is up-to-date
- Clear app data and try again

### "Purchase already owned"
- **iOS**: Sign out and back in to sandbox account
- **Android**: Cancel subscription in Play Store and wait 5 minutes

---

## 📊 Analytics & Monitoring

### RevenueCat Dashboard:
- **Overview**: Revenue, active subscriptions, churn rate
- **Charts**: MRR, new subscriptions, trials, cancellations
- **Customers**: Search by email, view purchase history
- **Events**: Real-time purchase events and webhooks

### Monitor These Metrics:
- Conversion rate (trial → paid)
- Most popular tier (Standard vs Pro vs Fleet Manager)
- Search pack sales
- Churn rate by tier
- Regional revenue (EUR vs USD)

---

## 🚀 Deployment Commands

### Build for Testing:
```bash
# iOS TestFlight
eas build --profile preview --platform ios

# Android Internal Testing
eas build --profile preview --platform android
```

### Build for Production:
```bash
# iOS App Store
eas build --profile production --platform ios
eas submit --platform ios

# Android Play Store
eas build --profile production --platform android
eas submit --platform android
```

---

## 📚 Resources

- **RevenueCat Dashboard**: https://app.revenuecat.com/projects/proj56445e28
- **RevenueCat Docs**: https://www.revenuecat.com/docs
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Google Play Console**: https://play.google.com/console/
- **Stripe Dashboard**: https://dashboard.stripe.com/

---

## ✅ Final Checklist

**Code:**
- [x] RevenueCat SDK installed
- [x] revenueCatService.ts created
- [x] pricing_revenuecat.tsx created
- [x] authService.ts updated (init RevenueCat)
- [x] app.config.js updated (API keys)
- [ ] TRUXEL_REVENUECAT_IOS_KEY added to .env
- [ ] TRUXEL_REVENUECAT_ANDROID_KEY added to .env
- [ ] Replace pricing.tsx with pricing_revenuecat.tsx

**iOS App Store:**
- [ ] Create subscription group
- [ ] Create 3 subscriptions (standard, pro, fleet_manager)
- [ ] Create 1 consumable (search_pack_25)
- [ ] Add pricing for EUR/USD/CAD/MXN
- [ ] Submit products for review
- [ ] Wait for Apple approval (1-3 days)
- [ ] Link Product IDs to RevenueCat
- [ ] Test with sandbox accounts

**Android Play Store:**
- [ ] Create 3 subscriptions with base plans
- [ ] Create 1 in-app product
- [ ] Add pricing for EUR/USD/CAD/MXN/RON
- [ ] Activate all products
- [ ] Create service account
- [ ] Upload service account JSON to RevenueCat
- [ ] Link Product IDs to RevenueCat
- [ ] Test with license testers

**Testing:**
- [ ] Test iOS sandbox purchases
- [ ] Test Android license tester purchases
- [ ] Verify entitlements in RevenueCat
- [ ] Test "Restore Purchases" button
- [ ] Verify Supabase profile updates
- [ ] Test currency detection (US → USD, EU → EUR)

**Production:**
- [ ] Submit iOS to App Review
- [ ] Submit Android to Production
- [ ] Monitor RevenueCat webhook events
- [ ] Test real purchase on production
- [ ] Monitor conversion rates

---

**Status**: ✅ Code Complete - Store Configuration Pending  
**Next**: Configure iOS App Store Connect → Configure Google Play Console → Test → Submit
