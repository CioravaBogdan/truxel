-- Add profile preferences columns for truck type, search radius, and industry preferences
-- Migration: 20251022170000_add_profile_preferences.sql

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS truck_type TEXT CHECK (truck_type IN ('3.5T', '7.5T', '12T', '20T', 'Trailer', 'MegaTrailer', 'Frigo', 'Tanker', 'Flatbed', 'Other')),
ADD COLUMN IF NOT EXISTS search_radius_km INTEGER DEFAULT 5 CHECK (search_radius_km IN (5, 10, 50)),
ADD COLUMN IF NOT EXISTS preferred_industries JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.full_name IS 'User full name for personal identification';
COMMENT ON COLUMN profiles.company_name IS 'Company name for business context in messages';
COMMENT ON COLUMN profiles.truck_type IS 'Type of truck user operates (for matching leads)';
COMMENT ON COLUMN profiles.search_radius_km IS 'Default search radius in kilometers (5, 10, 50). 5km recommended for best coverage.';
COMMENT ON COLUMN profiles.preferred_industries IS 'Array of up to 5 preferred industries (used as default for search)';

-- Create index for faster queries on truck_type and preferred_industries
CREATE INDEX IF NOT EXISTS idx_profiles_truck_type ON profiles(truck_type);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_industries ON profiles USING GIN(preferred_industries);

-- Update RLS policies to allow users to update their own profile preferences
-- (Existing policy should already allow this, but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
