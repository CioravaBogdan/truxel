-- =============================================================================
-- Database Setup Verification Script
-- =============================================================================
--
-- Run this script in Supabase SQL Editor to verify your database is properly
-- configured for Stripe integration.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Check if all required tables exist
-- -----------------------------------------------------------------------------
SELECT
  'Tables Exist' AS check_type,
  table_name,
  CASE WHEN table_name IN (
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status
FROM (
  VALUES
    ('profiles'),
    ('subscription_tiers'),
    ('additional_search_packs'),
    ('transactions'),
    ('user_search_credits'),
    ('stripe_webhook_events'),
    ('leads'),
    ('searches')
) AS required_tables(table_name);

-- -----------------------------------------------------------------------------
-- 2. Check if Row Level Security is enabled
-- -----------------------------------------------------------------------------
SELECT
  'RLS Enabled' AS check_type,
  tablename AS table_name,
  CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '✗ DISABLED' END AS status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'subscription_tiers',
  'additional_search_packs',
  'transactions',
  'user_search_credits',
  'stripe_webhook_events',
  'leads',
  'searches'
)
ORDER BY tablename;

-- -----------------------------------------------------------------------------
-- 3. Check subscription tiers configuration
-- -----------------------------------------------------------------------------
SELECT
  'Subscription Tiers' AS check_type,
  tier_name,
  price,
  searches_per_month,
  CASE
    WHEN stripe_price_id IS NOT NULL AND stripe_price_id != '' THEN '✓ Configured'
    WHEN tier_name = 'trial' THEN '○ Not needed'
    ELSE '✗ Missing Stripe Price ID'
  END AS stripe_status,
  linkedin_enabled,
  ai_matching_enabled,
  advanced_research_enabled,
  max_results_per_search
FROM subscription_tiers
ORDER BY price;

-- -----------------------------------------------------------------------------
-- 4. Check additional search packs configuration
-- -----------------------------------------------------------------------------
SELECT
  'Search Packs' AS check_type,
  pack_name,
  price,
  searches_count,
  CASE
    WHEN stripe_price_id IS NOT NULL AND stripe_price_id != '' THEN '✓ Configured'
    ELSE '✗ Missing Stripe Price ID'
  END AS stripe_status
FROM additional_search_packs
ORDER BY price;

-- -----------------------------------------------------------------------------
-- 5. Check if required database functions exist
-- -----------------------------------------------------------------------------
SELECT
  'Database Functions' AS check_type,
  routine_name AS function_name,
  '✓ EXISTS' AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_total_search_credits',
  'consume_search_credit',
  'update_updated_at_column'
)
ORDER BY routine_name;

-- -----------------------------------------------------------------------------
-- 6. Check profiles table has required columns
-- -----------------------------------------------------------------------------
SELECT
  'Profile Columns' AS check_type,
  column_name,
  data_type,
  CASE WHEN is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END AS nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN (
  'stripe_customer_id',
  'stripe_subscription_id',
  'stripe_subscription_status',
  'stripe_current_period_end',
  'subscription_tier',
  'subscription_status',
  'trial_searches_used',
  'monthly_searches_used',
  'available_search_credits'
)
ORDER BY column_name;

-- -----------------------------------------------------------------------------
-- 7. Check indexes for performance
-- -----------------------------------------------------------------------------
SELECT
  'Indexes' AS check_type,
  indexname AS index_name,
  tablename AS table_name,
  '✓ EXISTS' AS status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND tablename IN (
  'profiles',
  'subscription_tiers',
  'user_search_credits',
  'stripe_webhook_events',
  'leads'
)
ORDER BY tablename, indexname;

-- -----------------------------------------------------------------------------
-- 8. Check RLS policies exist
-- -----------------------------------------------------------------------------
SELECT
  'RLS Policies' AS check_type,
  tablename AS table_name,
  policyname AS policy_name,
  cmd AS command,
  '✓ EXISTS' AS status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'subscription_tiers',
  'additional_search_packs',
  'transactions',
  'user_search_credits',
  'stripe_webhook_events',
  'leads',
  'searches'
)
ORDER BY tablename, policyname;

-- -----------------------------------------------------------------------------
-- 9. Test database functions (requires a test user)
-- -----------------------------------------------------------------------------
-- Uncomment and replace USER_ID with a real user ID to test:
--
-- SELECT * FROM get_total_search_credits('YOUR_USER_ID_HERE');
--

-- -----------------------------------------------------------------------------
-- 10. Summary of configuration status
-- -----------------------------------------------------------------------------
SELECT
  'Configuration Summary' AS section,
  COUNT(*) FILTER (WHERE stripe_price_id IS NOT NULL AND stripe_price_id != '') AS configured_tiers,
  COUNT(*) FILTER (WHERE (stripe_price_id IS NULL OR stripe_price_id = '') AND tier_name != 'trial') AS missing_tier_configs,
  (SELECT COUNT(*) FROM additional_search_packs WHERE stripe_price_id IS NOT NULL AND stripe_price_id != '') AS configured_packs,
  (SELECT COUNT(*) FROM additional_search_packs WHERE stripe_price_id IS NULL OR stripe_price_id = '') AS missing_pack_configs
FROM subscription_tiers;

-- -----------------------------------------------------------------------------
-- INTERPRETATION OF RESULTS:
-- -----------------------------------------------------------------------------
--
-- ✓ (checkmark) = Configured correctly
-- ✗ (X mark)    = Missing or not configured
-- ○ (circle)    = Not needed (e.g., trial tier doesn't need Stripe Price ID)
--
-- ACTIONS NEEDED:
-- 1. If any table shows '✗ MISSING', run the migration script
-- 2. If RLS shows '✗ DISABLED', enable it for security
-- 3. If Stripe Price IDs show '✗ Missing', update using update_stripe_price_ids.sql
-- 4. If functions are missing, check migration was fully applied
--
-- =============================================================================
