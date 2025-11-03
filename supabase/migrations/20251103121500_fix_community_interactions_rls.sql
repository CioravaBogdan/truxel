-- Allow authenticated users to update their own community interaction records
-- Fixes RLS errors when calling record_community_interaction via the mobile app

BEGIN;

DROP POLICY IF EXISTS "Users update interactions" ON public.community_interactions;

CREATE POLICY "Users update interactions"
  ON public.community_interactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMIT;
