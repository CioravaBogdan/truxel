-- Fix duplicate post detection to check post_type as well
-- This prevents false positives when user has DRIVER_AVAILABLE and LOAD_AVAILABLE posts in same city

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

-- Test: Verify function works correctly
-- User should be able to have both DRIVER_AVAILABLE and LOAD_AVAILABLE posts in same city
