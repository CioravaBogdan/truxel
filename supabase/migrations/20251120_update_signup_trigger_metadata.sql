-- Update handle_new_user trigger to support all profile fields from metadata
-- Migration: 20251120_update_signup_trigger_metadata.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_language text;
  default_distance_unit text;
  default_currency text;
BEGIN
  -- Detect language from user metadata or default to 'en'
  default_language := COALESCE(
    NEW.raw_user_meta_data->>'preferred_language',
    'en'
  );

  -- Validate language
  IF default_language NOT IN ('en', 'ro', 'pl', 'tr', 'lt', 'es', 'uk', 'fr', 'de', 'it') THEN
    default_language := 'en';
  END IF;

  -- Detect distance unit
  default_distance_unit := COALESCE(
    NEW.raw_user_meta_data->>'preferred_distance_unit',
    'km'
  );

  -- Detect currency
  default_currency := COALESCE(
    NEW.raw_user_meta_data->>'preferred_currency',
    'EUR'
  );

  -- Insert profile with all metadata fields
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    phone_number,
    company_name,
    subscription_tier,
    subscription_status,
    available_search_credits,
    trial_searches_used,
    monthly_searches_used,
    preferred_language,
    preferred_distance_unit,
    preferred_currency,
    subscription_start_date
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'company_name',
    'trial',
    'active',
    5, -- Trial tier gets 5 free searches
    0,
    0,
    default_language,
    default_distance_unit,
    default_currency,
    now()
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent error if profile already exists

  RETURN NEW;
END;
$$;
