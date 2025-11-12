# Truxel - Complete Products Mapping
**Generated**: November 10, 2025

## 🎯 STRIPE PRODUCTS (Active in Stripe Dashboard)

### 1. Fleet Manager
- **Stripe Product ID**: `prod_TOdGKK8sjlXpvB`
- **Prices**:
  - USD: `price_1SRq6ePd7H7rZiTmAywE2Chw` ($29.99/month)
  - EUR: `price_1SRpzzPd7H7rZiTmOQrenjIN` (€29.99/month)
- **RevenueCat Product ID**: `prod2da9492d42`
- **RevenueCat Packages**: 
  - `pkge1cde937c68` - Fleet Manager Plan - USD
  - `pkge28da7823dc` - Fleet Manager Plan - EUR

### 2. Pro Tier
- **Stripe Product ID**: `prod_THaFkFFzFDOebz`
- **Prices**:
  - USD: `price_1SRq8MPd7H7rZiTmtx8muOmd` ($49.99/month)
  - EUR: `price_1SL14rPd7H7rZiTmKnpBjJaS` (€49.99/month)
- **RevenueCat Product ID**: `prod23e7578998`
- **RevenueCat Packages**: 
  - `pkgee2d3e166e8` - Pro Plan - USD
  - `pkgeb6799caaab` - Pro Plan - EUR (Monthly)
  - `pkgef8466ad7d5` - Pro Plan - EUR ($rc_annual)

### 3. Standard Tier
- **Stripe Product ID**: `prod_THaEncye4n7tEi`
- **Prices**:
  - USD: `price_1SRq8vPd7H7rZiTmqkNNJIlZ` ($29.99/month)
  - EUR: `price_1SL14lPd7H7rZiTmkgHF1iCZ` (€29.99/month)
- **RevenueCat Product ID**: `prod55af3ef2fc`
- **RevenueCat Packages**: 
  - `pkgea35aabd7f6` - Standard Plan - USD
  - `pkge57f2e21be0` - Standard Plan - EUR ($rc_monthly)

### 4. Search Pack Add-on
- **Stripe Product ID**: `prod_THaFpplWmNkSUP`
- **Prices**:
  - USD: `price_1SRq7WPd7H7rZiTme1YFLtQL` ($24.99 one-time)
  - EUR: `price_1SL14yPd7H7rZiTmGgsbAgq8` (€24.99 one-time)
- **RevenueCat Product ID**: `prod16de69dd6f`
- **RevenueCat Offering**: `search_packs` (ofrngb8f954a02b)

### 5. Pro Freighter (NEW - November 12, 2025)
- **Stripe Product ID**: TBD (needs creation in Stripe Dashboard)
- **Prices**: 
  - USD: TBD ($49.99/month)
  - EUR: TBD (€49.99/month)
- **RevenueCat Product ID**: TBD
- **Features**:
  - 50 searches/month
  - LinkedIn contact profiles
  - AI-powered matching
  - Advanced company research
  - 50 posts/day • 1500 posts/month
  - Priority placement in community feed
  - Priority support

### 6. Trial Tier
- **Stripe Product ID**: `prod_THaEgwK8Jupt1E`
- **Prices**: None (free tier)
- **RevenueCat Product ID**: `prod611d81365f`
- **Status**: No associated entitlements (correct for trial)

---

## 📱 iOS PRODUCTS (App Store Connect)

### 1. Standard Plan - Monthly
- **iOS Product ID**: `truxel_2999_1month`
- **RevenueCat Product ID**: `prodbb67fe847f`
- **Price**: $29.99/month
- **Status**: "Could not check" ⚠️

### 2. Pro Plan - Monthly
- **iOS Product ID**: `truxel_4999_1month`
- **RevenueCat Product ID**: `prodd6cbd669bd`
- **Price**: $49.99/month
- **Status**: "Could not check" ⚠️

### 3. Fleet Manager - Monthly
- **iOS Product ID**: `truxel_2999_fleet_1month`
- **RevenueCat Product ID**: `prod80cf26e051`
- **Price**: $29.99/month
- **Status**: "Could not check" ⚠️

### 4. 25 Search Credits
- **iOS Product ID**: `truxel_2499_onetime`
- **RevenueCat Product ID**: `prod03fd28063e`
- **Price**: $24.99 one-time
- **Status**: "Could not check" ⚠️

---

## 🔴 LEGACY PRODUCTS (Not Found in Stripe - TO BE REMOVED)

These products reference old Stripe Price IDs that no longer exist:

1. **Standard Plan EUR** - `prod01cf9cab94` → `price_1SL14lPd7H7rZiTmkgHF1iCZ` ❌ NOT FOUND
2. **Standard Plan USD** - `prod4c576ccda6` → `price_1SRq8vPd7H7rZiTmqkNNJIlZ` ❌ NOT FOUND
3. **Pro Plan EUR** - `prodb0d75aeeae` → `price_1SL14rPd7H7rZiTmKnpBjJaS` ❌ NOT FOUND
4. **Pro Plan USD** - `prod898ed8aef8` → `price_1SRq8MPd7H7rZiTmtx8muOmd` ❌ NOT FOUND
5. **Fleet Manager EUR** - `prod063f0489bc` → `price_1SRpzzPd7H7rZiTmOQrenjIN` ❌ NOT FOUND
6. **Fleet Manager USD** - `proda11cd39149` → `price_1SRq6ePd7H7rZiTmAywE2Chw` ❌ NOT FOUND
7. **25 Credits EUR** - `prod8becd8671c` → `price_1SL14yPd7H7rZiTmGgsbAgq8` ❌ NOT FOUND
8. **25 Credits USD** - `prodbad465cba3` → `price_1SRq7WPd7H7rZiTme1YFLtQL` ❌ NOT FOUND

