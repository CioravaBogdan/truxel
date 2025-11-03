-- Function to auto-populate cities from user locations
CREATE OR REPLACE FUNCTION auto_populate_city(
  p_lat FLOAT,
  p_lng FLOAT,
  p_city_name TEXT,
  p_country_code TEXT DEFAULT 'US',
  p_country_name TEXT DEFAULT 'United States',
  p_state_code TEXT DEFAULT NULL
)
RETURNS cities
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_city cities;
  v_existing cities;
BEGIN
  -- Normalize city name
  p_city_name := TRIM(INITCAP(p_city_name));

  -- Check if city already exists (within 10km radius)
  SELECT * INTO v_existing
  FROM cities
  WHERE country_code = p_country_code
    AND (
      LOWER(name) = LOWER(p_city_name)
      OR (
        lat IS NOT NULL
        AND lng IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(p_lng, p_lat)::geography,
          10000 -- 10km radius
        )
      )
    )
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    -- Update coordinates if better accuracy
    IF v_existing.lat IS NULL OR v_existing.lng IS NULL THEN
      UPDATE cities
      SET lat = p_lat,
          lng = p_lng,
          updated_at = NOW()
      WHERE id = v_existing.id;
    END IF;

    RETURN v_existing;
  END IF;

  -- Insert new city
  INSERT INTO cities (
    name,
    country_code,
    country_name,
    state_code,
    lat,
    lng,
    population,
    importance_score,
    is_user_generated,
    created_at,
    updated_at
  ) VALUES (
    p_city_name,
    p_country_code,
    p_country_name,
    p_state_code,
    p_lat,
    p_lng,
    0, -- Unknown population
    0.5, -- Default importance
    true, -- Mark as user-generated
    NOW(),
    NOW()
  )
  RETURNING * INTO v_city;

  RETURN v_city;
END;
$$;

-- Add column to track user-generated cities
ALTER TABLE cities
ADD COLUMN IF NOT EXISTS is_user_generated BOOLEAN DEFAULT false;

-- Add column to track usage count
ALTER TABLE cities
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Function to increment city usage
CREATE OR REPLACE FUNCTION increment_city_usage(p_city_id TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE cities
  SET usage_count = COALESCE(usage_count, 0) + 1,
      importance_score = LEAST(1.0, 0.5 + (COALESCE(usage_count, 0) * 0.01))
  WHERE id = p_city_id;
END;
$$;

-- Table to store unknown location searches
CREATE TABLE IF NOT EXISTS location_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  search_query TEXT,
  lat FLOAT,
  lng FLOAT,
  country_code TEXT,
  resolved BOOLEAN DEFAULT false,
  city_id TEXT REFERENCES cities(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for location_requests
ALTER TABLE location_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own location requests"
  ON location_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all location requests"
  ON location_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Analytics view for popular missing cities
CREATE OR REPLACE VIEW popular_missing_locations AS
SELECT
  search_query,
  COUNT(*) as request_count,
  AVG(lat) as avg_lat,
  AVG(lng) as avg_lng,
  country_code,
  MAX(created_at) as last_requested
FROM location_requests
WHERE resolved = false
  AND search_query IS NOT NULL
GROUP BY search_query, country_code
HAVING COUNT(*) >= 3
ORDER BY COUNT(*) DESC;