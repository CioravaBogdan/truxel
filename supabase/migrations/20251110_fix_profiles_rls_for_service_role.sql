-- Fix RLS policies + Auto-create profiles on signup
-- Migration: 20251110_fix_profiles_rls_for_service_role.sql
-- 
-- PROBLEMS FOUND:
-- 1. Edge Functions using service_role key cannot INSERT into profiles (RLS blocks)
-- 2. No trigger to auto-create profile when user signs up
-- 3. Only authenticated policies exist, no service_role policy
--
-- SOLUTIONS:
-- 1. Add service_role policy for Edge Functions (create-checkout-session needs this)
-- 2. Add auth.users trigger to auto-create profile on signup (BEST PRACTICE)
-- 3. Keep existing authenticated policies intact

-- ============================================================================
-- PART 1: ADD SERVICE_ROLE POLICY (for Edge Functions)
-- ============================================================================

-- Add service_role policy (keeps existing policies intact)
CREATE POLICY "Service role can manage profiles"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "Service role can manage profiles" ON profiles IS 
'Allows Edge Functions with service_role key to manage profiles (create, read, update). 
Required for create-checkout-session to auto-create profiles when missing.
Existing authenticated policies remain active for normal user operations.';

-- ============================================================================
-- PART 2: AUTO-CREATE PROFILE ON SIGNUP (Best Practice - Primary Solution)
-- ============================================================================

-- Function: Auto-create profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_language text;
  user_country text;
BEGIN
  -- Detect language from user metadata or default to 'en'
  default_language := COALESCE(
    NEW.raw_user_meta_data->>'preferred_language',
    'en'
  );

  -- Validate language (must be one of supported languages)
  IF default_language NOT IN ('en', 'ro', 'pl', 'tr', 'lt', 'es', 'uk', 'fr', 'de', 'it') THEN
    default_language := 'en';
  END IF;

  -- Insert profile with trial tier defaults
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    available_search_credits,
    trial_searches_used,
    monthly_searches_used,
    preferred_language,
    subscription_start_date
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'trial',
    'active',
    5, -- Trial tier gets 5 free searches
    0,
    0,
    default_language,
    now()
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 
'Auto-creates profile with trial tier defaults when user signs up. 
Detects language from user metadata, assigns 5 free searches, sets trial tier.
This is the PRIMARY solution - profiles should be created at signup, not at checkout.';

-- ============================================================================
-- VERIFICATION QUERY (for testing)
-- ============================================================================
-- Run this after deployment to verify policies:
-- SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY cmd, policyname;
