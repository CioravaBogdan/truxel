# 🔧 Missing Environment Variables for EAS Production

**Date**: November 10, 2025  
**For**: Truxel iOS/Android Production Builds

---

## ✅ Current Variables in EAS (from production.json)

All Truxel variables are present EXCEPT RevenueCat keys:
- ✅ TRUXEL_SUPABASE_URL
- ✅ TRUXEL_SUPABASE_ANON_KEY  
- ✅ TRUXEL_SUPABASE_SERVICE_ROLE_KEY
- ✅ TRUXEL_STRIPE_PUBLISHABLE_KEY
- ✅ TRUXEL_STRIPE_SECRET_KEY
- ✅ TRUXEL_STRIPE_WEBHOOK_SECRET
- ✅ TRUXEL_GOOGLE_MAPS_API_KEY
- ✅ TRUXEL_N8N_CHAT_WEBHOOK
- ✅ TRUXEL_N8N_CITY_WEBHOOK
- ✅ TRUXEL_N8N_SEARCH_WEBHOOK

---

## ❌ MISSING: RevenueCat API Keys

### Add These to EAS Secrets:

**Command to add**:
```bash
# iOS API Key
eas secret:create --name TRUXEL_REVENUECAT_IOS_KEY --value appl_bumYuiDXpITzaTYFavBtEbehTSx --scope project --type string

# Android API Key (get from RevenueCat dashboard)
eas secret:create --name TRUXEL_REVENUECAT_ANDROID_KEY --value goog_XXXXXXXXXXXXXXXX --scope project --type string
```

**OR Add via EAS Website**:
1. Go to: https://expo.dev/accounts/cioravabogdan/projects/truxel/secrets
2. Click **"Create Secret"**
3. Add both keys:
   - Name: `TRUXEL_REVENUECAT_IOS_KEY`
   - Value: `appl_bumYuiDXpITzaTYFavBtEbehTSx`
   - Environment: `production`
   
   - Name: `TRUXEL_REVENUECAT_ANDROID_KEY`  
   - Value: `goog_XXXXXXXXXXXXXXXX` (get from RevenueCat)
   - Environment: `production`

---

## 🔑 Where to Get Android Key

1. Go to RevenueCat: https://app.revenuecat.com/projects/proj56445e28
2. Click **"Apps & providers"** (left sidebar)
3. Click **"+ Add app config"**
4. Select **"Google Play Store"**
5. Copy the **SDK API Key** (starts with `goog_`)
6. Add to EAS secrets

---

## 🎯 Verification

After adding, verify:

```bash
# List all secrets
eas secret:list

# Should show:
# ✅ TRUXEL_REVENUECAT_IOS_KEY
# ✅ TRUXEL_REVENUECAT_ANDROID_KEY
```

---

## 📋 Complete EAS Environment Variables List

Should have ALL of these:

### RevenueCat (IN-APP PURCHASES)
- `TRUXEL_REVENUECAT_IOS_KEY` - **MISSING - ADD NOW**
- `TRUXEL_REVENUECAT_ANDROID_KEY` - **MISSING - ADD NOW**

### Supabase (DATABASE)
- `TRUXEL_SUPABASE_URL` ✅
- `TRUXEL_SUPABASE_ANON_KEY` ✅
- `TRUXEL_SUPABASE_SERVICE_ROLE_KEY` ✅

### Stripe (FALLBACK PAYMENTS)
- `TRUXEL_STRIPE_PUBLISHABLE_KEY` ✅
- `TRUXEL_STRIPE_SECRET_KEY` ✅
- `TRUXEL_STRIPE_WEBHOOK_SECRET` ✅

### Google Maps (LOCATION)
- `TRUXEL_GOOGLE_MAPS_API_KEY` ✅

### N8N Webhooks (ANALYTICS)
- `TRUXEL_N8N_CHAT_WEBHOOK` ✅
- `TRUXEL_N8N_CITY_WEBHOOK` ✅
- `TRUXEL_N8N_SEARCH_WEBHOOK` ✅

---

## 🚀 After Adding Variables

Rebuild app:
```bash
# iOS
eas build --platform ios --profile production

# Android  
eas build --platform android --profile production
```

The new build will have RevenueCat keys and pricing will use native IAP!

---

**Status**: Ready to add - just need Android API key from RevenueCat dashboard
