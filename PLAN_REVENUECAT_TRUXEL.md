# 🚀 PLAN IMPLEMENTARE REVENUECAT - TRUXEL (Adaptat)

**Data:** 10 Noiembrie 2025  
**Status:** Ready to Execute  
**RevenueCat Project:** HEAVY FORWARDING (proj56445e28)

---

## 📊 ANALIZA APLICAȚIEI ACTUALE TRUXEL (ACTUALIZAT)

### ✅ Subscripții Finale (3 Tiers):

| Tier | Price | Target Audience | Searches/Month | Community Posts | Features | Stripe Product ID | Stripe Price ID |
|------|-------|----------------|----------------|-----------------|----------|-------------------|-----------------|
| **Trial** | FREE | All | 5 | Read-only | Basic | N/A | N/A |
| **Standard** | €29.99/mo (or $29.99) | **Drivers** | 30 | Driver posts: 5/day, 30/month | Basic features | ✅ Exists | `price_1SL14lPd7H7rZiTmkgHF1iCZ` (EUR) |
| **Pro** | €49.99/mo (or $49.99) | **Drivers** | 50 | Driver posts: 10/day, 100/month | LinkedIn + AI + Advanced + **Export Leads** | ✅ Exists | `price_1SL14rPd7H7rZiTmKnpBjJaS` (EUR) |
| **Fleet Manager** 🆕 | €29.99/mo (or $29.99) | **Freight Forwarders** | 10 | **Load posts**: 30/day, 1000/month | Community contact access | `prod_TOdGKK8sjlXpvB` ✅ | **⏳ Manual în Dashboard** |

💡 **NOTA Multi-Currency**: App detectează deja North America pentru Miles vs KM. Extindem logic pentru USD (North America) vs EUR (Europa).

### ✅ Search Packs (1 Pack):

| Pack | Price | Credits | Available For | Stripe Price ID |
|------|-------|---------|---------------|-----------------|
| **25 Searches** | €24.99 | 25 | Active subscribers only | `price_1SL14yPd7H7rZiTmGgsbAgq8` ✅ |

⚠️ **NOTA**: Acest pack EXISTĂ deja în Stripe și Supabase. Trebuie creat doar în RevenueCat + iOS/Android.

---

## 🎯 STRATEGIE DE MIGRARE (ZERO DOWNTIME)

### Opțiunea Recomandată: **PARALLEL SYSTEMS**

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  MOBILE APP (iOS/Android)                       │
│  ✅ RevenueCat → In-App Purchase                │
│  ❌ NU mai folosește Stripe                     │
│                                                  │
└──────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                                                  │
│  WEB APP (viitor - opțional)                    │
│  ✅ Stripe (păstrat pentru web)                 │
│  ❌ NU RevenueCat                                │
│                                                  │
└──────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                SUPABASE                          │
│  ┌────────────────────────────────────────────┐ │
│  │ Edge Function: revenuecat-webhook          │ │
│  │ (similar cu stripe-webhook actual)         │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ Edge Function: stripe-webhook              │ │
│  │ (păstrat pentru web/B2B viitor)            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  profiles: + revenuecat_customer_id             │
│             + revenuecat_entitlements (jsonb)   │
└──────────────────────────────────────────────────┘
```

### De ce această strategie?

1. ✅ **Zero migration** pentru useri existenți - Stripe rămâne activ
2. ✅ **Apple compliance** - Nou useri iOS folosesc doar IAP
3. ✅ **Flexibilitate viitor** - Web app poate folosi Stripe
4. ✅ **Nu pierzi venituri** - Subscripții Stripe active continuă

---

## 📋 FAZE DE IMPLEMENTARE

### FAZA 0: CLARIFICĂRI ✅ COMPLET

**✅ DECIZII FINALE:**

1. **Search Packs**: 3 pachete (10/25/50 searches) disponibile doar pentru subscriberi activi
2. **Tiers**: 3 tiers (Standard/Pro pentru drivers, Fleet Manager pentru freight forwarders)
3. **Community Features**: ACTIVE - limite pe tier (verificate în `subscription_limits` table)
4. **Export Leads**: Restricționat la Pro tier (va fi implementat cu RevenueCat entitlement check)

**✅ INTEGRARE STRIPE ÎN REVENUECAT:**
- **App ID**: `app20d77b6d2b` (Truxel Stripe)
- **Stripe Account**: `acct_1SIVE9Pd7H7rZiTm`
- **Webhook**: `https://api.revenuecat.com/v1/incoming-webhooks/stripe/app20d77b6d2b`
- **App User ID**: Use Stripe Customer ID
- **Customer Portal**: `https://billing.stripe.com/p/login/...`

