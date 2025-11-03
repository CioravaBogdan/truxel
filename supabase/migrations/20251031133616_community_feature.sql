-- Community Feature Migration
-- Version: 2.1.0
-- Description: Adds community posts, cities, and related tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create ENUMs
CREATE TYPE post_type AS ENUM (
  'DRIVER_AVAILABLE',
  'LOAD_AVAILABLE',
  'LOOKING_PARTNER',
  'PARKING_AVAILABLE'
);

CREATE TYPE post_status AS ENUM (
  'active',
  'matched',
  'expired',
  'cancelled'
);

-- Create cities table for local search (no API cost)
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

-- Create indexes for city search
CREATE INDEX cities_name_trgm ON cities USING GIN (name gin_trgm_ops);
CREATE INDEX cities_ascii_trgm ON cities USING GIN (ascii_name gin_trgm_ops);
CREATE INDEX cities_country ON cities(country_code);
CREATE INDEX cities_importance ON cities(importance DESC);
CREATE INDEX cities_population ON cities(population DESC);

-- Create subscription limits table
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

-- Insert subscription tiers
INSERT INTO subscription_limits (tier, posts_per_month, posts_per_day, concurrent_active_posts, post_duration_hours, features) VALUES
  ('trial', 5, 2, 1, 24, '{"contact_visible": false, "priority_display": false}'),
  ('standard', 30, 5, 3, 24, '{"contact_visible": true, "priority_display": false}'),
  ('pro', 100, 10, 5, 24, '{"contact_visible": true, "priority_display": true}'),
  ('premium', 500, 10, 10, 48, '{"contact_visible": true, "priority_display": true, "analytics": true}')
ON CONFLICT (tier) DO UPDATE SET
  posts_per_month = EXCLUDED.posts_per_month,
  posts_per_day = EXCLUDED.posts_per_day,
  concurrent_active_posts = EXCLUDED.concurrent_active_posts,
  post_duration_hours = EXCLUDED.post_duration_hours,
  features = EXCLUDED.features,
  updated_at = now();

-- Create main community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  -- Core fields
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_type post_type NOT NULL,
  status post_status DEFAULT 'active',

  -- Location (origin always required)
  origin_lat decimal(9,6) NOT NULL,
  origin_lng decimal(9,6) NOT NULL,
  origin_city text NOT NULL,
  origin_country text NOT NULL DEFAULT 'RO',

  -- Destination (optional for availability posts)
  dest_city text,
  dest_country text,
  dest_lat decimal(9,6),
  dest_lng decimal(9,6),

  -- Content
  template_key text NOT NULL,

  -- Metadata (flexible JSONB)
  metadata jsonb NOT NULL DEFAULT '{}',

  -- Contact
  contact_phone text,
  contact_whatsapp boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),

  -- Statistics
  view_count integer DEFAULT 0,
  contact_count integer DEFAULT 0,

  -- Constraints
  CONSTRAINT valid_destination CHECK (
    (post_type = 'DRIVER_AVAILABLE' AND dest_city IS NULL) OR
    (post_type != 'DRIVER_AVAILABLE')
  ),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Create indexes for community_posts
CREATE INDEX idx_posts_active ON community_posts(status) WHERE status = 'active';
CREATE INDEX idx_posts_expires ON community_posts(expires_at);
CREATE INDEX idx_posts_user ON community_posts(user_id);
CREATE INDEX idx_posts_type ON community_posts(post_type);
CREATE INDEX idx_posts_origin_city ON community_posts(origin_city);
CREATE INDEX idx_posts_dest_city ON community_posts(dest_city) WHERE dest_city IS NOT NULL;
CREATE INDEX idx_posts_metadata ON community_posts USING GIN(metadata);
CREATE INDEX idx_posts_created ON community_posts(created_at DESC);

-- Add PostGIS geography columns for geospatial queries
ALTER TABLE community_posts ADD COLUMN origin_location geography(POINT);
ALTER TABLE community_posts ADD COLUMN dest_location geography(POINT);

-- Create spatial indexes
CREATE INDEX idx_posts_origin_geo ON community_posts USING GIST(origin_location);
CREATE INDEX idx_posts_dest_geo ON community_posts USING GIST(dest_location) WHERE dest_location IS NOT NULL;

-- Create user post usage tracking table
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

-- Create interactions table
CREATE TABLE IF NOT EXISTS community_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'interested', 'contacted', 'saved', 'reported')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),

  UNIQUE(post_id, user_id, interaction_type)
);

CREATE INDEX idx_interactions_post ON community_interactions(post_id);
CREATE INDEX idx_interactions_user ON community_interactions(user_id);
CREATE INDEX idx_interactions_type ON community_interactions(interaction_type);

-- Create notification log for rate limiting
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX idx_notification_log_user ON notification_log(user_id, sent_at DESC);

-- Add community fields to profiles if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS community_notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_radius_km integer DEFAULT 25,
ADD COLUMN IF NOT EXISTS last_known_lat decimal(9,6),
ADD COLUMN IF NOT EXISTS last_known_lng decimal(9,6),
ADD COLUMN IF NOT EXISTS last_location_update timestamptz;

