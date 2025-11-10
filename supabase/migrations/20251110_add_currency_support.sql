-- ✅ MIGRATION: Add currency support for multi-currency pricing
-- 🎯 PURPOSE: Enable USD (North America) and EUR (Europe) pricing
-- 📅 DATE: November 10, 2025

-- Step 1: Add preferred_currency to profiles
-- Values: 'EUR' (default - Europe) or 'USD' (North America)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_currency TEXT
DEFAULT 'EUR'
CHECK (preferred_currency IN ('EUR', 'USD'));

-- Step 2: Add currency field to subscription_tiers
-- Each tier can have prices in both EUR and USD
ALTER TABLE subscription_tiers
ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10, 2);

-- Step 3: Add currency to additional_search_packs
ALTER TABLE additional_search_packs
ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10, 2);

-- Step 4: Update existing data with approximate USD prices (EUR * 1.10)
-- NOTE: These should be replaced with actual Stripe price IDs for USD
UPDATE subscription_tiers
SET price_usd = ROUND(price * 1.10, 2)
WHERE price_usd IS NULL;

UPDATE additional_search_packs
SET price_usd = ROUND(price * 1.10, 2)
WHERE price_usd IS NULL;

-- Step 5: Add comments
COMMENT ON COLUMN profiles.preferred_currency IS 
'User preferred currency: EUR (Europe) or USD (North America). Auto-detected on signup based on device locale (US/CA/MX = USD, others = EUR). Determines which Stripe price IDs to use for checkout.';

COMMENT ON COLUMN subscription_tiers.price_usd IS 
'Price in US Dollars for North American users. Separate Stripe price ID required.';

COMMENT ON COLUMN additional_search_packs.price_usd IS 
'Price in US Dollars for North American users. Separate Stripe price ID required.';

-- Step 6: Set default currency for existing users (safe default EUR)
UPDATE profiles
SET preferred_currency = 'EUR'
WHERE preferred_currency IS NULL;
