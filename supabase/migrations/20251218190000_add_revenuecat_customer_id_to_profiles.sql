-- Add RevenueCat customer identifier to profiles for easier audits
-- RevenueCat's stable identifier for a customer is typically the original_app_user_id.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS revenuecat_customer_id text;
