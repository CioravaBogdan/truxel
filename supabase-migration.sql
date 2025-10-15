-- LogisticsLead Database Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  company_name text,
  subscription_tier text DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'standard', 'premium')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  trial_searches_used int DEFAULT 0,
  monthly_searches_used int DEFAULT 0,
  subscription_start_date timestamptz DEFAULT now(),
  subscription_renewal_date timestamptz,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'ro', 'pl', 'tr', 'lt', 'es')),
  expo_push_token text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_search_id uuid,
  company_name text NOT NULL,
  contact_person_name text,
  email text,
  phone text,
  whatsapp text,
  linkedin text,
  facebook text,
  instagram text,
  website text,
  industry text,
  address text,
  city text,
  country text,
  latitude decimal,
  longitude decimal,
  description text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'won', 'lost')),
  user_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create searches table
CREATE TABLE IF NOT EXISTS searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_type text DEFAULT 'radius' CHECK (search_type IN ('radius', 'custom')),
  search_keywords text,
  search_address text,
  latitude decimal,
  longitude decimal,
  radius_km int DEFAULT 5,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  webhook_sent_at timestamptz,
  completed_at timestamptz,
  results_count int DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name text UNIQUE NOT NULL,
  price decimal NOT NULL,
  searches_per_month int NOT NULL,
  description text,
  stripe_price_id text,
  created_at timestamptz DEFAULT now()
);

-- Create additional_search_packs table
CREATE TABLE IF NOT EXISTS additional_search_packs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_name text UNIQUE NOT NULL,
  price decimal NOT NULL,
  searches_count int NOT NULL,
  stripe_price_id text,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('subscription', 'search_pack', 'renewal')),
  tier_or_pack_name text,
  amount decimal NOT NULL,
  stripe_payment_id text,
  stripe_subscription_id text,
  searches_added int,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_search_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Searches policies
CREATE POLICY "Users can view own searches"
  ON searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own searches"
  ON searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscription tiers policies (public read)
CREATE POLICY "Anyone can view subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated
  USING (true);

-- Search packs policies (public read)
CREATE POLICY "Anyone can view search packs"
  ON additional_search_packs FOR SELECT
  TO authenticated
  USING (true);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (tier_name, price, searches_per_month, description) VALUES
  ('trial', 0.00, 5, 'Free trial with 5 searches'),
  ('standard', 29.99, 15, '15 searches per month'),
  ('premium', 199.99, 100, '100 searches per month')
ON CONFLICT (tier_name) DO NOTHING;

-- Insert default search pack
INSERT INTO additional_search_packs (pack_name, price, searches_count) VALUES
  ('10_searches_pack', 24.99, 10)
ON CONFLICT (pack_name) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source_search ON leads(source_search_id);
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_status ON searches(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
