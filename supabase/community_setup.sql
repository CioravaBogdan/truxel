-- 🚛 TRUXEL COMMUNITY FEATURE - SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- Version: 2.1.0

-- ============================================
-- PART 1: EXTENSIONS & TYPES
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing types if they exist (for re-running)
DROP TYPE IF EXISTS post_type CASCADE;
DROP TYPE IF EXISTS post_status CASCADE;

-- Create ENUMs
CREATE TYPE post_type AS ENUM (
  'DRIVER_AVAILABLE',
  'LOAD_AVAILABLE'
);

CREATE TYPE post_status AS ENUM (
  'active',
  'expired',
  'cancelled'
);

-- ============================================
-- PART 2: CITIES TABLE (for free search)
-- ============================================

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  ascii_name text NOT NULL,
  country_code text NOT NULL,
  country_name text NOT NULL,
  lat decimal(9,6) NOT NULL,
  lng decimal(9,6) NOT NULL,
  population integer DEFAULT 0,
  importance float DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS cities_name_trgm ON cities USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cities_ascii_trgm ON cities USING GIN (ascii_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cities_country ON cities(country_code);
CREATE INDEX IF NOT EXISTS cities_importance ON cities(importance DESC);

-- ============================================
-- PART 3: SUBSCRIPTION LIMITS
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_limits (
  tier text PRIMARY KEY,
  posts_per_month integer NOT NULL,
  posts_per_day integer NOT NULL,
  concurrent_active_posts integer NOT NULL,
  post_duration_hours integer NOT NULL,
  features jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert/update subscription tiers
INSERT INTO subscription_limits (tier, posts_per_month, posts_per_day, concurrent_active_posts, post_duration_hours, features) VALUES
  ('trial', 5, 2, 1, 24, '{"contact_visible": false}'),
  ('standard', 30, 5, 3, 24, '{"contact_visible": true}'),
  ('pro', 100, 10, 5, 24, '{"contact_visible": true, "priority_display": true}'),
  ('premium', 500, 10, 10, 48, '{"contact_visible": true, "priority_display": true, "analytics": true}')
ON CONFLICT (tier) DO UPDATE SET
  posts_per_month = EXCLUDED.posts_per_month,
  posts_per_day = EXCLUDED.posts_per_day,
  concurrent_active_posts = EXCLUDED.concurrent_active_posts,
  post_duration_hours = EXCLUDED.post_duration_hours,
  features = EXCLUDED.features,
  updated_at = now();

-- ============================================
-- PART 4: MAIN COMMUNITY POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_type post_type NOT NULL,
  status post_status DEFAULT 'active',

  -- Location
  origin_lat decimal(9,6) NOT NULL,
  origin_lng decimal(9,6) NOT NULL,
  origin_city text NOT NULL,
  origin_country text NOT NULL DEFAULT 'RO',

  dest_city text,
  dest_country text,
  dest_lat decimal(9,6),
  dest_lng decimal(9,6),

  -- Content
  template_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',

  -- Contact
  contact_phone text,
  contact_whatsapp boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),

  -- Stats
  view_count integer DEFAULT 0,
  contact_count integer DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_active ON community_posts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_posts_expires ON community_posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_origin_city ON community_posts(origin_city);
CREATE INDEX IF NOT EXISTS idx_posts_metadata ON community_posts USING GIN(metadata);

-- ============================================
-- PART 5: USER POST USAGE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS user_post_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  posts_this_month integer DEFAULT 0,
  posts_today integer DEFAULT 0,
  last_post_at timestamptz,
  month_reset_at timestamptz DEFAULT date_trunc('month', now()),
  day_reset_at timestamptz DEFAULT date_trunc('day', now()),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PART 6: INTERACTIONS & NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS community_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'interested', 'contacted', 'saved')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_interactions_post ON community_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON community_interactions(user_id);

CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user ON notification_log(user_id, sent_at DESC);

-- ============================================
-- PART 7: PROFILE UPDATES
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS community_notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_radius_km integer DEFAULT 25,
ADD COLUMN IF NOT EXISTS last_known_lat decimal(9,6),
ADD COLUMN IF NOT EXISTS last_known_lng decimal(9,6);

