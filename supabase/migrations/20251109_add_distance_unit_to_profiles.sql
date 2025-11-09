-- Add preferred_distance_unit column to profiles table
-- Values: 'km' (kilometers) or 'mi' (miles)
-- Default: 'km' for existing users (international standard)

-- Add column with default 'km'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_distance_unit text 
DEFAULT 'km' 
CHECK (preferred_distance_unit IN ('km', 'mi'));

-- Add comment explaining the column
COMMENT ON COLUMN profiles.preferred_distance_unit IS 
'User preferred distance unit: km (kilometers) or mi (miles). Auto-detected on signup based on device locale (US/CA/UK = miles, others = km). All database storage remains in km, this only affects UI display.';

-- Update existing users to 'km' (safe default)
UPDATE profiles 
SET preferred_distance_unit = 'km' 
WHERE preferred_distance_unit IS NULL;

-- Make column NOT NULL after setting defaults
ALTER TABLE profiles 
ALTER COLUMN preferred_distance_unit SET NOT NULL;
