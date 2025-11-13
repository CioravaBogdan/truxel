-- ============================================================================
-- Migration: Create user_leads junction table (Many-to-Many)
-- Date: 2025-11-13
-- Purpose: Eliminate lead duplication by using junction table
-- ============================================================================

-- STEP 1: Drop old RLS policies that depend on leads.user_id
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;

-- STEP 2: Create user_leads junction table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  
  -- User-specific metadata (moved from leads table)
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'won', 'lost')),
  user_notes text,
  
  -- Source tracking (from where user saved this lead)
  source_type text DEFAULT 'search', -- 'search' or 'community'
  source_id uuid, -- search_id or community_post.id
  source_search_id uuid, -- Legacy compatibility
  
  -- Timestamps
  saved_at timestamptz DEFAULT now(),
  last_contacted_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  
  -- Prevent duplicates: one user cannot save the same lead twice
  UNIQUE(user_id, lead_id)
);

-- STEP 3: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_leads_user_id ON user_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_leads_lead_id ON user_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_user_leads_status ON user_leads(status);
CREATE INDEX IF NOT EXISTS idx_user_leads_saved_at ON user_leads(saved_at DESC);

-- STEP 4: Migrate existing data from leads to user_leads
-- ============================================================================
-- Only migrate if user_id exists (before column drop)
DO $$
BEGIN
  -- Check if user_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'user_id'
  ) THEN
    -- Migrate data: create user_leads entries from existing leads
    INSERT INTO user_leads (
      user_id, 
      lead_id, 
      status, 
      user_notes, 
      source_search_id, 
      source_type,
      source_id,
      saved_at
    )
    SELECT 
      user_id,
      id as lead_id,
      COALESCE(status, 'new'),
      user_notes,
      source_search_id,
      COALESCE(source_type, 'search'),
      source_id,
      created_at as saved_at
    FROM leads
    WHERE user_id IS NOT NULL -- Only migrate leads with valid user_id
    ON CONFLICT (user_id, lead_id) DO NOTHING; -- Ignore duplicates
  END IF;
END $$;

-- STEP 5: Drop user_id and user-specific columns from leads table
-- ============================================================================
-- Note: User should manually verify migration before running this!
-- Uncomment the lines below after verifying data migration:

-- ALTER TABLE leads DROP COLUMN IF EXISTS user_id CASCADE;
-- ALTER TABLE leads DROP COLUMN IF EXISTS status CASCADE;
-- ALTER TABLE leads DROP COLUMN IF EXISTS user_notes CASCADE;
-- ALTER TABLE leads DROP COLUMN IF EXISTS source_search_id CASCADE;

-- STEP 6: Enable Row Level Security on user_leads
-- ============================================================================
ALTER TABLE user_leads ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create RLS policies for user_leads
-- ============================================================================

-- Policy: Users can view their own saved leads
CREATE POLICY "Users can view own saved leads"
  ON user_leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can save (insert) new leads
CREATE POLICY "Users can save new leads"
  ON user_leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own saved leads (status, notes)
CREATE POLICY "Users can update own saved leads"
  ON user_leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unsave (delete) their own leads
CREATE POLICY "Users can unsave own leads"
  ON user_leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- STEP 8: Update RLS policies for leads table (now shared data)
-- ============================================================================

-- Policy: All authenticated users can view leads (shared company data)
CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true); -- All users can see all leads

-- Policy: All authenticated users can insert new leads (deduplication handled by app)
CREATE POLICY "Authenticated users can insert leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: All authenticated users can update leads (shared company data)
CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only allow delete if no user_leads references exist
-- (Prevent orphaned user_leads entries)
CREATE POLICY "Prevent delete if users have saved lead"
  ON leads FOR DELETE
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM user_leads 
      WHERE user_leads.lead_id = leads.id
    )
  );

-- STEP 9: Create helper function to get user's lead with metadata
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_leads(p_user_id uuid)
RETURNS TABLE (
  -- Lead data
  lead_id uuid,
  company_name text,
  contact_person_name text,
  email text,
  phone text,
  whatsapp text,
  linkedin text,
  linkedin_profile_url text,
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
  ai_match_score decimal,
  match_reasons jsonb,
  employee_count int,
  founded_year int,
  annual_revenue text,
  social_links jsonb,
  lead_created_at timestamptz,
  lead_updated_at timestamptz,
  -- User-specific metadata
  status text,
  user_notes text,
  saved_at timestamptz,
  last_contacted_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id as lead_id,
    l.company_name,
    l.contact_person_name,
    l.email,
    l.phone,
    l.whatsapp,
    l.linkedin,
    l.linkedin_profile_url,
    l.facebook,
    l.instagram,
    l.website,
    l.industry,
    l.address,
    l.city,
    l.country,
    l.latitude,
    l.longitude,
    l.description,
    l.ai_match_score,
    l.match_reasons,
    l.employee_count,
    l.founded_year,
    l.annual_revenue,
    l.social_links,
    l.created_at as lead_created_at,
    l.updated_at as lead_updated_at,
    ul.status,
    ul.user_notes,
    ul.saved_at,
    ul.last_contacted_at
  FROM user_leads ul
  JOIN leads l ON l.id = ul.lead_id
  WHERE ul.user_id = p_user_id
  ORDER BY ul.saved_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 10: Create trigger to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_leads_updated_at
BEFORE UPDATE ON user_leads
FOR EACH ROW
EXECUTE FUNCTION update_user_leads_updated_at();

-- ============================================================================
-- VERIFICATION QUERIES (Run these manually to verify migration)
-- ============================================================================

-- 1. Count original leads with user_id
-- SELECT COUNT(*) as original_leads FROM leads WHERE user_id IS NOT NULL;

-- 2. Count migrated user_leads
-- SELECT COUNT(*) as migrated_user_leads FROM user_leads;

-- 3. Check for any orphaned leads (no user_leads references)
-- SELECT COUNT(*) as orphaned_leads FROM leads l
-- WHERE NOT EXISTS (SELECT 1 FROM user_leads ul WHERE ul.lead_id = l.id);

-- 4. Test helper function (replace with actual user_id)
-- SELECT * FROM get_user_leads('your-user-uuid-here') LIMIT 5;

-- ============================================================================
-- MANUAL CLEANUP STEPS (After verification)
-- ============================================================================

-- Step A: Remove duplicate leads (same company data, different user_id)
-- This requires careful analysis based on your deduplication logic:
-- - Same phone number
-- - Same email + company_name
-- - etc.

-- Example: Keep first lead, update user_leads to point to it
-- WITH duplicates AS (
--   SELECT id, phone, ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at) as rn
--   FROM leads
--   WHERE phone IS NOT NULL
-- )
-- UPDATE user_leads ul
-- SET lead_id = (SELECT id FROM duplicates WHERE rn = 1 AND phone = l.phone)
-- FROM leads l
-- WHERE ul.lead_id = l.id 
--   AND l.phone IN (SELECT phone FROM duplicates WHERE rn > 1);

-- DELETE FROM leads WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Step B: Drop old columns (ONLY after verifying migration!)
-- ALTER TABLE leads DROP COLUMN user_id CASCADE;
-- ALTER TABLE leads DROP COLUMN status CASCADE;
-- ALTER TABLE leads DROP COLUMN user_notes CASCADE;
-- ALTER TABLE leads DROP COLUMN source_search_id CASCADE;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