**🎯 SCOP**: RevenueCat devine **dashboard unificat** pentru toate statisticile (Stripe + IAP)!

---

### FAZA 1: SETUP APP STORE CONNECT ⏱️ 2-3 ore

#### Step 1.1: Creează produse iOS

**⚠️ ATENȚIE**: Folosește ID-uri diferite de Android pentru flexibilitate!

##### Subscripții (Auto-Renewable):

```
Product ID: io.truxel.app.subscription.standard.monthly
Reference Name: Standard Monthly Subscription
Duration: 1 month (auto-renewable)
Price: €29.99
Display Name: Standard Plan
Description: 30 monthly searches with basic features
Subscription Group: truxel_premium_access
```

```
Product ID: io.truxel.app.subscription.pro.monthly
Reference Name: Pro Monthly Subscription
Duration: 1 month
Price: €49.99
Display Name: Pro Plan
Description: 50 monthly searches with LinkedIn, AI matching, and advanced research
Subscription Group: truxel_premium_access
```

##### Search Packs (Consumables):

**⚠️ ATENȚIE**: Acestea sunt **CONSUMABLES**, nu Non-Consumables!

```
Product ID: io.truxel.app.consumable.searches.25
Reference Name: 25 Additional Searches
Product Type: Consumable
Price: €24.99
Display Name: 25 Searches
Description: Add 25 extra searches to your account
```

**DACĂ adaugi mai multe packs (după clarificare):**

```
io.truxel.app.consumable.searches.10 - €4.99
io.truxel.app.consumable.searches.50 - €17.99
```

---

### FAZA 2: SETUP GOOGLE PLAY CONSOLE ⏱️ 2-3 ore

#### Step 2.1: Creează produse Android

##### Subscripții:

```
Product ID: truxel_subscription_standard_monthly
Name: Standard Plan
Base plan ID: standard-base-monthly
Billing period: 1 Month (recurring)
Price: €29.99
```

```
Product ID: truxel_subscription_pro_monthly
Name: Pro Plan
Base plan ID: pro-base-monthly
Billing period: 1 Month
Price: €49.99
```

##### In-App Products (One-Time):

```
Product ID: truxel_consumable_searches_25
Name: 25 Searches
Price: €24.99
Status: Active
```

---

### FAZA 3: SETUP REVENUECAT DASHBOARD ⏱️ 1-2 ore

#### Step 3.1: Verificare proiect existent

✅ **AI DEJA**: HEAVY FORWARDING (proj56445e28)

```bash
# Verifică API keys
mcp_revenuecat_mcp_RC_list_public_api_keys
```

#### Step 3.2: Creează Apps în RevenueCat

**App 1: Truxel iOS**
```
Name: Truxel iOS
Platform: iOS
Bundle ID: io.truxel.app
```

**App 2: Truxel Android**
```
Name: Truxel Android
Platform: Android
Package Name: io.truxel.app
```

#### Step 3.3: Configurează iOS (App Store Connect API)

**⚠️ PAȘI OBLIGATORII:**

1. **App Store Connect** → Users and Access → Keys → In-App Purchase
2. **Generate API Key**: "RevenueCat Integration"
3. **Download** `.p8` file (⚠️ NU poți re-downloada!)
4. **Notează**:
   - Key ID: `ABC1234DEF`
   - Issuer ID: `xxxx-xxxx-xxxx`
   - Vendor Number: (din Agreements)

**Upload în RevenueCat:**
- Dashboard → Truxel iOS → Project Settings → App Store Connect API
- Upload `.p8` + add Key ID + Issuer ID

#### Step 3.4: Configurează Android (Google Play Service Account)

**⚠️ PAȘI OBLIGATORII:**

1. **Google Play Console** → Setup → API access
2. **Create service account**: `revenuecat-truxel`
3. **Generate JSON key** (download)
4. **Grant permissions**:
   - View financial data
   - Manage orders and subscriptions

**Upload în RevenueCat:**
- Dashboard → Truxel Android → Project Settings → Google Play
- Upload JSON key

---

### FAZA 4: DEFINIRE ENTITLEMENTS & OFFERINGS ⏱️ 1 oră

#### Step 4.1: Creează Entitlements

**Entitlements** = Ce primește user-ul (feature access)

```
Identifier: standard_access
Display Name: Standard Tier Access
Description: Access to standard features (30 searches/month)
```

