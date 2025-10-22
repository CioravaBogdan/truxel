/*
  # Add Pro Tier and Complete Stripe Integration

  1. New Subscription Tier
    - Add "pro" tier at 49.99 EUR with LinkedIn contacts and AI matching
    - Update subscription_tiers table with feature flags

  2. Enhanced Tables
    - Add Stripe-related fields to profiles table
    - Create user_search_credits table for tracking purchased search packs
    - Create stripe_webhook_events table for idempotency
    - Add feature flags to subscription_tiers

  3. New Fields
    - profiles: available_search_credits, stripe_subscription_id, stripe_current_period_end, stripe_subscription_status, pending_tier_change
    - subscription_tiers: linkedin_enabled, ai_matching_enabled, advanced_research_enabled, max_results_per_search
    - leads: linkedin_profile_url, ai_match_score, match_reasons, employee_count, founded_year, annual_revenue, social_links

  4. Search Credits Management
    - Track purchased credits separately from subscription credits
    - Priority: purchased credits -> monthly subscription credits

  5. Security
    - Enable RLS on all new tables
    - Add policies for user access control

  6. Indexes
    - Add performance indexes for Stripe fields and credit queries
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'available_search_credits'
  ) THEN
    ALTER TABLE profiles ADD COLUMN available_search_credits int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_current_period_end'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_current_period_end timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pending_tier_change'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pending_tier_change text;
  END IF;
END $$;

-- Update subscription_tier check constraint to include 'pro'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('trial', 'standard', 'pro', 'premium'));

-- Add feature flag columns to subscription_tiers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_tiers' AND column_name = 'linkedin_enabled'
  ) THEN
    ALTER TABLE subscription_tiers ADD COLUMN linkedin_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_tiers' AND column_name = 'ai_matching_enabled'
  ) THEN
    ALTER TABLE subscription_tiers ADD COLUMN ai_matching_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_tiers' AND column_name = 'advanced_research_enabled'
  ) THEN
    ALTER TABLE subscription_tiers ADD COLUMN advanced_research_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_tiers' AND column_name = 'max_results_per_search'
  ) THEN
    ALTER TABLE subscription_tiers ADD COLUMN max_results_per_search int DEFAULT 10;
  END IF;
END $$;

-- Add enhanced lead data columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'linkedin_profile_url'
  ) THEN
    ALTER TABLE leads ADD COLUMN linkedin_profile_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'ai_match_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN ai_match_score decimal;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'match_reasons'
  ) THEN
    ALTER TABLE leads ADD COLUMN match_reasons jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'employee_count'
  ) THEN
    ALTER TABLE leads ADD COLUMN employee_count int;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'founded_year'
  ) THEN
    ALTER TABLE leads ADD COLUMN founded_year int;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'annual_revenue'
  ) THEN
    ALTER TABLE leads ADD COLUMN annual_revenue text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE leads ADD COLUMN social_links jsonb;
  END IF;
END $$;

-- Create user_search_credits table for tracking purchased search packs
CREATE TABLE IF NOT EXISTS user_search_credits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credits_purchased int NOT NULL,
  credits_remaining int NOT NULL,
  purchase_transaction_id uuid REFERENCES transactions(id),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  payload jsonb NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS on new tables
ALTER TABLE user_search_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_search_credits
CREATE POLICY "Users can view own search credits"
  ON user_search_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search credits"
  ON user_search_credits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search credits"
  ON user_search_credits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for stripe_webhook_events (service role only)
CREATE POLICY "Service role can manage webhook events"
  ON stripe_webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update subscription tiers with new Pro tier and feature flags
INSERT INTO subscription_tiers (
  tier_name, 
  price, 
  searches_per_month, 
  description,
  linkedin_enabled,
  ai_matching_enabled,
  advanced_research_enabled,
  max_results_per_search
) VALUES
  ('pro', 49.99, 30, 'LinkedIn contacts, AI matching, and advanced research', true, true, true, 20)
ON CONFLICT (tier_name) DO UPDATE SET
  price = EXCLUDED.price,
  searches_per_month = EXCLUDED.searches_per_month,
  description = EXCLUDED.description,
  linkedin_enabled = EXCLUDED.linkedin_enabled,
  ai_matching_enabled = EXCLUDED.ai_matching_enabled,
  advanced_research_enabled = EXCLUDED.advanced_research_enabled,
  max_results_per_search = EXCLUDED.max_results_per_search;

-- Update existing tiers with feature flags
UPDATE subscription_tiers SET
  linkedin_enabled = false,
  ai_matching_enabled = false,
  advanced_research_enabled = false,
  max_results_per_search = 10
WHERE tier_name = 'trial';

UPDATE subscription_tiers SET
  linkedin_enabled = false,
  ai_matching_enabled = false,
  advanced_research_enabled = false,
  max_results_per_search = 15
WHERE tier_name = 'standard';

UPDATE subscription_tiers SET
  linkedin_enabled = true,
  ai_matching_enabled = true,
  advanced_research_enabled = true,
  max_results_per_search = 50
WHERE tier_name = 'premium';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_search_credits_user_id ON user_search_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_credits_expires_at ON user_search_credits(expires_at);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_leads_ai_match_score ON leads(ai_match_score DESC) WHERE ai_match_score IS NOT NULL;

-- Create trigger for user_search_credits updated_at
DROP TRIGGER IF EXISTS update_user_search_credits_updated_at ON user_search_credits;
CREATE TRIGGER update_user_search_credits_updated_at
  BEFORE UPDATE ON user_search_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get total available search credits (purchased + subscription)
CREATE OR REPLACE FUNCTION get_total_search_credits(p_user_id uuid)
RETURNS TABLE(
  purchased_credits int,
  subscription_searches_remaining int,
  total_available int
) AS $$
DECLARE
  v_purchased_credits int;
  v_subscription_remaining int;
  v_profile profiles%ROWTYPE;
BEGIN
  -- Get purchased credits that haven't expired
  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_purchased_credits
  FROM user_search_credits
  WHERE user_id = p_user_id
    AND credits_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  -- Get profile info
  SELECT * INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;

  -- Calculate subscription searches remaining
  IF v_profile.subscription_tier = 'trial' THEN
    v_subscription_remaining := GREATEST(0, 5 - v_profile.trial_searches_used);
  ELSIF v_profile.subscription_tier = 'standard' THEN
    v_subscription_remaining := GREATEST(0, 15 - v_profile.monthly_searches_used);
  ELSIF v_profile.subscription_tier = 'pro' THEN
    v_subscription_remaining := GREATEST(0, 30 - v_profile.monthly_searches_used);
  ELSIF v_profile.subscription_tier = 'premium' THEN
    v_subscription_remaining := GREATEST(0, 100 - v_profile.monthly_searches_used);
  ELSE
    v_subscription_remaining := 0;
  END IF;

  RETURN QUERY SELECT 
    v_purchased_credits,
    v_subscription_remaining,
    v_purchased_credits + v_subscription_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume search credit with priority logic
CREATE OR REPLACE FUNCTION consume_search_credit(p_user_id uuid)
RETURNS TABLE(
  success boolean,
  credit_source text,
  remaining_purchased int,
  remaining_subscription int
) AS $$
DECLARE
  v_credit_record user_search_credits%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_tier_limits jsonb := '{"trial": 5, "standard": 15, "pro": 30, "premium": 100}'::jsonb;
BEGIN
  -- Try to consume from purchased credits first (oldest first, FIFO)
  SELECT * INTO v_credit_record
  FROM user_search_credits
  WHERE user_id = p_user_id
    AND credits_remaining > 0
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    -- Consume from purchased credits
    UPDATE user_search_credits
    SET credits_remaining = credits_remaining - 1
    WHERE id = v_credit_record.id;

    -- Get remaining counts
    DECLARE
      v_remaining_purchased int;
      v_credits_result RECORD;
    BEGIN
      SELECT * INTO v_credits_result FROM get_total_search_credits(p_user_id);
      
      RETURN QUERY SELECT 
        true,
        'purchased'::text,
        v_credits_result.purchased_credits,
        v_credits_result.subscription_searches_remaining;
    END;
  ELSE
    -- No purchased credits, try subscription credits
    SELECT * INTO v_profile FROM profiles WHERE user_id = p_user_id FOR UPDATE;
    
    IF v_profile.subscription_tier = 'trial' THEN
      IF v_profile.trial_searches_used < 5 THEN
        UPDATE profiles 
        SET trial_searches_used = trial_searches_used + 1
        WHERE user_id = p_user_id;
        
        DECLARE v_credits_result RECORD;
        BEGIN
          SELECT * INTO v_credits_result FROM get_total_search_credits(p_user_id);
          
          RETURN QUERY SELECT 
            true,
            'subscription'::text,
            v_credits_result.purchased_credits,
            v_credits_result.subscription_searches_remaining;
        END;
      ELSE
        RETURN QUERY SELECT false, 'none'::text, 0, 0;
      END IF;
    ELSE
      -- Standard, Pro, or Premium tier
      DECLARE
        v_limit int;
      BEGIN
        v_limit := (v_tier_limits->>v_profile.subscription_tier)::int;
        
        IF v_profile.monthly_searches_used < v_limit THEN
          UPDATE profiles 
          SET monthly_searches_used = monthly_searches_used + 1
          WHERE user_id = p_user_id;
          
          DECLARE v_credits_result RECORD;
          BEGIN
            SELECT * INTO v_credits_result FROM get_total_search_credits(p_user_id);
            
            RETURN QUERY SELECT 
              true,
              'subscription'::text,
              v_credits_result.purchased_credits,
              v_credits_result.subscription_searches_remaining;
          END;
        ELSE
          RETURN QUERY SELECT false, 'none'::text, 0, 0;
        END IF;
      END;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
