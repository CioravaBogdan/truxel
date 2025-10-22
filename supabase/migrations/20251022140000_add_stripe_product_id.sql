/*
  # Add stripe_product_id to subscription_tiers

  Adds stripe_product_id column to subscription_tiers table to track Stripe product IDs
  alongside price IDs for better product management.
*/

-- Add stripe_product_id column to subscription_tiers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_tiers' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE subscription_tiers ADD COLUMN stripe_product_id TEXT;
  END IF;
END $$;

-- Update with current Truxel Stripe product IDs
UPDATE subscription_tiers 
SET stripe_product_id = 'prod_THaEgwK8Jupt1E'
WHERE tier_name = 'trial';

UPDATE subscription_tiers 
SET stripe_product_id = 'prod_THaEncye4n7tEi'
WHERE tier_name = 'standard';

UPDATE subscription_tiers 
SET stripe_product_id = 'prod_THaFkFFzFDOebz'
WHERE tier_name = 'pro';