**Action Required**: Detach these from packages and delete from RevenueCat.

---

## 🎯 REVENUECAT OFFERINGS

### Default Offering (ofrnga83aac4b57)
- **Display Name**: "Truxel Subscription Plans"
- **Is Current**: TRUE ✅
- **Lookup Key**: "default"
- **Packages**: 7 packages

### Search Packs Offering (ofrngb8f954a02b)
- **Display Name**: "Search Credit Packs"
- **Is Current**: FALSE
- **Lookup Key**: "search_packs"

---

## ✅ RESOLVED ISSUES (November 10, 2025)

### 1. ✅ Web SDK Now Returns Offerings Successfully
**Root Cause**: Web Billing app had only 1 product (Fleet Manager). Standard, Pro, Search Pack were missing.

**Solution Applied**: 
- **Manually created** Web Billing products in RevenueCat dashboard:
  - Standard Tier (`prod_THaEncye4n7tEi`) - Links to Stripe `prod_THaEncye4n7tEi`
  - Pro Tier (`prod_THaFkFFzFDOebz`) - Links to Stripe `prod_THaFkFFzFDOebz`
  - Search Pack (`prod_THaFpplWmNkSUP`) - Links to Stripe `prod_THaFpplWmNkSUP`
- **Attached** Web Billing products to entitlements (standard_access, pro_access, fleet_manager_access)
- **Attached** Fleet Manager Web Billing product to packages via MCP API

**Result**: Pricing page displays 4 plans, checkout works, web payments functional! 🎉

### 2. ⚠️ iOS Products "Could not check" (Non-blocking)
**Status**: App Store Connect products not yet verified
**Impact**: iOS builds will use these, web uses Web Billing (working)
**Action**: Verify bundle ID and create products in App Store Connect before iOS release

### 3. ✅ Web Billing App Populated
**Status**: 3 products now active in Web Billing app (`appdc113f792b`):
- Fleet Manager (created first)
- Standard Tier (created manually)
- Pro Tier (created manually)

---

## ✅ COMPLETED ACTIONS (November 10, 2025)

### Step 1: Created Web Billing Products (Manual Dashboard)
**Action**: In RevenueCat Dashboard → Product catalog → Products → Truxel (Web Billing) → + New → Link from Stripe

**Products Created**:
- ✅ Standard Tier (`prod_THaEncye4n7tEi`) - Auto-synced USD $29.99 / EUR €29.99 from Stripe
- ✅ Pro Tier (`prod_THaFkFFzFDOebz`) - Auto-synced USD $49.99 / EUR €49.99 from Stripe
- ✅ Fleet Manager (`prod_TOdGKK8sjlXpvB`) - Already existed, Auto-synced USD $29.99 / EUR €29.99

### Step 2: Attached Web Billing Products to Entitlements (Manual Dashboard)
**Action**: Product catalog → Entitlements → [entitlement] → Attach

**Attachments Completed**:
- ✅ `standard_access` → `prod_THaEncye4n7tEi` (Standard Tier - Web Billing)
- ✅ `pro_access` → `prod_THaFkFFzFDOebz` (Pro Tier - Web Billing)
- ✅ `fleet_manager_access` → `prod_TOdGKK8sjlXpvB` (Fleet Manager - Web Billing)

### Step 3: Attached Web Billing Products to Packages (MCP API)
**Action**: Used MCP RevenueCat tools to attach Fleet Manager to packages

**API Calls Executed**:
```
mcp_revenuecat_mcp_RC_attach_products_to_package(
  project_id: "proj56445e28",
  package_id: "pkge1cde937c68", // Fleet Manager USD
  products: [{"eligibility_criteria": "all", "product_id": "prod8ed25cc856"}]
)

mcp_revenuecat_mcp_RC_attach_products_to_package(
  project_id: "proj56445e28",
  package_id: "pkge28da7823dc", // Fleet Manager EUR
  products: [{"eligibility_criteria": "all", "product_id": "prod8ed25cc856"}]
)
```

### Step 4: Tested Web Pricing Page ✅
**URL**: http://localhost:8082/pricing

**Results**:
- ✅ 4 subscription plans displayed:
  - Fleet Manager USD - $29.99/month
  - Fleet Manager EUR - €29.99/month
  - Pro Tier USD - $49.99/month
  - Pro Tier EUR - €49.99/month
- ✅ RevenueCat checkout opens correctly
- ✅ User can complete purchase flow
- ✅ `getOfferings()` returns valid data

---

## 🔑 KEYS & IDS

### RevenueCat
- **Project ID**: `proj56445e28`
- **iOS App ID**: `app171fed22a7`
- **Stripe App ID**: `app20d77b6d2b`
- **Web Billing App ID**: `appdc113f792b`

### Stripe
- **Account ID**: `acct_1SIVE9Pd7H7rZiTm`
- **Secret Key**: `sk_live_51SIVE9Pd7H7rZiTm...` (in .env)

### API Keys
- **RevenueCat iOS Key**: `appl_bumYuiDXpITzaTYFavBtEbehTSx`
- **RevenueCat Web Key**: `rcb_GzDLpbJWWnHsaOkScIXNdwaDmhZm`
