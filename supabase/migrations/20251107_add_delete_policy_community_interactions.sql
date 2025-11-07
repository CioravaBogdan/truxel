-- CRITICAL FIX: Add missing RLS DELETE policy for community_interactions
-- 
-- ROOT CAUSE: Table had INSERT/UPDATE/SELECT policies but NO DELETE policy
-- This caused silent failure when app tried to unsave posts - Supabase blocked
-- the delete but returned success, causing posts to reappear after restart.
--
-- Date: 2025-11-07
-- Issue: Posts reappearing after unsave + app restart

-- Enable DELETE for users on their own interactions
CREATE POLICY "Users delete own interactions"
ON public.community_interactions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Verify all RLS policies are now complete
COMMENT ON POLICY "Users delete own interactions" ON public.community_interactions IS 
'Allows authenticated users to delete their own interaction records (save/unsave posts, contacts, views). 
Completes the RLS policy set: INSERT ✓ UPDATE ✓ SELECT ✓ DELETE ✓';
