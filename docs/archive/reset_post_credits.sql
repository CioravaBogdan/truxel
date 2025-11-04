-- ============================================
-- MANUAL POST CREDITS MANAGEMENT
-- User: b2e97bd7-4734-4462-ad6e-03f88a0f6c74
-- ============================================

-- ============================================
-- STEP 1: VERIFICĂ STATUS ACTUAL
-- ============================================

-- Verifică tier-ul user-ului
SELECT 
  user_id,
  full_name,
  company_name,
  subscription_tier,
  subscription_status,
  created_at
FROM profiles 
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- Verifică usage actual
SELECT 
  user_id,
  posts_this_month,
  posts_today,
  last_post_at,
  month_reset_at,
  day_reset_at
FROM user_post_usage 
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- Verifică limite pentru tier-ul actual
SELECT 
  p.subscription_tier,
  sl.posts_per_month,
  sl.posts_per_day,
  sl.concurrent_active_posts,
  sl.post_duration_hours
FROM profiles p
LEFT JOIN subscription_limits sl ON p.subscription_tier = sl.tier
WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- Verifică postări active
SELECT COUNT(*) as active_posts_count
FROM community_posts 
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74' 
  AND status = 'active' 
  AND expires_at > now();

-- ============================================
-- STEP 2: OVERVIEW COMPLET (All-in-One Query)
-- ============================================

SELECT 
  p.user_id,
  p.full_name,
  p.company_name,
  p.subscription_tier,
  
  -- Limite per tier
  sl.posts_per_month AS "Max Posts/Month",
  sl.posts_per_day AS "Max Posts/Day",
  sl.concurrent_active_posts AS "Max Active Posts",
  
  -- Usage actual
  COALESCE(upu.posts_this_month, 0) AS "Used This Month",
  COALESCE(upu.posts_today, 0) AS "Used Today",
  
  -- Credite rămase
  (sl.posts_per_month - COALESCE(upu.posts_this_month, 0)) AS "Remaining Month",
  (sl.posts_per_day - COALESCE(upu.posts_today, 0)) AS "Remaining Today",
  
  -- Active posts count
  (SELECT COUNT(*) FROM community_posts cp 
   WHERE cp.user_id = p.user_id 
     AND cp.status = 'active' 
     AND cp.expires_at > now()
  ) AS "Active Posts",
  
  -- Status
  CASE 
    WHEN COALESCE(upu.posts_today, 0) >= sl.posts_per_day THEN '🔴 Daily Limit Reached'
    WHEN COALESCE(upu.posts_this_month, 0) >= sl.posts_per_month THEN '🟡 Monthly Limit Reached'
    ELSE '🟢 Can Post'
  END AS "Status"
  
FROM profiles p
LEFT JOIN user_post_usage upu ON p.user_id = upu.user_id
LEFT JOIN subscription_limits sl ON p.subscription_tier = sl.tier
WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- ============================================
-- STEP 3: SOLUTION OPTIONS
-- ============================================

-- -----------------------------------------
-- OPTION A: RESET COMPLET (Recommended)
-- -----------------------------------------
-- Șterge toate contoarele - user primește credite complete

UPDATE user_post_usage 
SET 
  posts_this_month = 0,
  posts_today = 0,
  last_post_at = NULL,
  month_reset_at = date_trunc('month', now()),
  day_reset_at = date_trunc('day', now()),
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- Verifică rezultatul
SELECT 
  posts_this_month,
  posts_today,
  (SELECT posts_per_month FROM subscription_limits sl 
   JOIN profiles p ON p.subscription_tier = sl.tier 
   WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74') AS "Available Monthly",
  (SELECT posts_per_day FROM subscription_limits sl 
   JOIN profiles p ON p.subscription_tier = sl.tier 
   WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74') AS "Available Daily"
FROM user_post_usage 
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';


-- -----------------------------------------
-- OPTION B: SCADE CONTOARE (Precise Control)
-- -----------------------------------------
-- Scade numărul de postări folosite pentru a da credite specifice

-- Exemplu: +3 postări
UPDATE user_post_usage 
SET 
  posts_this_month = GREATEST(posts_this_month - 3, 0),
  posts_today = GREATEST(posts_today - 3, 0),
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- Exemplu: +10 postări
UPDATE user_post_usage 
SET 
  posts_this_month = GREATEST(posts_this_month - 10, 0),
  posts_today = GREATEST(posts_today - 10, 0),
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';


-- -----------------------------------------
-- OPTION C: UPGRADE TIER (Long-term)
-- -----------------------------------------
-- Upgrade la tier superior pentru limite permanente mai mari

-- Upgrade la PRO (100/month, 15/day)
UPDATE profiles 
SET 
  subscription_tier = 'pro',
  subscription_status = 'active',
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- SAU Upgrade la PREMIUM (unlimited - 999/month, 30/day)
UPDATE profiles 
SET 
  subscription_tier = 'premium',
  subscription_status = 'active',
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';


-- ============================================
-- STEP 4: VERIFICARE FINALĂ
-- ============================================

-- Verifică că totul este OK după update
SELECT 
  'User Info' AS section,
  p.full_name,
  p.subscription_tier,
  p.subscription_status
FROM profiles p
WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74'

UNION ALL

SELECT 
  'Current Usage' AS section,
  CONCAT('Month: ', COALESCE(upu.posts_this_month, 0)::text),
  CONCAT('Today: ', COALESCE(upu.posts_today, 0)::text),
  CONCAT('Last Post: ', COALESCE(upu.last_post_at::text, 'Never'))
FROM user_post_usage upu
WHERE upu.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74'

UNION ALL

SELECT 
  'Tier Limits' AS section,
  CONCAT('Max Month: ', sl.posts_per_month),
  CONCAT('Max Day: ', sl.posts_per_day),
  CONCAT('Max Active: ', sl.concurrent_active_posts)
FROM profiles p
LEFT JOIN subscription_limits sl ON p.subscription_tier = sl.tier
WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74'

UNION ALL

SELECT 
  'Available Credits' AS section,
  CONCAT('Monthly: ', (sl.posts_per_month - COALESCE(upu.posts_this_month, 0))),
  CONCAT('Daily: ', (sl.posts_per_day - COALESCE(upu.posts_today, 0))),
  CASE 
    WHEN COALESCE(upu.posts_today, 0) < sl.posts_per_day 
      AND COALESCE(upu.posts_this_month, 0) < sl.posts_per_month 
    THEN '✅ CAN POST'
    ELSE '❌ LIMIT REACHED'
  END
FROM profiles p
LEFT JOIN user_post_usage upu ON p.user_id = upu.user_id
LEFT JOIN subscription_limits sl ON p.subscription_tier = sl.tier
WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';


-- ============================================
-- STEP 5: TEST POST ABILITY (RPC)
-- ============================================

-- Apelează RPC-ul pentru a verifica dacă user-ul poate posta
SELECT can_user_post('b2e97bd7-4734-4462-ad6e-03f88a0f6c74');

-- Expected output (după reset):
-- {
--   "can_post": true,
--   "posts_remaining_month": 30,
--   "posts_remaining_today": 5,
--   "active_posts": 2,
--   "tier": "standard"
-- }


-- ============================================
-- QUICK REFERENCE - Tier Limits
-- ============================================

SELECT tier, posts_per_month, posts_per_day, concurrent_active_posts
FROM subscription_limits
ORDER BY posts_per_month;

-- Expected output:
-- trial    | 10  | 2  | 1
-- standard | 30  | 5  | 3
-- pro      | 100 | 15 | 10
-- premium  | 999 | 30 | 30
