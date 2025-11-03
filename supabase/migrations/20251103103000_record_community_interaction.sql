-- Fix community interaction recording by routing through a security definer function
-- This allows authenticated users to record their own interactions without hitting RLS blockers.

BEGIN;

CREATE OR REPLACE FUNCTION record_community_interaction(
  p_user_id uuid,
  p_post_id uuid,
  p_interaction_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted boolean := false;
BEGIN
  -- Basic validation and auth guard
  IF p_user_id IS NULL OR p_post_id IS NULL OR p_interaction_type IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters for community interaction';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized to record interaction for another user';
  END IF;

  -- Perform upsert and capture whether the row was newly inserted
  WITH upsert AS (
    INSERT INTO community_interactions AS ci (post_id, user_id, interaction_type, metadata)
    VALUES (p_post_id, p_user_id, p_interaction_type, COALESCE(p_metadata, '{}'::jsonb))
    ON CONFLICT (post_id, user_id, interaction_type) DO UPDATE
      SET metadata = CASE
        WHEN EXCLUDED.metadata IS NULL OR EXCLUDED.metadata = '{}'::jsonb THEN ci.metadata
        ELSE COALESCE(ci.metadata, '{}'::jsonb) || EXCLUDED.metadata
      END,
      created_at = ci.created_at
    RETURNING (xmax = 0) AS inserted
  )
  SELECT inserted INTO v_inserted FROM upsert;

  IF v_inserted IS NULL THEN
    v_inserted := false;
  END IF;

  -- Increment contact counters only on first contact
  IF v_inserted AND p_interaction_type = 'contacted' THEN
    UPDATE community_posts
    SET contact_count = COALESCE(contact_count, 0) + 1
    WHERE id = p_post_id;
  END IF;

  RETURN jsonb_build_object('inserted', v_inserted);
END;
$$;

GRANT EXECUTE ON FUNCTION record_community_interaction(uuid, uuid, text, jsonb) TO authenticated;

COMMIT;