```
Identifier: pro_access  
Display Name: Pro Tier Access
Description: Access to Pro features (50 searches + LinkedIn + AI)
```

```
Identifier: search_credits
Display Name: Additional Search Credits
Description: Extra one-time search credits
```

#### Step 4.2: Creează Offerings

**Offering 1: Subscriptions (default)**

```
Identifier: default
Display Name: Subscription Plans

Packages:
  1. standard_monthly
     - iOS Product: io.truxel.app.subscription.standard.monthly
     - Android Product: truxel_subscription_standard_monthly
     - Entitlement: standard_access
     
  2. pro_monthly
     - iOS Product: io.truxel.app.subscription.pro.monthly
     - Android Product: truxel_subscription_pro_monthly
     - Entitlement: pro_access
```

**Offering 2: Search Packs**

```
Identifier: search_packs
Display Name: Additional Searches

Packages:
  1. searches_25
     - iOS Product: io.truxel.app.consumable.searches.25
     - Android Product: truxel_consumable_searches_25
     - Entitlement: search_credits
```

---

### FAZA 5: INSTALARE SDK ⏱️ 30 min

#### Step 5.1: Instalare dependencies

```bash
npx expo install @revenuecat/purchases-react-native
npx expo install expo-build-properties
```

#### Step 5.2: Configurare `app.config.js`

```javascript
export default {
  // ... existing config
  plugins: [
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '13.0',
        },
        android: {
          minSdkVersion: 21,
        },
      },
    ],
  ],
};
```

#### Step 5.3: Configurare environment variables

```bash
# .env
REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxx
REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxx
```

---

### FAZA 6: CREARE SERVICE REVENUECAT ⏱️ 2-3 ore

#### Step 6.1: Creează `services/revenueCatService.ts`

```typescript
import Purchases, { 
  PurchasesOfferings, 
  PurchasesPackage,
  CustomerInfo,
  PurchasesEntitlementInfo
} from '@revenuecat/purchases-react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const IOS_KEY = Constants.expoConfig?.extra?.revenueCatIosKey;
const ANDROID_KEY = Constants.expoConfig?.extra?.revenueCatAndroidKey;

interface SubscriptionTier {
  identifier: string;
  name: string;
  price: string;
  searches: number;
  features: string[];
  rcPackage: PurchasesPackage;
}

export const revenueCatService = {
  /**
   * Initialize RevenueCat SDK
   * CALL THIS ONCE in App.tsx or _layout.tsx
   */
  async configure(userId?: string): Promise<void> {
    try {
      const apiKey = Platform.select({
        ios: IOS_KEY,
        android: ANDROID_KEY,
      });

      if (!apiKey) {
        throw new Error('RevenueCat API key not configured');
      }

      await Purchases.configure({ apiKey, appUserID: userId });
      
      console.log('RevenueCat configured successfully');
    } catch (error) {
      console.error('RevenueCat configuration error:', error);
      throw error;
    }
  },

  /**
   * Get available subscription offerings
   * Maps to pricing.tsx UI
   */
  async getSubscriptionOfferings(): Promise<SubscriptionTier[]> {
    try {
      const offerings: PurchasesOfferings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.warn('No current offering available');
        return [];
      }

      const tiers: SubscriptionTier[] = [];

      // Standard package
      const standardPkg = offerings.current.availablePackages.find(
        pkg => pkg.identifier === 'standard_monthly'
      );
      
      if (standardPkg) {
        tiers.push({
          identifier: 'standard',
          name: 'Standard Plan',
          price: standardPkg.product.priceString,
          searches: 30,
          features: ['30 searches/month', 'Basic features', 'Email support'],
          rcPackage: standardPkg,
        });
      }

      // Pro package
      const proPkg = offerings.current.availablePackages.find(
        pkg => pkg.identifier === 'pro_monthly'
      );
      
      if (proPkg) {
        tiers.push({
          identifier: 'pro',
          name: 'Pro Plan',
          price: proPkg.product.priceString,
          searches: 50,
          features: [
            '50 searches/month',
            'LinkedIn contacts',
            'AI matching',
            'Advanced research',
            'Priority support'
          ],
          rcPackage: proPkg,
        });
      }

      return tiers;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      throw error;
    }
  },

  /**
   * Get search packs offerings
   */
  async getSearchPackOfferings(): Promise<any[]> {
    try {
      const offerings = await Purchases.getOfferings();
      
      const searchPacksOffering = offerings.all['search_packs'];
      if (!searchPacksOffering) {
        return [];
      }

      return searchPacksOffering.availablePackages.map(pkg => ({
        identifier: pkg.identifier,
        name: pkg.product.title,
        price: pkg.product.priceString,
        searches: parseInt(pkg.identifier.replace('searches_', '')),
        rcPackage: pkg,
      }));
    } catch (error) {
      console.error('Error fetching search packs:', error);
      return [];
    }
  },

  /**
   * Purchase subscription
   */
  async purchaseSubscription(rcPackage: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(rcPackage);
      console.log('Purchase successful:', customerInfo);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
      } else {
        console.error('Purchase error:', error);
      }
      throw error;
    }
  },

  /**
   * Purchase search pack (consumable)
   */
  async purchaseSearchPack(rcPackage: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(rcPackage);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
      }
      throw error;
    }
  },

  /**
   * Get current customer info (active entitlements)
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  },

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Check for standard_access or pro_access entitlements
      const hasStandard = customerInfo.entitlements.active['standard_access'] !== undefined;
      const hasPro = customerInfo.entitlements.active['pro_access'] !== undefined;
      
      return hasStandard || hasPro;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  },

  /**
   * Get active subscription tier
   */
  async getActiveTier(): Promise<'trial' | 'standard' | 'pro' | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      if (customerInfo.entitlements.active['pro_access']) {
        return 'pro';
      }
      if (customerInfo.entitlements.active['standard_access']) {
        return 'standard';
      }
      
      return 'trial';
    } catch (error) {
      console.error('Error getting active tier:', error);
      return null;
    }
  },

  /**
   * Restore purchases (for new device)
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('Purchases restored:', customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('Restore purchases error:', error);
      throw error;
    }
  },

  /**
   * Identify user (link purchases to Supabase user_id)
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('RevenueCat user identified:', userId);
    } catch (error) {
      console.error('Error identifying user:', error);
      throw error;
    }
  },

  /**
   * Logout (anonymous user)
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('RevenueCat user logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
};
```

