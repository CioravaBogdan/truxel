-- Migration: Add last_known_city to profiles
-- Date: 2025-11-08
-- Purpose: Support location-based post filtering for push notifications
-- NOTE: Other notification fields (expo_push_token, last_known_lat, last_known_lng, 
--       notification_radius_km, community_notifications_enabled) already exist

-- VERIFIED EXISTING COLUMNS (2025-11-08):
-- ✅ expo_push_token TEXT (nullable)
-- ✅ last_known_lat NUMERIC (nullable)
-- ✅ last_known_lng NUMERIC (nullable)
-- ✅ notification_radius_km INTEGER (default 25)
-- ✅ community_notifications_enabled BOOLEAN (default false)

-- Add only missing column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_known_city TEXT;

-- Add index for fast city-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_known_city 
ON profiles (last_known_city);

-- Add comment for documentation
COMMENT ON COLUMN profiles.last_known_city IS 'User''s last known city for location-based notifications';
