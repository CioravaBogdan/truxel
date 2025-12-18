-- Track RevenueCat current app_user_id (can be $RCAnonymousID... or Supabase UUID)
-- Helps auditing and debugging alias/linking issues.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS revenuecat_app_user_id text;
