# 🚀 IMPLEMENTARE REVENUECAT - GHID COMPLET TRUXEL

**Data:** 10 Noiembrie 2025
**Versiune:** 1.0
**Status:** Production Ready Plan

---

## 📋 CUPRINS

1. [Rezumat Executiv](#rezumat-executiv)
2. [Analiza Aplicației Actuale](#analiza-aplicației-actuale)
3. [De Ce RevenueCat?](#de-ce-revenuecat)
4. [Pregătire - Cerințe Preliminare](#pregătire---cerințe-preliminare)
5. [FAZA 1: Setup App Store Connect](#faza-1-setup-app-store-connect)
6. [FAZA 2: Setup Google Play Console](#faza-2-setup-google-play-console)
7. [FAZA 3: Setup RevenueCat Dashboard](#faza-3-setup-revenuecat-dashboard)
8. [FAZA 4: Instalare SDK și Configurare](#faza-4-instalare-sdk-și-configurare)
9. [FAZA 5: Modificări Cod - Migrare de la Stripe](#faza-5-modificări-cod---migrare-de-la-stripe)
10. [FAZA 6: Sincronizare RevenueCat cu Supabase](#faza-6-sincronizare-revenuecat-cu-supabase)
11. [FAZA 7: Testing](#faza-7-testing)
12. [FAZA 8: Deployment](#faza-8-deployment)
13. [FAZA 9: Monitorizare și Optimizare](#faza-9-monitorizare-și-optimizare)
14. [Întrebări Frecvente](#întrebări-frecvente)
15. [Troubleshooting](#troubleshooting)

---

## REZUMAT EXECUTIV

### 🎯 Obiectiv
Migrarea de la **Stripe direct payment** la **RevenueCat + In-App Purchase (IAP)** pentru compliance 100% cu Apple App Store și Google Play Store.

### ⚠️ PROBLEMA ACTUALĂ
Aplicația Truxel folosește **Stripe** pentru a vinde:
- ❌ **Subscripții recurente** (Standard €9.99, Pro €49.99, Premium €99.99)
- ❌ **Search credits** (one-time purchases: 10, 25, 50 searches)
- ❌ **Feature-uri consumate în aplicație** (LinkedIn access, AI matching, etc.)

**Status rejecție:**
- **Apple App Store:** 🔴 **95% RESPINS** - Încalcă Guidelines 3.1.1
- **Google Play Store:** 🟡 **50% RISC** - Depinde de categorie

### ✅ SOLUȚIA
**RevenueCat + In-App Purchase (IAP)**
- iOS → Apple In-App Purchase
- Android → Google Play Billing
- Web (opțional) → Stripe păstrat pentru B2B
- Backend → Supabase sincronizat cu RevenueCat Webhooks

### 💰 IMPACT FINANCIAR
| Metoda | Comision | Tu Primești (din €10) |
|--------|----------|----------------------|
| Stripe actual | 2.9% + €0.25 | €9.45 |
| Apple/Google IAP (an 1) | 30% | €7.00 |
| Apple/Google IAP (an 2+) | 15% | €8.50 |

### ⏱️ TIMELINE ESTIMAT
- **Configurare conturi:** 2-3 ore
- **Implementare cod:** 2-3 zile
- **Testing:** 1-2 zile
- **Review Apple/Google:** 3-7 zile
- **TOTAL:** 1-2 săptămâni

---

## ANALIZA APLICAȚIEI ACTUALE

### 📊 Structura Actuală

#### **Subscripții (Recurente):**
```typescript
subscription_tiers:
  - standard: €9.99/month, 15 searches/month
  - pro: €49.99/month, 30 searches/month
  - premium: €99.99/month, 100 searches/month
```

#### **Search Packs (One-Time):**
```typescript
additional_search_packs:
  - 10 searches: €4.99
  - 25 searches: €9.99
  - 50 searches: €17.99
```

#### **Features per Tier:**
| Feature | Standard | Pro | Premium |
|---------|----------|-----|---------|
| Searches/month | 15 | 30 | 100 |
| Max results/search | 20 | 50 | 100 |
| LinkedIn contacts | ❌ | ✅ | ✅ |
| AI matching | ❌ | ✅ | ✅ |
| Advanced research | ❌ | ✅ | ✅ |
| Community posts | Limited | Priority | Unlimited |

### 🔧 Arhitectură Actuală

```
┌─────────────┐
│   Mobile    │
│   App       │
│  (Stripe)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Supabase      │
│ Edge Functions  │
│  ┌───────────┐  │
│  │ create-   │  │
│  │ checkout- │  │
│  │ session   │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │  stripe-  │  │
│  │  webhook  │  │
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Stripe │
    │  API   │
    └────────┘
```

### 📁 Fișiere Relevante

**Services:**
- `services/stripeService.ts` - Gestionează Stripe checkout
- `services/searchesService.ts` - Consumă search credits

**Edge Functions:**
- `supabase/functions/create-checkout-session/index.ts` - Creează Stripe sessions
- `supabase/functions/stripe-webhook/index.ts` - Procesează evenimente Stripe
- `supabase/functions/manage-subscription/index.ts` - Upgrade/downgrade

**UI Screens:**
- `app/(tabs)/pricing.tsx` - Ecran subscripții (259 linii)
- `app/(tabs)/search.tsx` - Ecran search (consumă credits)

**Database:**
- `profiles` - User profiles cu Stripe IDs
- `subscription_tiers` - Definițiile tier-urilor
- `additional_search_packs` - Pachete one-time
- `user_search_credits` - Credits purchased
- `transactions` - Istoric plăți

---

## DE CE REVENUECAT?

### ✅ Avantaje RevenueCat

#### 1. **Compliance Garantat**
- 100% conform cu Apple App Store Guidelines
- 100% conform cu Google Play Policies
- Zero risc de rejecție

#### 2. **SDK Unificat**
```typescript
// UN SDK pentru ambele platforme
import Purchases from '@revenuecat/purchases-react-native';

// iOS → Apple StoreKit
// Android → Google Play Billing
// Totul transparent
```

#### 3. **Webhooks Server-to-Server**
- Sincronizare automată cu Supabase
- Events: purchase, renewal, cancellation, refund
- Redundanță: primești eventul chiar dacă app-ul e închis

#### 4. **Dashboard Analytics**
- Real-time revenue tracking
- Churn analysis
- Cohort reports
- A/B testing (paywall experiments)

#### 5. **Customer Support**
- Support direct de la RevenueCat
- Documentație foarte bună
- Community activă

#### 6. **Cross-Platform Restoration**
- User cumpără pe iOS → automatic pe Android
- Transfer subscripții între device-uri
- Family Sharing support

### 🆚 Comparație cu Alternative

| Feature | RevenueCat | Stripe + Manual IAP | Qonversion | Adapty |
|---------|-----------|---------------------|------------|--------|
| **Ușurință implementare** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost (free tier)** | 10K MTR | N/A | 10K MTR | 10K MTR |
| **Documentație** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **React Native SDK** | ✅ Official | ❌ Manual | ✅ | ✅ |
| **Webhooks** | ✅ | ⚠️ Stripe only | ✅ | ✅ |
| **Analytics** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**MTR** = Monthly Tracked Revenue (venit lunar tracked)

### 💵 Pricing RevenueCat

| Plan | Cost | Features |
|------|------|----------|
| **Free** | $0 | Up to $10K MTR/month |
| **Launch** | $299/month | Up to $100K MTR/month |
| **Grow** | $999/month | Up to $500K MTR/month |

**Calculul tău:**
- €9.99 × 100 subscriberi = €999/month = ~$1,050 MTR
- **Free tier este suficient** până la ~1,000 subscriberi

---

## PREGĂTIRE - CERINȚE PRELIMINARE

### ✅ Checklist Pre-Implementare

- [ ] **Apple Developer Account** ($99/an)
  - Program type: Individual sau Organization
  - Status: Active
  - App ID created: `io.truxel.app`

- [ ] **Google Play Developer Account** ($25 one-time)
  - Console access
  - App created: `io.truxel.app`

- [ ] **RevenueCat Account** (Free)
  - Sign up la: https://app.revenuecat.com/signup

- [ ] **Supabase Project**
  - URL: `https://upxocyomsfhqoflwibwn.supabase.co`
  - Service Role Key access

- [ ] **Access la codebase**
  - Git repository
  - Development environment setup
  - Expo CLI installed

---

## FAZA 1: SETUP APP STORE CONNECT

### 📱 Step 1.1: Creează Paid Applications Agreement

1. **Login la App Store Connect:** https://appstoreconnect.apple.com
2. **Navigate:** Agreements, Tax, and Banking → Agreements
3. **Click:** Request pentru "Paid Applications" agreement
4. **Completează:**
   - Contact Information
   - Bank Account Information
   - Tax Forms (W-8 sau W-9)
5. **Submit pentru review** (poate dura 24-48h)

⚠️ **IMPORTANT:** Nu poți crea IAP fără acest agreement activ!

---

### 📦 Step 1.2: Creează In-App Products

#### **A. Subscripții (Auto-Renewable Subscriptions)**

##### **1. Creează Subscription Group**

1. **Navigate:** App Store Connect → Your App → In-App Purchases
2. **Click:** "+" → "Auto-Renewable Subscription"
3. **Subscription Group Name:** `Truxel Premium Access`
4. **Create**

##### **2. Standard Subscription**

**Product Details:**
```
Reference Name: Standard Monthly Subscription
Product ID: io.truxel.app.standard.monthly
```

**Subscription Duration:**
```
1 month (auto-renewable)
```

**Subscription Prices:**
```
Base Price: €9.99
All territories: Auto-fill from base
```

**Localizations (EN):**
```
Display Name: Standard Plan
Description: Get 15 monthly searches with basic features. Perfect for occasional lead generation.
```

**Review Information:**
```
Screenshot: (upload screenshot al pricing page)
Review Notes: Monthly subscription for Standard tier access. Provides 15 searches per month with basic features.
```

**Click:** Save

##### **3. Pro Subscription**

**Product Details:**
```
Reference Name: Pro Monthly Subscription
Product ID: io.truxel.app.pro.monthly
```

**Subscription Duration:**
```
1 month (auto-renewable)
```

**Subscription Prices:**
```
Base Price: €49.99
```

**Localizations (EN):**
```
Display Name: Pro Plan
Description: Get 30 monthly searches with LinkedIn contacts, AI matching, and advanced research. Ideal for growing businesses.
```

**Review Information:**
```
Screenshot: (upload screenshot al pricing page)
Review Notes: Monthly subscription for Pro tier access. Includes LinkedIn integration and AI-powered matching.
```

**Click:** Save

##### **4. Premium Subscription**

**Product Details:**
```
Reference Name: Premium Monthly Subscription
Product ID: io.truxel.app.premium.monthly
```

**Subscription Duration:**
```
1 month (auto-renewable)
```

**Subscription Prices:**
```
Base Price: €99.99
```

**Localizations (EN):**
```
Display Name: Premium Plan
Description: Get 100 monthly searches with unlimited features and maximum results per search. Best for enterprise teams.
```

**Review Information:**
```
Screenshot: (upload screenshot al pricing page)
Review Notes: Monthly subscription for Premium tier access. Unlimited access to all premium features.
```

**Click:** Save

---

#### **B. Non-Consumables (Search Packs)**

⚠️ **IMPORTANT:** Search credits sunt **Consumables**, nu Non-Consumables!

##### **1. 10 Search Pack**

1. **Navigate:** In-App Purchases → "+" → **Consumable**
2. **Product Details:**
```
Reference Name: 10 Additional Searches
Product ID: io.truxel.app.searches.10
```

3. **Price:**
```
Price Tier: €4.99
```

4. **Localizations (EN):**
```
Display Name: 10 Searches
Description: Add 10 extra searches to your account. Never expires.
```

5. **Review Information:**
```
Screenshot: (upload screenshot al search packs section)
Review Notes: One-time purchase of 10 additional search credits.
```

6. **Click:** Save

##### **2. 25 Search Pack**

```
Reference Name: 25 Additional Searches
Product ID: io.truxel.app.searches.25
Price: €9.99
Display Name: 25 Searches
Description: Add 25 extra searches to your account. Never expires.
```

##### **3. 50 Search Pack**

```
Reference Name: 50 Additional Searches
Product ID: io.truxel.app.searches.50
Price: €17.99
Display Name: 50 Searches
Description: Add 50 extra searches to your account. Never expires.
```

---

### 📝 Step 1.3: Notează Product IDs

Creează un fișier pentru referință:

```bash
# ios_product_ids.txt

# Subscriptions
STANDARD_MONTHLY=io.truxel.app.standard.monthly
PRO_MONTHLY=io.truxel.app.pro.monthly
PREMIUM_MONTHLY=io.truxel.app.premium.monthly

# Search Packs (Consumables)
SEARCHES_10=io.truxel.app.searches.10
SEARCHES_25=io.truxel.app.searches.25
SEARCHES_50=io.truxel.app.searches.50
```

---

### 🧪 Step 1.4: Creează Sandbox Tester Accounts

1. **Navigate:** Users and Access → Sandbox Testers
2. **Click:** "+" pentru a adăuga tester
3. **Completează:**
```
Email: test.truxel.ios@gmail.com (sau alt email)
Password: TestPassword123!
Country/Region: Romania (sau țara ta)
```
4. **Repeat** pentru 2-3 testeri

⚠️ **NU folosi email-ul real Apple ID** pentru sandbox testing!

---

## FAZA 2: SETUP GOOGLE PLAY CONSOLE

### 🤖 Step 2.1: Creează Merchant Account

1. **Login la Google Play Console:** https://play.google.com/console
2. **Navigate:** All apps → Truxel → Monetize → Monetization setup
3. **Click:** Create merchant account
4. **Follow steps** pentru Google Payments Merchant Center
5. **Verifică:** Bank account setup

---

### 📦 Step 2.2: Creează In-App Products

#### **A. Subscriptions**

##### **1. Standard Subscription**

1. **Navigate:** Monetize → Subscriptions → Create subscription
2. **Product Details:**
```
Product ID: standard_monthly
Name: Standard Plan
Description: Get 15 monthly searches with basic features
```

3. **Base Plans:**
```
Base plan ID: standard-monthly
Billing period: 1 Month (recurring)
Price: €9.99
Available in: All countries
```

4. **Offers (optional pentru free trial):**
```
Offer ID: standard-trial-7days
Phase 1: Free trial - 7 days
Phase 2: €9.99/month
```

5. **Click:** Activate

##### **2. Pro Subscription**

```
Product ID: pro_monthly
Name: Pro Plan
Description: 30 monthly searches with LinkedIn and AI features
Base plan ID: pro-monthly
Billing period: 1 Month
Price: €49.99
```

##### **3. Premium Subscription**

```
Product ID: premium_monthly
Name: Premium Plan
Description: 100 monthly searches with unlimited features
Base plan ID: premium-monthly
Billing period: 1 Month
Price: €99.99
```

---

#### **B. In-App Products (One-Time Purchases)**

##### **1. 10 Search Pack**

1. **Navigate:** Monetize → In-app products → Create product
2. **Product Details:**
```
Product ID: searches_10
Name: 10 Searches
Description: Add 10 extra searches to your account
Status: Active
```

3. **Pricing:**
```
Default price: €4.99
Country/region prices: Auto-convert
```

4. **Click:** Activate

##### **2. 25 Search Pack**

```
Product ID: searches_25
Name: 25 Searches
Description: Add 25 extra searches
Price: €9.99
```

##### **3. 50 Search Pack**

```
Product ID: searches_50
Name: 50 Searches
Description: Add 50 extra searches
Price: €17.99
```

---

### 📝 Step 2.3: Notează Product IDs

```bash
# android_product_ids.txt

# Subscriptions
STANDARD_MONTHLY=standard_monthly
PRO_MONTHLY=pro_monthly
PREMIUM_MONTHLY=premium_monthly

# Search Packs
SEARCHES_10=searches_10
SEARCHES_25=searches_25
SEARCHES_50=searches_50
```

---

### 🧪 Step 2.4: License Testing

1. **Navigate:** Setup → License testing
2. **Add email accounts** pentru testing:
```
test.truxel.android@gmail.com
```
3. **License response:** RESPOND_NORMALLY

⚠️ Testerii trebuie să fie adăugați ca **Internal testers** în Internal Testing track.

---

## FAZA 3: SETUP REVENUECAT DASHBOARD

### 🎯 Step 3.1: Creează Cont RevenueCat

1. **Sign up:** https://app.revenuecat.com/signup
2. **Choose plan:** Free (suficient pentru început)
3. **Create organization:** `Truxel`

---

### 📱 Step 3.2: Creează App în RevenueCat

1. **Dashboard → Apps → New App**
2. **App name:** `Truxel`
3. **Bundle ID (iOS):** `io.truxel.app`
4. **Package name (Android):** `io.truxel.app`
5. **Create**

---

### 🔗 Step 3.3: Configurează iOS (App Store Connect)

#### **A. Creează API Key în App Store Connect**

1. **Login la App Store Connect:** https://appstoreconnect.apple.com
2. **Navigate:** Users and Access → Keys → In-App Purchase
3. **Click:** "+" pentru a genera App Store Connect API Key
4. **Name:** `RevenueCat Integration`
5. **Click:** Generate
6. **Download** `.p8` file ⚠️ **NU poți re-downloada!**
7. **Notează:**
   - Key ID: `ABC1234DEF`
   - Issuer ID: `xxxx-xxxx-xxxx-xxxx`

#### **B. Configurează în RevenueCat**

1. **RevenueCat Dashboard → Truxel → Project Settings → iOS**
2. **App Store Connect API:**
   - Upload `.p8` file
   - Issuer ID: (paste de mai sus)
   - Key ID: (paste de mai sus)
   - Vendor Number: (găsești în App Store Connect → Agreements)
3. **Save**

---

### 🔗 Step 3.4: Configurează Android (Google Play)

#### **A. Creează Service Account în Google Cloud**

1. **Navigate:** Google Play Console → Setup → API access
2. **Click:** "Create new service account"
3. **Link opens** Google Cloud Console
4. **Create service account:**
```
Name: revenuecat-integration
ID: revenuecat-integration
Description: RevenueCat integration for Truxel
```
5. **Create and Continue**
6. **Grant role:** `Service Account User`
7. **Done**

#### **B. Generate JSON Key**

1. **În Google Cloud → IAM → Service Accounts**
2. **Click** pe service account creat
3. **Keys → Add Key → Create new key**
4. **Key type:** JSON
5. **Create** → Download JSON file

#### **C. Grant Permissions în Google Play Console**

1. **Navigate:** Google Play Console → Users and permissions
2. **Invite new users** → Add email de service account:
```
revenuecat-integration@truxel-xxxxxx.iam.gserviceaccount.com
```
3. **App permissions:** Select Truxel
4. **Account permissions:**
   - View financial data
   - Manage orders and subscriptions
5. **Send invitation**

#### **D. Configurează în RevenueCat**

1. **RevenueCat Dashboard → Truxel → Project Settings → Android**
2. **Google Play Service Account:**
   - Upload JSON key file
3. **Save**

---

### 🛍️ Step 3.5: Creează Products în RevenueCat

#### **A. Creează Entitlements**

Entitlements = Feature access (ceea ce primește user-ul)

1. **Navigate:** RevenueCat Dashboard → Truxel → Entitlements
2. **Create Entitlement:**

**Standard Access:**
```
Identifier: standard_access
Display name: Standard Plan Access
Description: Access to standard tier features
```

**Pro Access:**
```
Identifier: pro_access
Display name: Pro Plan Access
Description: Access to pro tier features (LinkedIn, AI matching)
```

**Premium Access:**
```
Identifier: premium_access
Display name: Premium Plan Access
Description: Access to all premium features
```

**Search Credits:**
```
Identifier: search_credits
Display name: Additional Search Credits
Description: Extra search credits purchased
```

---

#### **B. Creează Offerings**

Offerings = Product packages (ce vinzi)

1. **Navigate:** RevenueCat Dashboard → Truxel → Offerings
2. **Create Offering:**

##### **Default Offering (Subscriptions)**

```
Identifier: default
Display name: Subscription Plans
Description: Main subscription offerings
```

**Add Packages:**

**Package 1 - Standard:**
```
Identifier: standard
Display name: Standard Plan
Package type: Monthly
iOS Product: io.truxel.app.standard.monthly
Android Product: standard_monthly
Attached Entitlements: standard_access
```

**Package 2 - Pro:**
```
Identifier: pro
Display name: Pro Plan
Package type: Monthly
iOS Product: io.truxel.app.pro.monthly
Android Product: pro_monthly
Attached Entitlements: pro_access
```

**Package 3 - Premium:**
```
Identifier: premium
Display name: Premium Plan
Package type: Monthly
iOS Product: io.truxel.app.premium.monthly
Android Product: premium_monthly
Attached Entitlements: premium_access
```

##### **Search Packs Offering**

```
Identifier: search_packs
Display name: Additional Searches
Description: One-time search credit purchases
```

**Add Packages:**

```
Package 1:
  Identifier: searches_10
  iOS Product: io.truxel.app.searches.10
  Android Product: searches_10
  Attached Entitlements: search_credits

Package 2:
  Identifier: searches_25
  iOS Product: io.truxel.app.searches.25
  Android Product: searches_25
  Attached Entitlements: search_credits

Package 3:
  Identifier: searches_50
  iOS Product: io.truxel.app.searches.50
  Android Product: searches_50
  Attached Entitlements: search_credits
```

---

### 🔔 Step 3.6: Configurează Webhooks

1. **Navigate:** RevenueCat Dashboard → Truxel → Integrations → Webhooks
2. **Add webhook:**
```
URL: https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/revenuecat-webhook
Authorization Header: (opțional - vom adăuga după ce creăm function)
```

3. **Events to send:**
   - [x] `INITIAL_PURCHASE` - Prima achiziție
   - [x] `RENEWAL` - Renewal subscripție
   - [x] `CANCELLATION` - Anulare subscripție
   - [x] `UNCANCELLATION` - Reactivare subscripție
   - [x] `NON_RENEWING_PURCHASE` - One-time purchase (search packs)
   - [x] `EXPIRATION` - Expirare subscripție
   - [x] `BILLING_ISSUE` - Probleme de plată

4. **Save**

---

### 🔑 Step 3.7: Notează API Keys

1. **Navigate:** RevenueCat → Truxel → API Keys
2. **Copiază:**

```bash
# RevenueCat API Keys

# Public (Safe for mobile apps)
PUBLIC_API_KEY_IOS=appl_xxxxxxxxxxxxxxx
PUBLIC_API_KEY_ANDROID=goog_xxxxxxxxxxxxxxx

# Secret (Backend only - NEVER in app!)
SECRET_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Authorization (pentru securitate)
WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT:**
- `PUBLIC_API_KEY_*` → poate fi în app
- `SECRET_API_KEY` → DOAR în backend/Supabase
- `WEBHOOK_SECRET` → pentru verificare signature

---

## FAZA 4: INSTALARE SDK ȘI CONFIGURARE

### 📦 Step 4.1: Instalează RevenueCat SDK

```bash
cd E:/truxel

# Install RevenueCat SDK
npm install @revenuecat/purchases-react-native

# iOS dependencies
npx pod-install ios
```

**Verificare în package.json:**
```json
{
  "dependencies": {
    "@revenuecat/purchases-react-native": "^8.3.1"
  }
}
```

---

### ⚙️ Step 4.2: Update Environment Variables

**Creează/Update `.env`:**

```bash
# Existing vars
TRUXEL_SUPABASE_URL=https://upxocyomsfhqoflwibwn.supabase.co
TRUXEL_SUPABASE_ANON_KEY=your_anon_key

# RevenueCat PUBLIC keys (safe for app)
TRUXEL_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxx
TRUXEL_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxx

# DEPRECATED (but keep for web if needed)
TRUXEL_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Update `app.config.js`:**

```javascript
export default {
  expo: {
    // ... existing config
    extra: {
      // Existing
      supabaseUrl: process.env.TRUXEL_SUPABASE_URL,
      supabaseAnonKey: process.env.TRUXEL_SUPABASE_ANON_KEY,

      // ADD RevenueCat
      revenuecatIosKey: process.env.TRUXEL_REVENUECAT_IOS_KEY,
      revenuecatAndroidKey: process.env.TRUXEL_REVENUECAT_ANDROID_KEY,

      // Keep Stripe for web (optional)
      stripePublishableKey: process.env.TRUXEL_STRIPE_PUBLISHABLE_KEY,

      // ... rest of config
    }
  }
};
```

---

### 🔧 Step 4.3: Creează RevenueCat Service

**Creează fișier:** `services/revenuecatService.ts`

```typescript
import Purchases, {
  PurchasesPackage,
  PurchasesOffering,
  CustomerInfo,
  PurchasesEntitlementInfo,
  LOG_LEVEL
} from '@revenuecat/purchases-react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { SubscriptionTier } from '@/types/database.types';

const IOS_API_KEY = Constants.expoConfig?.extra?.revenuecatIosKey || '';
const ANDROID_API_KEY = Constants.expoConfig?.extra?.revenuecatAndroidKey || '';

interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

export const revenuecatService = {
  /**
   * Initialize RevenueCat SDK
   * MUST be called at app launch (in _layout.tsx)
   */
  async initialize(userId?: string): Promise<void> {
    try {
      const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;

      if (!apiKey) {
        throw new Error('RevenueCat API key not configured');
      }

      // Configure SDK
      Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Set to INFO in production

      await Purchases.configure({
        apiKey,
        appUserID: userId, // Link RevenueCat customer to your user ID
      });

      console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      throw error;
    }
  },

  /**
   * Get available subscription offerings
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null) {
        console.log('📦 Available offerings:', offerings.current.identifier);
        return offerings.current;
      } else {
        console.warn('⚠️ No offerings configured in RevenueCat');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      throw error;
    }
  },

  /**
   * Get search packs offering
   */
  async getSearchPacksOffering(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();

      // Get the "search_packs" offering we created in RevenueCat
      const searchPacksOffering = offerings.all['search_packs'];

      if (searchPacksOffering) {
        console.log('📦 Search packs offering available');
        return searchPacksOffering;
      } else {
        console.warn('⚠️ Search packs offering not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to get search packs:', error);
      throw error;
    }
  },

  /**
   * Purchase a subscription package
   */
  async purchaseSubscription(packageToBuy: PurchasesPackage): Promise<PurchaseResult> {
    try {
      console.log('🛒 Purchasing subscription:', packageToBuy.identifier);

      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

      console.log('✅ Purchase successful!', {
        activeSubscriptions: customerInfo.activeSubscriptions,
        entitlements: Object.keys(customerInfo.entitlements.active),
      });

      return {
        success: true,
        customerInfo,
      };
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);

      // Check if user cancelled
      if (error.userCancelled) {
        return {
          success: false,
          error: 'User cancelled purchase',
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed',
      };
    }
  },

  /**
   * Purchase a search pack (consumable)
   */
  async purchaseSearchPack(packageToBuy: PurchasesPackage): Promise<PurchaseResult> {
    try {
      console.log('🛒 Purchasing search pack:', packageToBuy.identifier);

      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

      console.log('✅ Search pack purchased!');

      return {
        success: true,
        customerInfo,
      };
    } catch (error: any) {
      console.error('❌ Search pack purchase failed:', error);

      if (error.userCancelled) {
        return {
          success: false,
          error: 'User cancelled purchase',
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed',
      };
    }
  },

  /**
   * Get customer info (current subscriptions and entitlements)
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      console.log('👤 Customer info:', {
        activeSubscriptions: customerInfo.activeSubscriptions,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
      });

      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to get customer info:', error);
      throw error;
    }
  },

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.activeSubscriptions.length > 0;
    } catch (error) {
      console.error('❌ Failed to check subscription:', error);
      return false;
    }
  },

  /**
   * Get current subscription tier from entitlements
   */
  async getCurrentTier(): Promise<SubscriptionTier> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlements = customerInfo.entitlements.active;

      // Check entitlements in order of priority
      if (activeEntitlements['premium_access']?.isActive) {
        return 'premium';
      } else if (activeEntitlements['pro_access']?.isActive) {
        return 'pro';
      } else if (activeEntitlements['standard_access']?.isActive) {
        return 'standard';
      }

      return 'trial';
    } catch (error) {
      console.error('❌ Failed to get current tier:', error);
      return 'trial';
    }
  },

  /**
   * Check if user has specific entitlement
   */
  async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[entitlementId]?.isActive || false;
    } catch (error) {
      console.error('❌ Failed to check entitlement:', error);
      return false;
    }
  },

  /**
   * Restore purchases (for switching devices)
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      console.log('🔄 Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();

      console.log('✅ Purchases restored:', {
        activeSubscriptions: customerInfo.activeSubscriptions,
      });

      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  },

  /**
   * Identify user (link RevenueCat customer to your user ID)
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('✅ User identified in RevenueCat:', userId);
    } catch (error) {
      console.error('❌ Failed to identify user:', error);
      throw error;
    }
  },

  /**
   * Logout (anonymize RevenueCat customer)
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('✅ User logged out from RevenueCat');
    } catch (error) {
      console.error('❌ Failed to logout:', error);
      throw error;
    }
  },

  /**
   * Get subscription status info for UI display
   */
  async getSubscriptionStatus(): Promise<{
    isActive: boolean;
    tier: SubscriptionTier;
    expirationDate?: Date;
    willRenew: boolean;
  }> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const tier = await this.getCurrentTier();

      // Get the latest subscription
      const latestExpiration = customerInfo.latestExpirationDate;
      const willRenew = !customerInfo.managementURL; // If no management URL, auto-renewing

      return {
        isActive: customerInfo.activeSubscriptions.length > 0,
        tier,
        expirationDate: latestExpiration ? new Date(latestExpiration) : undefined,
        willRenew,
      };
    } catch (error) {
      console.error('❌ Failed to get subscription status:', error);
      return {
        isActive: false,
        tier: 'trial',
        willRenew: false,
      };
    }
  },

  /**
   * Map RevenueCat package to database tier name
   */
  mapPackageToTier(packageIdentifier: string): SubscriptionTier {
    const mapping: Record<string, SubscriptionTier> = {
      'standard': 'standard',
      'pro': 'pro',
      'premium': 'premium',
    };

    return mapping[packageIdentifier] || 'trial';
  },

  /**
   * Get search credits count from package identifier
   */
  getSearchCreditsFromPackage(packageIdentifier: string): number {
    const mapping: Record<string, number> = {
      'searches_10': 10,
      'searches_25': 25,
      'searches_50': 50,
    };

    return mapping[packageIdentifier] || 0;
  },
};
```

---

### 🚀 Step 4.4: Initialize RevenueCat în App

**Update `app/_layout.tsx`:**

```typescript
import { useEffect } from 'react';
import { revenuecatService } from '@/services/revenuecatService';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const { user } = useAuthStore();

  // Initialize RevenueCat on app launch
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // Initialize with user ID if logged in
        await revenuecatService.initialize(user?.id);

        // If user is logged in, identify them in RevenueCat
        if (user?.id) {
          await revenuecatService.identifyUser(user.id);
        }
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
    };

    initRevenueCat();
  }, [user?.id]);

  // ... rest of your layout code
}
```

---

## FAZA 5: MODIFICĂRI COD - MIGRARE DE LA STRIPE

### 🔄 Step 5.1: Update Pricing Screen

**File:** `app/(tabs)/pricing.tsx`

**Schimbări majore:**
1. Replace `stripeService` cu `revenuecatService`
2. Use RevenueCat offerings în loc de database queries
3. Replace Stripe checkout cu RevenueCat purchase flow
4. Remove coupon validation (IAP nu suportă cupoane)

**Updated Code:**

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { revenuecatService } from '@/services/revenuecatService';
import Toast from 'react-native-toast-message';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Sparkles,
} from 'lucide-react-native';
import { PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-react-native';

export default function PricingScreen() {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const profile = authStore?.profile;
  const refreshProfile = authStore?.refreshProfile;

  const [subscriptionOffering, setSubscriptionOffering] = useState<PurchasesOffering | null>(null);
  const [searchPacksOffering, setSearchPacksOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('trial');

  const loadOfferings = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading RevenueCat offerings...');

      // Get subscription offerings
      const subOffering = await revenuecatService.getOfferings();
      setSubscriptionOffering(subOffering);

      // Get search packs offering
      const packsOffering = await revenuecatService.getSearchPacksOffering();
      setSearchPacksOffering(packsOffering);

      // Get current tier from RevenueCat
      const tier = await revenuecatService.getCurrentTier();
      setCurrentTier(tier);

      console.log('Offerings loaded successfully');
    } catch (error: any) {
      console.error('Failed to load offerings:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || 'Failed to load pricing',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const handlePurchaseSubscription = async (pkg: PurchasesPackage) => {
    try {
      setProcessingPackageId(pkg.identifier);
      console.log('Purchasing subscription:', pkg.identifier);

      const result = await revenuecatService.purchaseSubscription(pkg);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t('subscription.activated'),
          text2: `Welcome to ${pkg.identifier} tier! 🎉`,
          visibilityTime: 5000,
        });

        // Refresh profile from database (will be synced via webhook)
        await refreshProfile?.();
        await loadOfferings(); // Refresh to update UI
      } else {
        if (result.error !== 'User cancelled purchase') {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: result.error,
          });
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setProcessingPackageId(null);
    }
  };

  const handlePurchaseSearchPack = async (pkg: PurchasesPackage) => {
    try {
      setProcessingPackageId(pkg.identifier);
      console.log('Purchasing search pack:', pkg.identifier);

      const result = await revenuecatService.purchaseSearchPack(pkg);

      if (result.success) {
        const credits = revenuecatService.getSearchCreditsFromPackage(pkg.identifier);

        Toast.show({
          type: 'success',
          text1: 'Purchase Complete!',
          text2: `${credits} search credits added to your account`,
          visibilityTime: 5000,
        });

        await refreshProfile?.();
      } else {
        if (result.error !== 'User cancelled purchase') {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: result.error,
          });
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setProcessingPackageId(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsLoading(true);
      await revenuecatService.restorePurchases();

      Toast.show({
        type: 'success',
        text1: 'Purchases Restored',
        text2: 'Your subscriptions have been restored',
      });

      await refreshProfile?.();
      await loadOfferings();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Failed to restore purchases',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'standard':
        return <Zap size={32} color="#2563EB" />;
      case 'pro':
        return <Sparkles size={32} color="#7C3AED" />;
      case 'premium':
        return <Shield size={32} color="#DC2626" />;
      default:
        return <CreditCard size={32} color="#64748B" />;
    }
  };

  const getPackagePrice = (pkg: PurchasesPackage): string => {
    return pkg.product.priceString; // Formatted by platform (e.g. "€9.99")
  };

  const isCurrentTier = (packageId: string) => {
    return currentTier === packageId;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <CreditCard size={40} color="#2563EB" />
          <Text style={styles.title}>{t('pricing.title')}</Text>
          <Text style={styles.subtitle}>{t('pricing.subtitle')}</Text>
        </View>

        {/* Current Subscription Info */}
        {currentTier !== 'trial' && (
          <Card style={styles.currentSubscriptionCard}>
            <View style={styles.currentSubscriptionHeader}>
              <Shield size={24} color="#2563EB" />
              <View style={styles.currentSubscriptionInfo}>
                <Text style={styles.currentSubscriptionTitle}>
                  {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
                </Text>
                <Text style={styles.currentSubscriptionStatus}>
                  Active Subscription
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Subscription Packages */}
        <View style={styles.tiersContainer}>
          {subscriptionOffering?.availablePackages.map((pkg) => (
            <Card
              key={pkg.identifier}
              style={
                isCurrentTier(pkg.identifier)
                  ? { ...styles.tierCard, ...styles.currentTierCard }
                  : styles.tierCard
              }
            >
              {isCurrentTier(pkg.identifier) && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    {t('pricing.current_plan')}
                  </Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                {getTierIcon(pkg.identifier)}
                <Text style={styles.tierName}>
                  {pkg.product.title}
                </Text>
                <Text style={styles.tierPrice}>
                  {getPackagePrice(pkg)}
                  <Text style={styles.tierPriceUnit}>
                    /{t('pricing.month')}
                  </Text>
                </Text>
                <Text style={styles.tierDescription}>
                  {pkg.product.description}
                </Text>
              </View>

              {!isCurrentTier(pkg.identifier) ? (
                <Button
                  title={t('pricing.subscribe')}
                  onPress={() => handlePurchaseSubscription(pkg)}
                  loading={processingPackageId === pkg.identifier}
                  variant="primary"
                />
              ) : (
                <Button
                  title={t('pricing.current_plan')}
                  onPress={() => {}}
                  disabled={true}
                  variant="outline"
                />
              )}
            </Card>
          ))}
        </View>

        {/* Search Packs */}
        {searchPacksOffering && searchPacksOffering.availablePackages.length > 0 && (
          <>
            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('pricing.additional_searches')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('pricing.additional_searches_desc')}
              </Text>
            </View>

            <View style={styles.packsContainer}>
              {searchPacksOffering.availablePackages.map((pkg) => (
                <Card key={pkg.identifier} style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <Text style={styles.packName}>
                      {pkg.product.title}
                    </Text>
                    <Text style={styles.packPrice}>
                      {getPackagePrice(pkg)}
                    </Text>
                  </View>

                  <Button
                    title={t('pricing.buy_now')}
                    onPress={() => handlePurchaseSearchPack(pkg)}
                    loading={processingPackageId === pkg.identifier}
                    variant="outline"
                  />
                </Card>
              ))}
            </View>
          </>
        )}

        {/* Restore Purchases Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.restoreButtonText}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('pricing.footer_note')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain mostly the same, add:
const styles = StyleSheet.create({
  // ... existing styles ...

  restoreButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});
```

---

### 🔍 Step 5.2: Remove/Deprecate Stripe Service

**Option A: Complete Removal (Recommended)**

```bash
# Rename for backup
mv services/stripeService.ts services/stripeService.ts.deprecated
```

**Option B: Keep for Web (if you have web version)**

Update `services/stripeService.ts`:

```typescript
// Add warning at top of file
/**
 * @deprecated
 * This service is deprecated for mobile app.
 * Use revenuecatService.ts instead.
 * Only kept for web/admin panel integration.
 */

// Wrap all methods with platform check
import { Platform } from 'react-native';

export const stripeService = {
  async getAvailableSubscriptionTiers() {
    if (Platform.OS !== 'web') {
      throw new Error('Use RevenueCat for mobile purchases');
    }
    // ... existing code
  },
  // ... rest
};
```

---

### 🗑️ Step 5.3: Update Edge Functions (Deprecate Stripe)

**Files to deprecate:**
- `supabase/functions/create-checkout-session/` → Rename to `.deprecated`
- `supabase/functions/manage-subscription/` → Rename to `.deprecated`
- `supabase/functions/validate-coupon/` → Rename to `.deprecated`

**Keep:**
- `supabase/functions/stripe-webhook/` → Poate fi folosit pentru web, dar nu pentru mobile

---

## FAZA 6: SINCRONIZARE REVENUECAT CU SUPABASE

### 🎣 Step 6.1: Creează RevenueCat Webhook Handler

**Creează:** `supabase/functions/revenuecat-webhook/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SUPABASE_URL = Deno.env.get("TRUXEL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("TRUXEL_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

interface RevenueCatEvent {
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number;
    store: string;
    environment: string;
    presented_offering_id: string;
    transaction_id: string;
    original_transaction_id: string;
    is_trial_conversion: boolean;
    entitlement_ids: string[];
    price: number;
    currency: string;
  };
}

// Map RevenueCat product IDs to tier names
function mapProductIdToTier(productId: string): string {
  const mapping: Record<string, string> = {
    // iOS
    'io.truxel.app.standard.monthly': 'standard',
    'io.truxel.app.pro.monthly': 'pro',
    'io.truxel.app.premium.monthly': 'premium',
    // Android
    'standard_monthly': 'standard',
    'pro_monthly': 'pro',
    'premium_monthly': 'premium',
  };

  return mapping[productId] || 'trial';
}

// Map RevenueCat product IDs to search credits
function mapProductIdToSearchCredits(productId: string): number {
  const mapping: Record<string, number> = {
    // iOS
    'io.truxel.app.searches.10': 10,
    'io.truxel.app.searches.25': 25,
    'io.truxel.app.searches.50': 50,
    // Android
    'searches_10': 10,
    'searches_25': 25,
    'searches_50': 50,
  };

  return mapping[productId] || 0;
}

async function handleInitialPurchase(event: RevenueCatEvent['event'], supabase: any) {
  console.log('Handling INITIAL_PURCHASE', event.app_user_id);

  const userId = event.app_user_id;
  const productId = event.product_id;
  const price = event.price;
  const currency = event.currency;

  // Check if it's a subscription or consumable
  const tier = mapProductIdToTier(productId);
  const searchCredits = mapProductIdToSearchCredits(productId);

  if (tier !== 'trial') {
    // It's a subscription
    console.log('Processing subscription purchase:', tier);

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_tier: tier,
        subscription_status: "active",
        monthly_searches_used: 0,
        subscription_renewal_date: new Date(event.expiration_at_ms).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      throw updateError;
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        transaction_type: "subscription",
        tier_or_pack_name: tier,
        amount: price,
        stripe_payment_id: event.transaction_id,
        status: "completed",
      });

    if (transactionError) {
      console.error('Failed to create transaction:', transactionError);
    }

    console.log('Subscription activated successfully');
  } else if (searchCredits > 0) {
    // It's a search pack
    console.log('Processing search pack purchase:', searchCredits, 'credits');

    // Create transaction first
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        transaction_type: "search_pack",
        tier_or_pack_name: `${searchCredits} searches`,
        amount: price,
        stripe_payment_id: event.transaction_id,
        searches_added: searchCredits,
        status: "completed",
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error('Failed to create transaction:', transactionError);
      throw transactionError;
    }

    // Add search credits
    const { error: creditsError } = await supabase
      .from("user_search_credits")
      .insert({
        user_id: userId,
        credits_purchased: searchCredits,
        credits_remaining: searchCredits,
        purchase_transaction_id: transaction.id,
        expires_at: null, // Credits don't expire
      });

    if (creditsError) {
      console.error('Failed to add credits:', creditsError);
      throw creditsError;
    }

    // Update profile available credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("available_search_credits")
      .eq("user_id", userId)
      .single();

    const currentCredits = profile?.available_search_credits || 0;

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        available_search_credits: currentCredits + searchCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (profileUpdateError) {
      console.error('Failed to update profile credits:', profileUpdateError);
    }

    console.log('Search credits added successfully');
  }
}

async function handleRenewal(event: RevenueCatEvent['event'], supabase: any) {
  console.log('Handling RENEWAL', event.app_user_id);

  const userId = event.app_user_id;
  const tier = mapProductIdToTier(event.product_id);

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      monthly_searches_used: 0, // Reset monthly searches on renewal
      subscription_renewal_date: new Date(event.expiration_at_ms).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error('Failed to handle renewal:', error);
    throw error;
  }

  // Create renewal transaction
  await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      transaction_type: "renewal",
      tier_or_pack_name: tier,
      amount: event.price,
      stripe_payment_id: event.transaction_id,
      status: "completed",
    });

  console.log('Renewal processed successfully');
}

async function handleCancellation(event: RevenueCatEvent['event'], supabase: any) {
  console.log('Handling CANCELLATION', event.app_user_id);

  const userId = event.app_user_id;

  // Update profile to cancelled status
  // Note: User still has access until expiration
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error('Failed to handle cancellation:', error);
    throw error;
  }

  console.log('Cancellation processed successfully');
}

async function handleExpiration(event: RevenueCatEvent['event'], supabase: any) {
  console.log('Handling EXPIRATION', event.app_user_id);

  const userId = event.app_user_id;

  // Downgrade to trial
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: "trial",
      subscription_status: "expired",
      monthly_searches_used: 0,
      trial_searches_used: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error('Failed to handle expiration:', error);
    throw error;
  }

  console.log('Expiration processed successfully');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload = await req.text();
    const event: RevenueCatEvent = JSON.parse(payload);

    console.log('Received RevenueCat webhook:', event.event.type);
    console.log('User ID:', event.event.app_user_id);
    console.log('Product ID:', event.event.product_id);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Process event based on type
    switch (event.event.type) {
      case 'INITIAL_PURCHASE':
        await handleInitialPurchase(event.event, supabase);
        break;

      case 'RENEWAL':
        await handleRenewal(event.event, supabase);
        break;

      case 'CANCELLATION':
        await handleCancellation(event.event, supabase);
        break;

      case 'UNCANCELLATION':
        // Reactivate subscription
        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", event.event.app_user_id);
        break;

      case 'NON_RENEWING_PURCHASE':
        // Same as INITIAL_PURCHASE for consumables
        await handleInitialPurchase(event.event, supabase);
        break;

      case 'EXPIRATION':
        await handleExpiration(event.event, supabase);
        break;

      case 'BILLING_ISSUE':
        // Update status to past_due
        await supabase
          .from("profiles")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", event.event.app_user_id);
        break;

      default:
        console.log('Unhandled event type:', event.event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

---

### 🚀 Step 6.2: Deploy Webhook Function

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref upxocyomsfhqoflwibwn

# Deploy the webhook function
supabase functions deploy revenuecat-webhook

# Verify deployment
supabase functions list
```

**Webhook URL va fi:**
```
https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/revenuecat-webhook
```

---

### 🔒 Step 6.3: Configurează Webhook în RevenueCat

1. **Navigate:** RevenueCat Dashboard → Truxel → Integrations → Webhooks
2. **Update webhook URL:**
```
https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/revenuecat-webhook
```
3. **Save**

---

### 🗄️ Step 6.4: Update Database Schema (Optional)

Dacă vrei să trackuiești și RevenueCat-specific data:

```sql
-- Add RevenueCat fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS revenuecat_customer_id TEXT,
ADD COLUMN IF NOT EXISTS revenuecat_original_app_user_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_revenuecat_customer_id
ON profiles(revenuecat_customer_id);

-- Update transactions to support RevenueCat
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS revenuecat_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS store TEXT; -- 'app_store', 'play_store', or 'stripe'

-- Create RevenueCat events log (for debugging)
CREATE TABLE IF NOT EXISTS revenuecat_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  app_user_id TEXT NOT NULL,
  product_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for revenuecat_webhook_events (service role only)
ALTER TABLE revenuecat_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything"
ON revenuecat_webhook_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

## FAZA 7: TESTING

### 🧪 Step 7.1: iOS Sandbox Testing

#### **A. Setup Sandbox Tester**

1. **iOS Device:** Settings → App Store → Sign Out
2. **Sign in** cu sandbox account creat anterior:
```
test.truxel.ios@gmail.com
```

#### **B. Test Subscription Flow**

1. **Build app:** `npm run ios` (sau EAS build)
2. **Navigate** la Pricing screen
3. **Tap** pe Standard Plan → Subscribe
4. **Apple popup** va apărea:
   - Environment: `[Sandbox]`
   - Sign in cu sandbox account
5. **Confirm purchase**
6. **Verify:**
   - UI updated to show active subscription
   - Profile în Supabase updated cu `subscription_tier = 'standard'`
   - Transaction created în database
   - RevenueCat Dashboard shows purchase

#### **C. Test Search Pack Purchase**

1. **Tap** pe "10 Searches" pack
2. **Confirm purchase**
3. **Verify:**
   - `available_search_credits` increased by 10
   - `user_search_credits` row created
   - Transaction recorded

#### **D. Test Restore Purchases**

1. **Delete app** și reinstall
2. **Login** cu același user
3. **Tap** "Restore Purchases"
4. **Verify:**
   - Subscription restored
   - Profile updated

---

### 🤖 Step 7.2: Android Testing

#### **A. Add License Tester**

1. **Google Play Console:** Setup → License testing
2. **Add email:** `test.truxel.android@gmail.com`

#### **B. Internal Testing Track**

1. **Upload APK/AAB** prin EAS:
```bash
eas build --platform android --profile preview
```

2. **Navigate:** Release → Testing → Internal testing
3. **Create release** și upload build
4. **Add testers** (test.truxel.android@gmail.com)
5. **Publish** to internal testing

#### **C. Test Purchase Flow**

1. **Install** app from internal testing link
2. **Navigate** la Pricing
3. **Purchase** subscription
4. **Verify** same as iOS

---

### 🔬 Step 7.3: Webhook Testing

#### **A. Monitor Webhook Logs**

```bash
# Watch Supabase function logs in real-time
supabase functions logs revenuecat-webhook --tail
```

#### **B. Test Webhook Events**

1. **Make a test purchase** (iOS sau Android)
2. **Check logs** pentru webhook call
3. **Verify payload:**
```json
{
  "event": {
    "type": "INITIAL_PURCHASE",
    "app_user_id": "user-uuid-here",
    "product_id": "io.truxel.app.standard.monthly"
  }
}
```
4. **Verify database** updated correctly

---

### 📊 Step 7.4: RevenueCat Dashboard Verification

1. **Navigate:** RevenueCat Dashboard → Truxel → Customers
2. **Find user** by app_user_id
3. **Verify:**
   - Active subscriptions shown
   - Transaction history
   - Entitlements active

---

## FAZA 8: DEPLOYMENT

### 🚢 Step 8.1: Build Production Apps

#### **iOS (App Store)**

```bash
# Build production iOS
eas build --platform ios --profile production

# OR submit directly
eas submit --platform ios --latest
```

**În App Store Connect:**
1. **Upload build** (dacă nu ai folosit `eas submit`)
2. **Navigate:** App Store → iOS App → App Store → Prepare for Submission
3. **Screenshots:** Upload cele mai recente (cu RevenueCat IAP)
4. **Description:** Update dacă menționezi pricing
5. **In-App Purchases:** Verify toate sunt "Ready to Submit"
6. **Submit for Review**

---

#### **Android (Google Play)**

```bash
# Build production Android
eas build --platform android --profile production

# Submit directly
eas submit --platform android --latest
```

**În Google Play Console:**
1. **Upload AAB** (dacă nu ai folosit `eas submit`)
2. **Navigate:** Production → Create new release
3. **Upload build**
4. **Release notes:**
```
- Implemented In-App Purchases for subscriptions
- Added support for additional search credit packs
- Improved payment flow and security
- Bug fixes and performance improvements
```
5. **Review** și **Rollout to Production**

---

### 🔐 Step 8.2: Update Environment Variables (Production)

**Supabase Secrets:**

```bash
# Set RevenueCat production keys in Supabase
supabase secrets set REVENUECAT_WEBHOOK_SECRET=your_production_webhook_secret

# Verify
supabase secrets list
```

**App Environment Variables (pentru EAS Build):**

Update `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "TRUXEL_REVENUECAT_IOS_KEY": "appl_PRODUCTION_KEY",
        "TRUXEL_REVENUECAT_ANDROID_KEY": "goog_PRODUCTION_KEY"
      }
    }
  }
}
```

---

### 📝 Step 8.3: Update App Store Metadata

**App Privacy în App Store Connect:**

1. **Navigate:** App Information → App Privacy
2. **Update:**
   - ✅ Data Linked to User: Purchase History
   - ✅ Data Used to Track User: None (dacă nu faci tracking)
3. **Save**

**Google Play Data Safety:**

1. **Navigate:** App content → Data safety
2. **Update:**
   - Financial Info: ✅ Purchase history
   - Personal Info: ✅ Email, Name
3. **Submit**

---

## FAZA 9: MONITORIZARE ȘI OPTIMIZARE

### 📊 Step 9.1: Setup Analytics

#### **A. RevenueCat Charts**

1. **Navigate:** RevenueCat Dashboard → Truxel → Charts
2. **Key metrics:**
   - Monthly Recurring Revenue (MRR)
   - Active Subscriptions
   - Churn Rate
   - Trial Conversion Rate

#### **B. Custom Supabase Queries**

```sql
-- Revenue per day
SELECT
  DATE(created_at) as date,
  COUNT(*) as transactions,
  SUM(amount) as revenue
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Active subscriptions by tier
SELECT
  subscription_tier,
  COUNT(*) as users,
  subscription_status
FROM profiles
WHERE subscription_tier != 'trial'
GROUP BY subscription_tier, subscription_status;

-- Search credits usage
SELECT
  AVG(monthly_searches_used) as avg_searches,
  subscription_tier
FROM profiles
WHERE subscription_tier != 'trial'
GROUP BY subscription_tier;
```

---

### 🔍 Step 9.2: Monitoring Checklist

- [ ] **RevenueCat Webhook Logs** - Check daily for failed events
- [ ] **Supabase Function Logs** - Monitor for errors
- [ ] **Database Integrity** - Verify profiles sync correctly
- [ ] **Customer Support** - Monitor user feedback on purchases
- [ ] **Refund Requests** - Track in RevenueCat + App Store/Play Store

---

### 🎯 Step 9.3: Optimizare Conversie

#### **A. Paywall Experiments (RevenueCat)**

1. **Navigate:** RevenueCat → Truxel → Experiments
2. **Create experiment:**
   - Control: Current pricing
   - Variant A: Different pricing/positioning
   - Variant B: Free trial offer
3. **Run** for 2-4 weeks
4. **Analyze** conversion rates

#### **B. Pricing Optimization**

Monitorizează:
- Care tier convertește cel mai bine?
- Care search pack se vinde cel mai mult?
- Care e conversion rate pentru fiecare offering?

---

## ÎNTREBĂRI FRECVENTE

### ❓ Pot păstra Stripe pentru web?

**DA!** Arhitectura recomandată:

```
Mobile App (iOS/Android) → RevenueCat IAP
Web App → Stripe Checkout
Admin Panel → Stripe Dashboard
```

- Creează `isWeb` check în cod
- Use `stripeService` doar pe web
- Use `revenuecatService` pe mobile

---

### ❓ Ce se întâmplă cu userii care au subscripții Stripe active?

**Opțiuni:**

**A. Migration Path (Recomandat):**
1. Notifică userii: "We're moving to app store billing"
2. Allow Stripe subscriptions să expire natural
3. Offer discount pentru re-subscribe prin IAP

**B. Dual Support (Temporar):**
- Păstrează Stripe webhook active
- Verifică în app dacă user are Stripe sau IAP subscription
- Gradually migrate users

---

### ❓ Cum gestionez refund-urile?

**Refunds sunt procesate automat:**
1. User request refund în App Store/Play Store
2. Apple/Google procesează refund
3. RevenueCat trimite `REFUND` webhook event
4. Supabase function downgradează user-ul

**Handle în webhook:**
```typescript
case 'REFUND':
  await supabase
    .from("profiles")
    .update({
      subscription_tier: "trial",
      subscription_status: "refunded",
    })
    .eq("user_id", event.app_user_id);
  break;
```

---

### ❓ Cum testez subscripții renewal?

**iOS Sandbox:**
- Subscriptions renew automat accelerat:
  - 1 month → renew every 5 minutes
  - Max 6 renewals în sandbox

**Google Play:**
- Similar accelerated renewal în test environment

**Production:**
- Monitor RevenueCat Dashboard pentru real renewals
- Check `RENEWAL` webhook events

---

### ❓ Family Sharing și Account Sharing?

**Apple Family Sharing:**
- Enable în App Store Connect → Features → Family Sharing
- RevenueCat automatic handles family sharing

**Account Sharing Prevention:**
- RevenueCat supports 1 active subscription per account
- Cross-platform transfer automatic (iOS → Android)

---

## TROUBLESHOOTING

### 🐛 Issue: "No products found" în app

**Cauze:**
- Product IDs nu match între App Store/Play Store și RevenueCat
- Products nu sunt "Ready to Submit"
- RevenueCat API keys greșite

**Fix:**
```typescript
// Add debug logging
const offerings = await Purchases.getOfferings();
console.log('All offerings:', Object.keys(offerings.all));
console.log('Current offering:', offerings.current?.identifier);
console.log('Available packages:', offerings.current?.availablePackages);
```

**Verify:**
1. Product IDs match exact (case-sensitive)
2. Products status = "Approved" în store consoles
3. RevenueCat → Products → Verify attached correctly

---

### 🐛 Issue: Purchase succeeds dar database nu se updatează

**Cauze:**
- Webhook nu ajunge la Supabase
- Webhook authentication failure
- User ID mismatch

**Debug:**
```bash
# Check webhook logs
supabase functions logs revenuecat-webhook --tail

# Check RevenueCat webhook status
# RevenueCat Dashboard → Integrations → Webhooks → Delivery History
```

**Fix:**
1. Verify webhook URL corect
2. Check Supabase function errors
3. Verify `app_user_id` în RevenueCat = `user_id` în profiles

---

### 🐛 Issue: "Purchase already owned" error

**Cauze:**
- User already has active subscription
- Previous test purchase nu a fost consumed (Android)

**Fix (Android Consumables):**
```typescript
// For consumables, ensure you consume the purchase
// RevenueCat handles this automatically for consumables
// But verify in Google Play Console → Order Management
```

**Fix (iOS):**
- Sandbox purchases auto-reset after 6 renewals
- Or delete sandbox tester account și recreate

---

### 🐛 Issue: Restore Purchases nu funcționează

**Cauze:**
- User nu e logged in cu Apple ID/Google account folosit la purchase
- App Bundle ID mismatch
- RevenueCat user ID mismatch

**Fix:**
```typescript
// Ensure you identify user BEFORE calling restorePurchases
await revenuecatService.identifyUser(userId);
await revenuecatService.restorePurchases();
```

---

### 🐛 Issue: Webhook event processing duplicat

**Cauze:**
- RevenueCat retries failed webhooks
- Nu există idempotency check

**Fix:**

Update `revenuecat-webhook/index.ts`:

```typescript
// Add idempotency check
const { data: existingEvent } = await supabase
  .from("revenuecat_webhook_events")
  .select("*")
  .eq("event_type", event.event.type)
  .eq("app_user_id", event.event.app_user_id)
  .eq("processed", true)
  .gte("created_at", new Date(Date.now() - 60000).toISOString()) // Last 60 seconds
  .maybeSingle();

if (existingEvent) {
  console.log('Event already processed recently');
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

---

## 📚 RESURSE SUPLIMENTARE

### Documentație Oficială
- **RevenueCat Docs:** https://docs.revenuecat.com/
- **React Native SDK:** https://docs.revenuecat.com/docs/reactnative
- **Apple In-App Purchase:** https://developer.apple.com/in-app-purchase/
- **Google Play Billing:** https://developer.android.com/google/play/billing

### Video Tutorials
- **RevenueCat Getting Started:** https://www.youtube.com/c/RevenueCat
- **React Native IAP Setup:** https://www.youtube.com/watch?v=dInmkzyv6cY

### Community
- **RevenueCat Community:** https://community.revenuecat.com/
- **RevenueCat Discord:** https://discord.gg/revenuecat

---

## ✅ FINAL CHECKLIST

Înainte de launch în production:

### Pre-Launch
- [ ] Toate products create în App Store Connect
- [ ] Toate products create în Google Play Console
- [ ] RevenueCat configured și linked to stores
- [ ] Offerings și Entitlements configurate
- [ ] Webhook deployed și funcțional
- [ ] SDK integrat corect în app
- [ ] Environment variables set (production)

### Testing
- [ ] iOS sandbox testing complet (subscripții + consumables)
- [ ] Android internal testing complet
- [ ] Restore purchases testat
- [ ] Webhook events verificate în logs
- [ ] Database sync verificat
- [ ] Edge cases testate (refunds, cancellations)

### Production
- [ ] Production builds created (iOS + Android)
- [ ] App Store submission complete
- [ ] Google Play submission complete
- [ ] RevenueCat production API keys set
- [ ] Monitoring setup (RevenueCat Dashboard + Supabase)
- [ ] Customer support briefed on new payment flow

### Post-Launch
- [ ] Monitor first 24h for issues
- [ ] Check webhook delivery success rate
- [ ] Verify first production purchases sync correctly
- [ ] Gather user feedback
- [ ] Plan pricing optimization experiments

---

## 🎉 CONCLUZIE

Această implementare RevenueCat va face aplicația Truxel **100% compliance** cu App Store și Play Store, eliminând complet riscul de rejecție.

**Timeline estimat total:** 1-2 săptămâni
**Efort estimat:** 20-30 ore development + testing
**ROI:** Zero risc de rejecție + Analytics îmbunătățite

**Next Steps:**
1. Începe cu **FAZA 1** (Setup App Store Connect)
2. Lucrează secvențial prin faze
3. Testează comprehensiv înainte de production
4. Launch cu încredere! 🚀

---

**Autor:** Claude (Anthropic)
**Contact Support:** Pentru întrebări specifice, consultă documentația RevenueCat sau community forum.

**Baftă cu implementarea! 🎯**
