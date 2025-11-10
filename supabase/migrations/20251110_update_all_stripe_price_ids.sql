-- ✅ UPDATE ALL STRIPE PRICE IDS (EUR + USD)
-- 🎯 PURPOSE: Multi-currency support for North America (USD) and Europe (EUR)
-- 📅 DATE: November 10, 2025

-- ========================================
-- STEP 1: Add stripe_price_id_usd columns
-- ========================================

-- Add USD price column to subscription_tiers
ALTER TABLE subscription_tiers
ADD COLUMN IF NOT EXISTS stripe_price_id_usd TEXT;

-- Add USD price column to additional_search_packs  
ALTER TABLE additional_search_packs
ADD COLUMN IF NOT EXISTS stripe_price_id_usd TEXT;

-- ========================================
-- STEP 2: Update Standard Tier
-- ========================================
UPDATE subscription_tiers
SET 
  stripe_price_id = 'price_1SL14lPd7H7rZiTmkgHF1iCZ',      -- EUR: €29.99/month
  stripe_price_id_usd = 'price_1SRq8vPd7H7rZiTmqkNNJIlZ', -- USD: $29.99/month
  price = 29.99,
  price_usd = 29.99
WHERE tier_name = 'standard';

-- ========================================
-- STEP 3: Update Pro Tier
-- ========================================
UPDATE subscription_tiers
SET 
  stripe_price_id = 'price_1SL14rPd7H7rZiTmKnpBjJaS',      -- EUR: €49.99/month
  stripe_price_id_usd = 'price_1SRq8MPd7H7rZiTmtx8muOmd', -- USD: $49.99/month ✅
  price = 49.99,
  price_usd = 49.99
WHERE tier_name = 'pro';

-- ========================================
-- STEP 4: Insert/Update Fleet Manager Tier
-- ========================================
INSERT INTO subscription_tiers (
  tier_name,
  price,
  price_usd,
  searches_per_month,
  description,
  stripe_price_id,
  stripe_price_id_usd
)
VALUES (
  'fleet_manager',
  29.99,  -- EUR
  29.99,  -- USD
  10,     -- Fewer searches (freight forwarders need less search, more posting)
  'Freight Forwarder Plan with enhanced community load posting: 30 posts/day, 1000/month',
  'price_1SRpzzPd7H7rZiTmOQrenjIN',  -- EUR: €29.99/month
  'price_1SRq6ePd7H7rZiTmAywE2Chw'   -- USD: $29.99/month
)
ON CONFLICT (tier_name) 
DO UPDATE SET
  stripe_price_id = EXCLUDED.stripe_price_id,
  stripe_price_id_usd = EXCLUDED.stripe_price_id_usd,
  price = EXCLUDED.price,
  price_usd = EXCLUDED.price_usd,
  searches_per_month = EXCLUDED.searches_per_month,
  description = EXCLUDED.description;

-- ========================================
-- STEP 5: Add Fleet Manager to subscription_limits
-- ========================================
INSERT INTO subscription_limits (
  tier_name,
  posts_per_day,
  posts_per_month,
  can_view_contacts,
  max_saved_posts
)
VALUES (
  'fleet_manager',
  30,    -- High daily limit for load offers
  1000,  -- Very high monthly limit
  true,  -- Can view contact info
  100    -- Can save posts
)
ON CONFLICT (tier_name)
DO NOTHING;

-- ========================================
-- STEP 6: Update 25 Searches Pack
-- ========================================
UPDATE additional_search_packs
SET 
  stripe_price_id = 'price_1SL14yPd7H7rZiTmGgsbAgq8',      -- EUR: €24.99
  stripe_price_id_usd = 'price_1SRq7WPd7H7rZiTme1YFLtQL', -- USD: $24.99
  price = 24.99,
  price_usd = 24.99
WHERE searches = 25;

-- ========================================
-- STEP 7: Verify all updates
-- ========================================
SELECT 
  tier_name,
  price AS price_eur,
  price_usd,
  searches_per_month,
  stripe_price_id AS price_id_eur,
  stripe_price_id_usd AS price_id_usd,
  CASE 
    WHEN stripe_price_id IS NOT NULL AND stripe_price_id_usd IS NOT NULL THEN '✅ Complete'
    WHEN stripe_price_id IS NOT NULL AND stripe_price_id_usd IS NULL THEN '⚠️ Missing USD'
    ELSE '❌ Missing EUR'
  END AS status
FROM subscription_tiers
ORDER BY price;

-- Expected output:
-- | tier_name      | price_eur | price_usd | searches | price_id_eur            | price_id_usd            | status         |
-- |----------------|-----------|-----------|----------|-------------------------|-------------------------|----------------|
-- | trial          | 0.00      | NULL      | 5        | NULL                    | NULL                    | N/A            |
-- | standard       | 29.99     | 29.99     | 30       | price_1SL14lPd...       | price_1SRq8vPd...       | ✅ Complete    |
-- | fleet_manager  | 29.99     | 29.99     | 10       | price_1SRpzzPd...       | price_1SRq6ePd...       | ✅ Complete    |
-- | pro            | 49.99     | 49.99     | 50       | price_1SL14rPd...       | NULL                    | ⚠️ Missing USD |

SELECT 
  searches,
  price AS price_eur,
  price_usd,
  stripe_price_id AS price_id_eur,
  stripe_price_id_usd AS price_id_usd,
  CASE 
    WHEN stripe_price_id IS NOT NULL AND stripe_price_id_usd IS NOT NULL THEN '✅ Complete'
    ELSE '⚠️ Incomplete'
  END AS status
FROM additional_search_packs
ORDER BY searches;

-- Expected output:
-- | searches | price_eur | price_usd | price_id_eur       | price_id_usd       | status      |
-- |----------|-----------|-----------|--------------------|--------------------|-------------|
-- | 25       | 24.99     | 24.99     | price_1SL14yPd...  | price_1SRq7WPd...  | ✅ Complete |

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON COLUMN subscription_tiers.stripe_price_id_usd IS 
'Stripe Price ID for USD (North America: US, CA, MX). Used when user preferred_currency = USD.';

COMMENT ON COLUMN additional_search_packs.stripe_price_id_usd IS 
'Stripe Price ID for USD (North America). Used when user preferred_currency = USD.';
