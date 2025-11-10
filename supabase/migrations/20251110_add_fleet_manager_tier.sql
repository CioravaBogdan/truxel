-- ✅ ADD FLEET MANAGER TIER TO SUPABASE
-- 🎯 PURPOSE: New tier for freight forwarding companies
-- 📅 DATE: November 10, 2025
-- ⚠️ NOTE: Waiting for Stripe recurring price ID from manual creation

-- Step 1: Verify current tiers
SELECT tier_name, price, searches_per_month, stripe_price_id
FROM subscription_tiers
ORDER BY price;

-- Expected output:
-- trial     | 0.00  | 5  | NULL
-- standard  | 29.99 | 30 | price_1SL14lPd7H7rZiTmkgHF1iCZ
-- pro       | 49.99 | 50 | price_1SL14rPd7H7rZiTmKnpBjJaS

-- Step 2: Insert Fleet Manager tier
-- ⚠️ REPLACE 'price_XXXXXX_EUR' and 'price_XXXXXX_USD' with actual Stripe price IDs
-- after manual creation in Stripe Dashboard
INSERT INTO subscription_tiers (
  tier_name,
  price,              -- EUR price
  price_usd,          -- USD price
  searches_per_month,
  description,
  stripe_price_id,    -- EUR Stripe price ID (TO BE REPLACED)
  stripe_price_id_usd -- USD Stripe price ID (optional - create later)
)
VALUES (
  'fleet_manager',
  29.99,              -- Same as Standard but different features
  29.99,              -- USD price (1:1 for simplicity, adjust if needed)
  10,                 -- Fewer searches than Standard (freight forwarders need less)
  'Freight Forwarder Plan with enhanced community load posting: 30 posts/day, 1000/month',
  'price_XXXXXX_EUR', -- ⚠️ REPLACE after manual Stripe Dashboard creation
  NULL                -- USD price ID - create later if needed
);

-- Step 3: Verify insertion
SELECT tier_name, price, price_usd, searches_per_month, stripe_price_id
FROM subscription_tiers
ORDER BY price;

-- Expected output:
-- trial         | 0.00  | NULL  | 5  | NULL
-- standard      | 29.99 | 32.99 | 30 | price_1SL14lPd7H7rZiTmkgHF1iCZ
-- fleet_manager | 29.99 | 29.99 | 10 | price_XXXXXX_EUR
-- pro           | 49.99 | 54.99 | 50 | price_1SL14rPd7H7rZiTmKnpBjJaS

-- Step 4: Update subscription_limits for Fleet Manager community features
-- (Uses same pattern as existing tiers)
INSERT INTO subscription_limits (
  tier_name,
  posts_per_day,
  posts_per_month,
  can_view_contacts,
  max_saved_posts
)
VALUES (
  'fleet_manager',
  30,                -- High daily limit for load offers
  1000,              -- Very high monthly limit
  true,              -- Can view contact info
  100                -- Can save posts
);

-- Step 5: Verify subscription_limits
SELECT tier_name, posts_per_day, posts_per_month, can_view_contacts
FROM subscription_limits
ORDER BY posts_per_month DESC;

-- Expected output:
-- fleet_manager | 30  | 1000 | true
-- pro           | 10  | 100  | true
-- standard      | 5   | 30   | true
-- trial         | 0   | 0    | false (read-only)

-- 📝 NOTES:
-- 1. Fleet Manager is same price as Standard (€29.99) but targets different audience
-- 2. Standard = Drivers (need MORE searches, LESS posting)
-- 3. Fleet Manager = Freight Forwarders (need LESS searches, MORE posting)
-- 4. Stripe product already created: prod_TOdGKK8sjlXpvB
-- 5. Price ID pending manual creation in Stripe Dashboard (recurring monthly)

-- 🚀 NEXT STEPS:
-- 1. User creates recurring price in Stripe Dashboard for prod_TOdGKK8sjlXpvB
-- 2. Replace 'price_XXXXXX_EUR' with actual EUR price ID
-- 3. Optionally create USD price ID and update stripe_price_id_usd
-- 4. Test subscription flow in app
