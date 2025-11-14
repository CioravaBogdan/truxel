-- Update search_radius_km constraint to only allow 5, 10, 50 km
-- Simplified based on Google Places API best practices
-- Migration: 20251114_update_search_radius_options.sql

-- Drop old constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_search_radius_km_check;

-- Add new constraint with simplified options
ALTER TABLE profiles
ADD CONSTRAINT profiles_search_radius_km_check 
CHECK (search_radius_km IN (5, 10, 50));

-- Update default value to 5 km (recommended)
ALTER TABLE profiles
ALTER COLUMN search_radius_km SET DEFAULT 5;

-- Update existing profiles with invalid radius to default (5km)
UPDATE profiles
SET search_radius_km = 5
WHERE search_radius_km NOT IN (5, 10, 50) OR search_radius_km IS NULL;

-- Update comment
COMMENT ON COLUMN profiles.search_radius_km IS 
'Default search radius in kilometers. Options: 5 (recommended), 10, 50. Larger radius may miss companies due to Google Places API limits.';
