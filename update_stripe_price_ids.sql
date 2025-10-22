-- =============================================================================
-- Update Stripe Price IDs in Database
-- =============================================================================
--
-- INSTRUCTIONS:
-- 1. Replace all 'price_XXXXXXXXXX' placeholders with actual Stripe Price IDs
-- 2. Get Price IDs from: https://dashboard.stripe.com/test/products
-- 3. Run this script in Supabase SQL Editor after creating products in Stripe
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Update Subscription Tiers with Stripe Price IDs
-- -----------------------------------------------------------------------------

-- Standard Tier (€9.99/month)
UPDATE subscription_tiers
SET stripe_price_id = 'price_STANDARD_PRICE_ID_HERE'
WHERE tier_name = 'standard';

-- Pro Tier (€49.99/month)
UPDATE subscription_tiers
SET stripe_price_id = 'price_PRO_PRICE_ID_HERE'
WHERE tier_name = 'pro';

-- Premium Tier (€99.99/month)
UPDATE subscription_tiers
SET stripe_price_id = 'price_PREMIUM_PRICE_ID_HERE'
WHERE tier_name = 'premium';

-- -----------------------------------------------------------------------------
-- STEP 2: Insert or Update Additional Search Packs
-- -----------------------------------------------------------------------------

-- Clear existing packs (optional - comment out if you want to keep existing data)
-- DELETE FROM additional_search_packs;

-- Insert search packs with Stripe Price IDs
INSERT INTO additional_search_packs (pack_name, price, searches_count, stripe_price_id)
VALUES
  ('10 Searches', 4.99, 10, 'price_10_SEARCHES_PRICE_ID_HERE'),
  ('25 Searches', 9.99, 25, 'price_25_SEARCHES_PRICE_ID_HERE'),
  ('50 Searches', 17.99, 50, 'price_50_SEARCHES_PRICE_ID_HERE')
ON CONFLICT (pack_name) DO UPDATE SET
  price = EXCLUDED.price,
  searches_count = EXCLUDED.searches_count,
  stripe_price_id = EXCLUDED.stripe_price_id;

-- -----------------------------------------------------------------------------
-- STEP 3: Verification Queries
-- -----------------------------------------------------------------------------

-- Verify subscription tiers are configured correctly
SELECT
  tier_name,
  price,
  searches_per_month,
  stripe_price_id,
  linkedin_enabled,
  ai_matching_enabled,
  advanced_research_enabled,
  max_results_per_search
FROM subscription_tiers
ORDER BY price;

-- Verify search packs are configured correctly
SELECT
  pack_name,
  price,
  searches_count,
  stripe_price_id,
  created_at
FROM additional_search_packs
ORDER BY price;

-- Check if any products are missing Stripe Price IDs
SELECT 'MISSING PRICE IDs' AS warning, tier_name AS item, 'subscription_tiers' AS table_name
FROM subscription_tiers
WHERE stripe_price_id IS NULL OR stripe_price_id = ''
UNION ALL
SELECT 'MISSING PRICE IDs' AS warning, pack_name AS item, 'additional_search_packs' AS table_name
FROM additional_search_packs
WHERE stripe_price_id IS NULL OR stripe_price_id = '';

-- =============================================================================
-- EXAMPLE with real Price IDs (for reference):
-- =============================================================================
--
-- UPDATE subscription_tiers
-- SET stripe_price_id = 'price_1QJxK8L9q7b3c4d5e6f7g8h9'
-- WHERE tier_name = 'standard';
--
-- =============================================================================
