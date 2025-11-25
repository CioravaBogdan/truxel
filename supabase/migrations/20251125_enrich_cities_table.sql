-- Upgrade cities table with rich data from N8N flow
-- Adds support for regional logistics, timezones, and precise location

ALTER TABLE cities
ADD COLUMN IF NOT EXISTS state_code text,        -- Ex: RO-BC (Standard ISO code for subdivision)
ADD COLUMN IF NOT EXISTS state_name text,        -- Ex: Bacau (County/District name)
ADD COLUMN IF NOT EXISTS region_name text,       -- Ex: Nord-Est (Macro-region for broader logistics)
ADD COLUMN IF NOT EXISTS timezone text,          -- Ex: Europe/Bucharest (Crucial for international logistics)
ADD COLUMN IF NOT EXISTS wikidata_id text,       -- Ex: Q15735972 (Universal ID for future integrations)
ADD COLUMN IF NOT EXISTS geoname_id text,        -- Ex: 670257 (Changed to text to be safe, though usually int)
ADD COLUMN IF NOT EXISTS plus_code text;         -- Ex: 8GR9693P+J6 (Precise location for warehouses)

-- Create index for fast filtering by county/state (very common in logistics)
CREATE INDEX IF NOT EXISTS idx_cities_state_code ON cities(state_code);

-- Create index for timezone to group users/jobs by time
CREATE INDEX IF NOT EXISTS idx_cities_timezone ON cities(timezone);

-- Update the auto_populate_city function to accept these new parameters
-- We drop it first to change signature cleanly if needed, or just replace
CREATE OR REPLACE FUNCTION auto_populate_city(
  p_lat FLOAT,
  p_lng FLOAT,
  p_city_name TEXT,
  p_country_code TEXT DEFAULT 'US',
  p_country_name TEXT DEFAULT 'United States',
  p_state_code TEXT DEFAULT NULL,
  p_state_name TEXT DEFAULT NULL,
  p_region_name TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_wikidata_id TEXT DEFAULT NULL,
  p_plus_code TEXT DEFAULT NULL
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
    -- Update with richer data if missing
    UPDATE cities
    SET 
      state_code = COALESCE(v_existing.state_code, p_state_code),
      state_name = COALESCE(v_existing.state_name, p_state_name),
      region_name = COALESCE(v_existing.region_name, p_region_name),
      timezone = COALESCE(v_existing.timezone, p_timezone),
      wikidata_id = COALESCE(v_existing.wikidata_id, p_wikidata_id),
      plus_code = COALESCE(v_existing.plus_code, p_plus_code),
      updated_at = NOW()
    WHERE id = v_existing.id;

    RETURN v_existing;
  END IF;

  -- Insert new city with all rich data
  INSERT INTO cities (
    name,
    country_code,
    country_name,
    state_code,
    state_name,
    region_name,
    timezone,
    wikidata_id,
    plus_code,
    lat,
    lng,
    population,
    importance,
    is_user_generated,
    created_at,
    updated_at
  ) VALUES (
    p_city_name,
    p_country_code,
    p_country_name,
    p_state_code,
    p_state_name,
    p_region_name,
    p_timezone,
    p_wikidata_id,
    p_plus_code,
    p_lat,
    p_lng,
    0, -- Unknown population initially
    0.5, -- Default importance
    true, -- Mark as user-generated
    NOW(),
    NOW()
  )
  RETURNING * INTO v_city;

  RETURN v_city;
END;
$$;