-- Add source tracking to leads
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'search',
ADD COLUMN IF NOT EXISTS source_id uuid;

-- ============================================
-- PART 8: FUNCTIONS
-- ============================================

-- Function to check if user can post
CREATE OR REPLACE FUNCTION can_user_post(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_limits record;
  v_usage record;
  v_active_posts integer;
  v_subscription_tier text;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM profiles WHERE user_id = p_user_id;

  IF v_subscription_tier IS NULL THEN
    v_subscription_tier := 'trial';
  END IF;

  -- Get limits
  SELECT * INTO v_limits FROM subscription_limits WHERE tier = v_subscription_tier;

  -- Get or create usage
  INSERT INTO user_post_usage (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
  RETURNING * INTO v_usage;

  -- Reset counters if needed
  IF v_usage.month_reset_at < date_trunc('month', now()) THEN
    UPDATE user_post_usage SET posts_this_month = 0, month_reset_at = date_trunc('month', now())
    WHERE user_id = p_user_id RETURNING * INTO v_usage;
  END IF;

  IF v_usage.day_reset_at < date_trunc('day', now()) THEN
    UPDATE user_post_usage SET posts_today = 0, day_reset_at = date_trunc('day', now())
    WHERE user_id = p_user_id RETURNING * INTO v_usage;
  END IF;

  -- Count active posts
  SELECT COUNT(*) INTO v_active_posts FROM community_posts
  WHERE user_id = p_user_id AND status = 'active' AND expires_at > now();

  -- Check hard cap
  IF v_usage.posts_today >= 10 THEN
    RETURN jsonb_build_object('can_post', false, 'reason', 'Hard limit: 10 posts/day');
  END IF;

  RETURN jsonb_build_object(
    'can_post', (v_usage.posts_this_month < v_limits.posts_per_month AND
                 v_usage.posts_today < v_limits.posts_per_day AND
                 v_active_posts < v_limits.concurrent_active_posts),
    'posts_remaining_month', v_limits.posts_per_month - v_usage.posts_this_month,
    'posts_remaining_today', LEAST(v_limits.posts_per_day - v_usage.posts_today, 10 - v_usage.posts_today),
    'active_posts', v_active_posts,
    'tier', v_subscription_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment usage function
CREATE OR REPLACE FUNCTION increment_post_usage(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_post_usage SET
    posts_this_month = posts_this_month + 1,
    posts_today = posts_today + 1,
    last_post_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment helper for community post stats
CREATE OR REPLACE FUNCTION increment(table_name text, column_name text, row_id uuid)
RETURNS void AS $$
DECLARE
  allowed_table CONSTANT text := 'community_posts';
BEGIN
  IF table_name <> allowed_table THEN
    RAISE EXCEPTION 'increment: table % is not allowed', table_name;
  END IF;

  IF column_name NOT IN ('view_count', 'contact_count') THEN
    RAISE EXCEPTION 'increment: column % is not allowed', column_name;
  END IF;

  EXECUTE format(
    'UPDATE %I SET %I = %I + 1, updated_at = now() WHERE id = $1',
    table_name,
    column_name,
    column_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record interaction helper to avoid RLS issues on direct inserts
CREATE OR REPLACE FUNCTION record_community_interaction(
  p_user_id uuid,
  p_post_id uuid,
  p_interaction_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted boolean := false;
BEGIN
  IF p_user_id IS NULL OR p_post_id IS NULL OR p_interaction_type IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters for community interaction';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized to record interaction for another user';
  END IF;

  WITH upsert AS (
    INSERT INTO community_interactions AS ci (post_id, user_id, interaction_type, metadata)
    VALUES (p_post_id, p_user_id, p_interaction_type, COALESCE(p_metadata, '{}'::jsonb))
    ON CONFLICT (post_id, user_id, interaction_type) DO UPDATE
      SET metadata = CASE
        WHEN EXCLUDED.metadata IS NULL OR EXCLUDED.metadata = '{}'::jsonb THEN ci.metadata
        ELSE COALESCE(ci.metadata, '{}'::jsonb) || EXCLUDED.metadata
      END,
      created_at = ci.created_at
    RETURNING (xmax = 0) AS inserted
  )
  SELECT inserted INTO v_inserted FROM upsert;

  IF v_inserted IS NULL THEN
    v_inserted := false;
  END IF;

  IF v_inserted AND p_interaction_type = 'contacted' THEN
    UPDATE community_posts
    SET contact_count = COALESCE(contact_count, 0) + 1
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object('inserted', v_inserted);
END;
$$;

-- Check duplicate (anti-spam) - Updated to check post_type as well
CREATE OR REPLACE FUNCTION check_duplicate_post(
  p_user_id uuid, 
  p_origin_city text,
  p_post_type post_type DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  -- Check for duplicate posts in the same city with same type within 15 minutes
  SELECT COUNT(*) INTO v_count FROM community_posts
  WHERE user_id = p_user_id
    AND status = 'active'
    AND created_at > now() - interval '15 minutes'
    AND origin_city = p_origin_city
    AND (p_post_type IS NULL OR post_type = p_post_type); -- Only check type if provided

  RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_post_usage_updated_at ON user_post_usage;
CREATE TRIGGER update_user_post_usage_updated_at BEFORE UPDATE ON user_post_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 9: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_post_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "View active posts or own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;

-- Community posts policies
CREATE POLICY "View active posts or own posts" ON community_posts
  FOR SELECT TO authenticated
  USING ((status = 'active' AND expires_at > now()) OR user_id = auth.uid());

CREATE POLICY "Users can insert own posts" ON community_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Cities policies
DROP POLICY IF EXISTS "Cities are viewable by all" ON cities;
CREATE POLICY "Cities are viewable by all" ON cities
  FOR SELECT TO authenticated USING (true);

-- Other policies
DROP POLICY IF EXISTS "Limits viewable by all" ON subscription_limits;
CREATE POLICY "Limits viewable by all" ON subscription_limits
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users view own usage" ON user_post_usage;
CREATE POLICY "Users view own usage" ON user_post_usage
  FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "View all interactions" ON community_interactions;
CREATE POLICY "View all interactions" ON community_interactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users create interactions" ON community_interactions;
CREATE POLICY "Users create interactions" ON community_interactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update interactions" ON community_interactions;
CREATE POLICY "Users update interactions" ON community_interactions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users view own notifications" ON notification_log;
CREATE POLICY "Users view own notifications" ON notification_log
  FOR SELECT TO authenticated USING (user_id = auth.uid());

GRANT EXECUTE ON FUNCTION increment(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION record_community_interaction(uuid, uuid, text, jsonb) TO authenticated;

-- ============================================
-- DONE! Now insert some test cities
-- ============================================

-- Sample Romanian cities
INSERT INTO cities (name, ascii_name, country_code, country_name, lat, lng, population, importance) VALUES
('București', 'Bucuresti', 'RO', 'Romania', 44.4268, 26.1025, 1883425, 1.0),
('Cluj-Napoca', 'Cluj-Napoca', 'RO', 'Romania', 46.7712, 23.6236, 324576, 0.9),
('Timișoara', 'Timisoara', 'RO', 'Romania', 45.7489, 21.2087, 319279, 0.9),
('Iași', 'Iasi', 'RO', 'Romania', 47.1585, 27.6014, 290422, 0.8),
('Constanța', 'Constanta', 'RO', 'Romania', 44.1598, 28.6348, 283872, 0.8),
('Craiova', 'Craiova', 'RO', 'Romania', 44.3302, 23.7949, 269506, 0.7),
('Brașov', 'Brasov', 'RO', 'Romania', 45.6579, 25.6012, 253200, 0.7),
('Galați', 'Galati', 'RO', 'Romania', 45.4353, 28.0080, 249432, 0.7),
('Ploiești', 'Ploiesti', 'RO', 'Romania', 44.9365, 26.0133, 209945, 0.6),
('Oradea', 'Oradea', 'RO', 'Romania', 47.0722, 21.9212, 196367, 0.6)
ON CONFLICT (name, country_code) DO NOTHING;