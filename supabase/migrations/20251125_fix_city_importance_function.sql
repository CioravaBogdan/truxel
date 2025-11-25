-- Fix increment_city_usage function to use correct column name 'importance'
-- Also fix auto_populate_city to use 'importance'

CREATE OR REPLACE FUNCTION increment_city_usage(p_city_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cities
  SET usage_count = COALESCE(usage_count, 0) + 1,
      -- Increase importance by 0.01 per use, capped at 1.0
      -- Start from 0.5 if importance is null
      importance = LEAST(1.0, COALESCE(importance, 0.5) + 0.01)
  WHERE id = p_city_id;
END;
$$;

-- Update auto_populate_city to use 'importance' instead of 'importance_score'
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
    lat, -- Removed state_code as it might not exist in table definition based on previous checks
    lng,
    population,
    importance, -- Fixed column name
    created_at,
    updated_at
  ) VALUES (
    p_city_name,
    p_country_code,
    p_country_name,
    p_lat,
    p_lng,
    0, -- Unknown population
    0.5, -- Default importance
    NOW(),
    NOW()
  )
  RETURNING * INTO v_city;

  RETURN v_city;
END;
$$;