---

### FAZA 7: EDGE FUNCTION WEBHOOK ⏱️ 2 ore

#### Step 7.1: Creează `supabase/functions/revenuecat-webhook/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const SUPABASE_URL = Deno.env.get("TRUXEL_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("TRUXEL_SUPABASE_SERVICE_ROLE_KEY");
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RevenueCatEvent {
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms?: number;
    store: string;
    entitlement_ids: string[];
  };
  api_version: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RevenueCatEvent = await req.json();
    console.log("RevenueCat webhook received:", body.event.type);

    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get("x-revenuecat-signature");
    if (REVENUECAT_WEBHOOK_SECRET && signature) {
      // TODO: Implement signature verification
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { event } = body;
    const userId = event.app_user_id;

    // Handle different event types
    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
        await handleSubscriptionActivated(supabase, event);
        break;
        
      case "CANCELLATION":
        await handleSubscriptionCancelled(supabase, event);
        break;
        
      case "EXPIRATION":
        await handleSubscriptionExpired(supabase, event);
        break;
        
      case "NON_RENEWING_PURCHASE":
        await handleSearchPackPurchased(supabase, event);
        break;
        
      case "BILLING_ISSUE":
        await handleBillingIssue(supabase, event);
        break;
        
      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("RevenueCat webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleSubscriptionActivated(supabase: any, event: any) {
  console.log("Activating subscription for user:", event.app_user_id);

  // Determine tier from entitlements
  let tier = "trial";
  if (event.entitlement_ids.includes("pro_access")) {
    tier = "pro";
  } else if (event.entitlement_ids.includes("standard_access")) {
    tier = "standard";
  }

  // Get searches per month
  const searchesPerMonth = tier === "pro" ? 50 : tier === "standard" ? 30 : 5;

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: "active",
      revenuecat_customer_id: event.app_user_id,
      revenuecat_entitlements: event.entitlement_ids,
      available_search_credits: searchesPerMonth,
      monthly_searches_used: 0,
      stripe_current_period_end: new Date(event.expiration_at_ms || Date.now() + 30*24*60*60*1000),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", event.app_user_id);

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  console.log(`Subscription activated: ${event.app_user_id} → ${tier}`);
}

async function handleSubscriptionCancelled(supabase: any, event: any) {
  console.log("Cancelling subscription for user:", event.app_user_id);

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", event.app_user_id);

  if (error) throw error;
}

async function handleSubscriptionExpired(supabase: any, event: any) {
  console.log("Expiring subscription for user:", event.app_user_id);

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: "trial",
      subscription_status: "expired",
      available_search_credits: 5,
      monthly_searches_used: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", event.app_user_id);

  if (error) throw error;
}

async function handleSearchPackPurchased(supabase: any, event: any) {
  console.log("Search pack purchased:", event.app_user_id, event.product_id);

  // Extract search count from product_id (e.g., "searches_25" → 25)
  const matches = event.product_id.match(/searches_(\d+)/);
  const searchCount = matches ? parseInt(matches[1]) : 0;

  if (searchCount > 0) {
    // Increment available credits
    const { error } = await supabase.rpc("increment_search_credits", {
      p_user_id: event.app_user_id,
      p_credits: searchCount,
    });

    if (error) {
      console.error("Error incrementing credits:", error);
      throw error;
    }

    // Log transaction
    await supabase.from("transactions").insert({
      user_id: event.app_user_id,
      transaction_type: "search_pack",
      tier_or_pack_name: `${searchCount} searches`,
      amount: 0, // RevenueCat doesn't provide price in webhook
      searches_added: searchCount,
      status: "completed",
    });

    console.log(`Added ${searchCount} search credits to ${event.app_user_id}`);
  }
}

async function handleBillingIssue(supabase: any, event: any) {
  console.log("Billing issue for user:", event.app_user_id);

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", event.app_user_id);

  if (error) throw error;
}
```

#### Step 7.2: Deploy Edge Function

```bash
# Set webhook secret
npx supabase secrets set REVENUECAT_WEBHOOK_SECRET="your_webhook_secret"

# Deploy function
npx supabase functions deploy revenuecat-webhook

# Update config.toml
```

```toml
# supabase/config.toml
[functions.revenuecat-webhook]
verify_jwt = false  # Public webhook from RevenueCat
```

#### Step 7.3: Configurează în RevenueCat Dashboard

```
URL: https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/revenuecat-webhook
Authorization: (opțional)
```

---

### FAZA 8: DATABASE MIGRATIONS ⏱️ 30 min

#### Step 8.1: Creează migration

```sql
-- supabase/migrations/20251110_add_revenuecat_support.sql

-- Add RevenueCat columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS revenuecat_customer_id TEXT,
ADD COLUMN IF NOT EXISTS revenuecat_entitlements JSONB DEFAULT '[]'::jsonb;

-- Create RPC function to increment search credits
CREATE OR REPLACE FUNCTION increment_search_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET available_search_credits = available_search_credits + p_credits,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for fast RevenueCat customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_revenuecat_customer_id 
ON profiles(revenuecat_customer_id);
```

```bash
npx supabase db push
```

---

### FAZA 9: MODIFICARE PRICING.TSX ⏱️ 3-4 ore

#### Step 9.1: Import RevenueCat service

```typescript
// app/(tabs)/pricing.tsx
import { revenueCatService } from '@/services/revenueCatService';
import { PurchasesPackage } from '@revenuecat/purchases-react-native';
```

#### Step 9.2: Înlocuire state management

```typescript
// Replace Stripe state with RevenueCat
const [rcOfferings, setRcOfferings] = useState<any[]>([]);
const [rcSearchPacks, setRcSearchPacks] = useState<any[]>([]);
const [isLoadingRC, setIsLoadingRC] = useState(true);
```

#### Step 9.3: Load offerings function

```typescript
const loadRevenueCatOfferings = useCallback(async () => {
  try {
    setIsLoadingRC(true);
    console.log('Loading RevenueCat offerings...');

    const [subscriptions, searchPacks] = await Promise.all([
      revenueCatService.getSubscriptionOfferings(),
      revenueCatService.getSearchPackOfferings(),
    ]);

    setRcOfferings(subscriptions);
    setRcSearchPacks(searchPacks);
  } catch (error: any) {
    console.error('RevenueCat error:', error);
    Toast.show({
      type: 'error',
      text1: t('common.error'),
      text2: error.message || 'Failed to load pricing',
    });
  } finally {
    setIsLoadingRC(false);
  }
}, [t]);
```

#### Step 9.4: Purchase handlers

```typescript
const handleRevenueCatSubscribe = async (rcPackage: PurchasesPackage) => {
  try {
    setProcessingPriceId(rcPackage.identifier);
    console.log('Purchasing subscription:', rcPackage.identifier);

    const customerInfo = await revenueCatService.purchaseSubscription(rcPackage);
    
    // Refresh profile from Supabase (webhook will update it)
    await refreshProfile?.();
    
    Toast.show({
      type: 'success',
      text1: t('pricing.success'),
      text2: t('pricing.subscription_activated'),
    });
  } catch (error: any) {
    if (!error.userCancelled) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    }
  } finally {
    setProcessingPriceId(null);
  }
};