-- Add source tracking to leads table for community conversion
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'search',
ADD COLUMN IF NOT EXISTS source_id uuid;

-- Function to update geography columns
CREATE OR REPLACE FUNCTION update_post_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.origin_lat IS NOT NULL AND NEW.origin_lng IS NOT NULL THEN
    NEW.origin_location = ST_MakePoint(NEW.origin_lng, NEW.origin_lat)::geography;
  END IF;

  IF NEW.dest_lat IS NOT NULL AND NEW.dest_lng IS NOT NULL THEN
    NEW.dest_location = ST_MakePoint(NEW.dest_lng, NEW.dest_lat)::geography;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for geography update
CREATE TRIGGER update_post_geography_trigger
BEFORE INSERT OR UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION update_post_geography();

-- Function to check if user can post
CREATE OR REPLACE FUNCTION can_user_post(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_profile record;
  v_limits record;
  v_usage record;
  v_active_posts integer;
  v_subscription_tier text;
BEGIN
  -- Get user subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM profiles
  WHERE user_id = p_user_id;

  -- Default to trial if not found
  IF v_subscription_tier IS NULL THEN
    v_subscription_tier := 'trial';
  END IF;

  -- Get limits for tier
  SELECT * INTO v_limits FROM subscription_limits
  WHERE tier = v_subscription_tier;

  -- Get or create usage record
  INSERT INTO user_post_usage (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO UPDATE
  SET updated_at = now()
  RETURNING * INTO v_usage;

  -- Reset counters if needed
  IF v_usage.month_reset_at < date_trunc('month', now()) THEN
    UPDATE user_post_usage
    SET posts_this_month = 0,
        month_reset_at = date_trunc('month', now())
    WHERE user_id = p_user_id
    RETURNING * INTO v_usage;
  END IF;

  IF v_usage.day_reset_at < date_trunc('day', now()) THEN
    UPDATE user_post_usage
    SET posts_today = 0,
        day_reset_at = date_trunc('day', now())
    WHERE user_id = p_user_id
    RETURNING * INTO v_usage;
  END IF;

  -- Count active posts
  SELECT COUNT(*) INTO v_active_posts
  FROM community_posts
  WHERE user_id = p_user_id
    AND status = 'active'
    AND expires_at > now();

  -- Check hard cap (10 posts per day for everyone)
  IF v_usage.posts_today >= 10 THEN
    RETURN jsonb_build_object(
      'can_post', false,
      'reason', 'hard_limit_reached',
      'message', 'Limit maxim de 10 postri pe zi atins'
    );
  END IF;

  -- Return check result
  RETURN jsonb_build_object(
    'can_post', (
      v_usage.posts_this_month < v_limits.posts_per_month AND
      v_usage.posts_today < v_limits.posts_per_day AND
      v_active_posts < v_limits.concurrent_active_posts
    ),
    'posts_remaining_month', v_limits.posts_per_month - v_usage.posts_this_month,
    'posts_remaining_today', LEAST(v_limits.posts_per_day - v_usage.posts_today, 10 - v_usage.posts_today),
    'active_posts', v_active_posts,
    'max_active_posts', v_limits.concurrent_active_posts,
    'tier', v_subscription_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage after posting
CREATE OR REPLACE FUNCTION increment_post_usage(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_post_usage
  SET
    posts_this_month = posts_this_month + 1,
    posts_today = posts_today + 1,
    last_post_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment community post counters
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

-- Function to check for duplicate posts (anti-spam)
CREATE OR REPLACE FUNCTION check_duplicate_post(
  p_user_id uuid,
  p_origin_lat decimal,
  p_origin_lng decimal
)
RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM community_posts
  WHERE user_id = p_user_id
    AND status = 'active'
    AND created_at > now() - interval '15 minutes'
    AND ST_DWithin(
      origin_location,
      ST_MakePoint(p_origin_lng, p_origin_lat)::geography,
      1000 -- 1km radius
    );

  RETURN v_count = 0; -- Returns true if no duplicates
END;
$$ LANGUAGE plpgsql;

-- Function to expire old posts
CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_post_usage_updated_at BEFORE UPDATE ON user_post_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_post_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
CREATE POLICY "View active posts or own posts" ON community_posts
  FOR SELECT
  TO authenticated
  USING (
    (status = 'active' AND expires_at > now()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can insert own posts" ON community_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for cities (read-only for all authenticated users)
CREATE POLICY "Cities are viewable by all" ON cities
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for subscription_limits (read-only)
CREATE POLICY "Subscription limits are viewable by all" ON subscription_limits
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_post_usage
CREATE POLICY "Users can view own usage" ON user_post_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage usage" ON user_post_usage
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for community_interactions
CREATE POLICY "Users can view interactions" ON community_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create interactions" ON community_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own interactions" ON community_interactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for notification_log
CREATE POLICY "Users can view own notifications" ON notification_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;