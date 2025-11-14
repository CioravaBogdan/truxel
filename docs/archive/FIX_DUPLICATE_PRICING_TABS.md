# 🔧 Fix: Duplicate Pricing Tabs in TestFlight

**Date**: November 10, 2025  
**Status**: ✅ FIXED - Ready for new build  
**Severity**: HIGH (User-facing bug in production TestFlight)

---

## 🐛 Problem Description

User reported seeing **two identical "Pricing" tabs** in the iOS app on TestFlight (see screenshots):
- Both tabs had identical icons (credit card)
- Both tabs showed the same pricing content
- Navigation was confusing for users

---

## 🔍 Root Cause Analysis

**Expo Router File-Based Routing Issue**:
- Expo Router automatically creates tabs for ALL `.tsx` files in `app/(tabs)/` directory
- Files starting with `_` are ignored (like `_layout.tsx` or `_backup/`)
- Any other `.tsx` file = automatic tab

**What Happened**:
1. Original file: `app/(tabs)/pricing.tsx` (Stripe version)
2. Someone created backup: `app/(tabs)/pricing_stripe_backup.tsx`
3. Expo Router detected BOTH files → Created 2 tabs with same title/icon
4. Result: Duplicate tabs in TestFlight

**File Structure Before Fix**:
```
app/(tabs)/
  ├── pricing.tsx                    # Tab 1 (Active)
  ├── pricing_stripe_backup.tsx      # Tab 2 (Backup - DUPLICATE!)
  └── _layout.tsx
```

---

## ✅ Solution Applied

**Moved backup file to `_backup/` subfolder** (Expo Router ignores folders starting with `_`):

```bash
Move-Item "app/(tabs)/pricing_stripe_backup.tsx" "app/(tabs)/_backup/pricing_stripe_backup.tsx"
```

**File Structure After Fix**:
```
app/(tabs)/
  ├── pricing.tsx                          # ✅ Only tab visible
  ├── _layout.tsx
  └── _backup/                              # ✅ Ignored by Expo Router
      ├── pricing_stripe_backup.tsx        # Safe backup (Stripe)
      └── pricing_revenuecat.tsx           # Ready for iOS/Android native IAP
```

---

## 🚀 Next Steps

### 1. Build New Production Version
```bash
# Build iOS production with fix
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

### 2. Verify in TestFlight
- Install new build on device
- Check bottom tab bar
- **Expected**: Only 1 "Pricing" tab visible
- **Icon**: Credit card icon (CreditCard from lucide-react-native)

### 3. Prepare RevenueCat Migration
Once duplicate tab issue is confirmed fixed:
- Follow `docs/REVENUECAT_DEPLOYMENT_PLAN.md`
- Get real RevenueCat API keys
- Switch to native iOS/Android purchases

---

## 📝 Lessons Learned

### Expo Router Rules to Remember:
1. ✅ **DO**: Use `_backup/` or `_components/` for non-routable files
2. ❌ **DON'T**: Create backup files like `screen_backup.tsx` in route folders
3. ✅ **DO**: Use `.OLD` extension (e.g., `screen.tsx.OLD`) - Expo ignores non-.tsx files
4. ❌ **DON'T**: Use suffixes like `_backup`, `_old`, `_v2` on `.tsx` files in route folders

### Safe Backup Patterns:
```bash
# ✅ GOOD - Hidden folder
app/(tabs)/_backup/pricing_old.tsx

# ✅ GOOD - Non-.tsx extension
app/(tabs)/pricing.tsx.OLD

# ✅ GOOD - Outside tabs folder
app/_archived/pricing_old.tsx

# ❌ BAD - Creates duplicate tab!
app/(tabs)/pricing_backup.tsx
```

---

## 🔗 Related Documents

- **Deployment Plan**: `docs/REVENUECAT_DEPLOYMENT_PLAN.md`
- **RevenueCat Status**: `docs/REVENUECAT_IMPLEMENTATION_STATUS.md`
- **Project Instructions**: `.github/copilot-instructions.md`

---

## ✅ Verification Checklist

After new TestFlight build:
- [ ] Only 1 "Pricing" tab visible
- [ ] Tab icon is credit card
- [ ] Tab opens correctly
- [ ] No console errors
- [ ] No navigation issues
- [ ] Pricing content displays correctly (Stripe version)

---

**Fixed by**: GitHub Copilot  
**Build Version**: Next build after November 10, 2025  
**Files Modified**: `app/(tabs)/pricing_stripe_backup.tsx` (moved to `_backup/`)