const handleRevenueCatSearchPack = async (rcPackage: PurchasesPackage) => {
  try {
    setProcessingPriceId(rcPackage.identifier);
    console.log('Purchasing search pack:', rcPackage.identifier);

    await revenueCatService.purchaseSearchPack(rcPackage);
    
    // Refresh profile
    await refreshProfile?.();
    
    Toast.show({
      type: 'success',
      text1: t('pricing.success'),
      text2: t('pricing.credits_added'),
    });
  } catch (error: any) {
    if (!error.userCancelled) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    }
  } finally {
    setProcessingPriceId(null);
  }
};
```

---

### FAZA 10: INITIALIZE IN APP ⏱️ 30 min

#### Step 10.1: Configure în `app/_layout.tsx`

```typescript
import { revenueCatService } from '@/services/revenueCatService';

useEffect(() => {
  const initRevenueCat = async () => {
    try {
      await revenueCatService.configure(user?.id);
      
      // Identify user if logged in
      if (user?.id) {
        await revenueCatService.identifyUser(user.id);
      }
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    }
  };

  initRevenueCat();
}, [user?.id]);
```

---

### FAZA 11: TESTING ⏱️ 2-3 zile

#### Step 11.1: iOS Sandbox Testing

1. **Settings → App Store → Sandbox Account**
2. **Login cu:** test.truxel.ios@gmail.com
3. **Test flows:**
   - ✅ Purchase Standard subscription
   - ✅ Verify webhook updates profiles
   - ✅ Check available_search_credits = 30
   - ✅ Purchase search pack
   - ✅ Verify credits increment
   - ✅ Restore purchases on new device

#### Step 11.2: Android Testing

1. **Internal Testing Track** în Google Play Console
2. **Add license tester:** test.truxel.android@gmail.com
3. **Test same flows** ca iOS

---

## 🚨 PROBLEME POTENȚIALE & SOLUȚII

### 1. **Useri existenți cu Stripe subscriptions**

**SOLUȚIE**: Dual system
- Webhook Stripe continuă să proceseze renewals
- Noi useri folosesc doar RevenueCat
- La expirare Stripe, user-ul poate re-subscribe prin IAP

### 2. **Cross-platform purchases (user cumpără pe iOS, folosește pe Android)**

**SOLUȚIE**: RevenueCat sincronizează automat
- User ID comun (Supabase user_id)
- Entitlements sync între devices
- `restorePurchases()` function

### 3. **Refunds în App Store**

**SOLUȚIE**: RevenueCat webhook `BILLING_ISSUE`
- Webhook setează `subscription_status = 'past_due'`
- Restricționează acces în app
- Notificare user să rezolve billing

---

## 📊 TIMELINE ESTIMAT TOTAL

| Fază | Durată | Status |
|------|--------|--------|
| 0. Clarificări | 30 min | ⏳ |
| 1. Setup App Store | 2-3 ore | ⏳ |
| 2. Setup Google Play | 2-3 ore | ⏳ |
| 3. Setup RevenueCat | 1-2 ore | ⏳ |
| 4. Entitlements/Offerings | 1 oră | ⏳ |
| 5. Install SDK | 30 min | ⏳ |
| 6. Create Service | 2-3 ore | ⏳ |
| 7. Edge Function | 2 ore | ⏳ |
| 8. DB Migrations | 30 min | ⏳ |
| 9. Modify pricing.tsx | 3-4 ore | ⏳ |
| 10. Initialize App | 30 min | ⏳ |
| 11. Testing | 2-3 zile | ⏳ |
| **TOTAL** | **1-2 săptămâni** | |

---

## ✅ NEXT STEPS IMEDIATE

1. **RĂSPUNDE LA CLARIFICĂRI:**
   - Câte search packs? (1 sau 3?)
   - Premium tier (€99.99) - da sau nu?
   - Community limits sunt active?

2. **COMMITEAZĂ PROGRES ACTUAL:**
```bash
git add supabase/config.toml
git commit -m "feat: Add Edge Functions config for public webhooks"
git push
```

3. **CONFIRMĂ START IMPLEMENTARE:**
   - Ai Apple Developer Account active?
   - Ai Google Play Developer Account active?
   - Începem cu FAZA 1?

**SĂ ÎNCEPEM?** 🚀
