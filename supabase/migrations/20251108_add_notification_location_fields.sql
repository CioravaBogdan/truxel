-- Migration: Add notification and location fields to profiles
-- Date: 2025-11-08
-- Purpose: Support push notifications and location-based post filtering

-- Add expo_push_token for push notifications
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Add last known location fields for notification filtering
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_known_city TEXT,
ADD COLUMN IF NOT EXISTS last_known_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS last_known_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS notification_radius_km INTEGER DEFAULT 50;

-- Add index for location queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_last_known_city 
ON profiles (last_known_city);

-- Comment the columns for documentation
COMMENT ON COLUMN profiles.expo_push_token IS 'Expo push notification token';
COMMENT ON COLUMN profiles.last_known_city IS 'User''s last known city for location-based notifications';
COMMENT ON COLUMN profiles.last_known_lat IS 'User''s last known latitude';
COMMENT ON COLUMN profiles.last_known_lng IS 'User''s last known longitude';
COMMENT ON COLUMN profiles.notification_radius_km IS 'Radius in km for location-based notifications (default 50km)';
