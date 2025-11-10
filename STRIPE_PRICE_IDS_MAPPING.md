# 🎯 STRIPE PRICE IDS - COMPLETE MAPPING

**Date:** November 10, 2025  
**Status:** ALL PRICES CREATED ✅  
**Currencies:** EUR (Europe) + USD (North America)

---

## 📊 SUBSCRIPTION TIERS (Recurring Monthly)

### 1. Standard Tier
| Currency | Price | Stripe Price ID | Active Subs | Status |
|----------|-------|-----------------|-------------|--------|
| **EUR** | €29.99/month | `price_1SL14lPd7H7rZiTmkgHF1iCZ` | 2 | ✅ Active |
| **USD** | $29.99/month | `price_1SRq8vPd7H7rZiTmqkNNJIlZ` | 0 | ✅ Active |

**Features:**
- 30 searches/month
- Driver community posts: 5/day, 30/month
- Basic features

---

### 2. Pro Tier
| Currency | Price | Stripe Price ID | Active Subs | Status |
|----------|-------|-----------------|-------------|--------|
| **EUR** | €49.99/month | `price_1SL14rPd7H7rZiTmKnpBjJaS` | 0 | ✅ Active |
| **USD** | $49.99/month | `price_1SRq8MPd7H7rZiTmtx8muOmd` | 0 | ✅ Active |

**Features:**
- 50 searches/month
- Driver community posts: 10/day, 100/month
- LinkedIn + AI matching
- **Export Leads feature**

---

### 3. Fleet Manager 🆕
| Currency | Price | Stripe Price ID | Active Subs | Status |
|----------|-------|-----------------|-------------|--------|
| **EUR** | €29.99/month | `price_1SRpzzPd7H7rZiTmOQrenjIN` | 0 | ✅ Active |
| **USD** | $29.99/month | `price_1SRq6ePd7H7rZiTmAywE2Chw` | 0 | ✅ Active |

**Features:**
- 10 searches/month (less than Standard - freight forwarders need less search)
- Load community posts: 30/day, 1000/month (MUCH MORE posting)
- Community contact access
- Target: Freight forwarding companies

---

## 🔍 SEARCH PACKS (One-time Purchase)

### 25 Searches Pack
| Currency | Price | Stripe Price ID | Status |
|----------|-------|-----------------|--------|
| **EUR** | €24.99 | `price_1SL14yPd7H7rZiTmGgsbAgq8` | ✅ Active |
| **USD** | $24.99 | `price_1SRq7WPd7H7rZiTme1YFLtQL` | ✅ Active |

**Restriction:** Available ONLY to active subscribers

---

## 📝 EXTRA PRICE IDs FROM YOUR LIST

**⚠️ VERIFICĂ ACEST PRICE ID:**
```
price_1SRq7PPd7H7rZiTm????  // Pro Tier USD - ID incomplet în lista ta
```

Dacă ai creat Pro Tier USD cu un alt ID, trimite-mi ID-ul complet!

---

## 🗄️ DATABASE UPDATE QUERIES

### Update subscription_tiers cu toate Price IDs:

```sql
-- Standard Tier
UPDATE subscription_tiers
SET 
  stripe_price_id = 'price_1SL14lPd7H7rZiTmkgHF1iCZ',  -- EUR
  stripe_price_id_usd = 'price_1SRq8vPd7H7rZiTmqkNNJIlZ',  -- USD
  price = 29.99,
  price_usd = 29.99
WHERE tier_name = 'standard';

-- Pro Tier
UPDATE subscription_tiers
SET 
  stripe_price_id = 'price_1SL14rPd7H7rZiTmKnpBjJaS',  -- EUR
  stripe_price_id_usd = 'price_1SRq7PPd7H7rZiTmXXXXXXXX',  -- USD (⚠️ VERIFICĂ!)
  price = 49.99,
  price_usd = 49.99
WHERE tier_name = 'pro';

-- Fleet Manager (FIRST INSERT, then update if exists)
INSERT INTO subscription_tiers (
  tier_name, price, price_usd, searches_per_month, description,
  stripe_price_id, stripe_price_id_usd
)
VALUES (
  'fleet_manager',
  29.99,  -- EUR
  29.99,  -- USD
  10,
  'Freight Forwarder Plan with enhanced community load posting: 30 posts/day, 1000/month',
  'price_1SRpzzPd7H7rZiTmOQrenjIN',  -- EUR
  'price_1SRq6ePd7H7rZiTmAywE2Chw'   -- USD
)
ON CONFLICT (tier_name) 
DO UPDATE SET
  stripe_price_id = EXCLUDED.stripe_price_id,
  stripe_price_id_usd = EXCLUDED.stripe_price_id_usd,
  price = EXCLUDED.price,
  price_usd = EXCLUDED.price_usd;
```

### Update additional_search_packs:

```sql
UPDATE additional_search_packs
SET 
  stripe_price_id = 'price_1SL14yPd7H7rZiTmGgsbAgq8',  -- EUR
  stripe_price_id_usd = 'price_1SRq7WPd7H7rZiTme1YFLtQL',  -- USD
  price = 24.99,
  price_usd = 24.99
WHERE searches = 25;
```

---

## 🎯 CURRENCY DETECTION LOGIC (Already Implemented)

**File:** `utils/currency.ts`

```typescript
export function autoDetectCurrency(locale?: string): CurrencyCode {
  if (!locale) return 'EUR';
  
  const usdCountries = ['US', 'CA', 'MX']; // North America
  const countryCode = locale.split('-')[1]?.toUpperCase();
  
  return (countryCode && usdCountries.includes(countryCode)) ? 'USD' : 'EUR';
}
```

**Signup Flow:** `authService.ts` already auto-detects and saves to `profiles.preferred_currency`

---

## ✅ NEXT STEPS

1. **Verifică Pro Tier USD Price ID** - Complet ID-ul dacă lipsește
2. **Rulează database updates** - Queries de mai sus
3. **RevenueCat Offerings** - Creează offerings cu prices EUR/USD
4. **iOS/Android Setup** - Products cu ambele currencies

**SAU îmi dai verde și continui eu cu implementarea?** 🚀
