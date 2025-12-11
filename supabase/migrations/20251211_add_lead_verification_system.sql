-- ============================================================================
-- Migration: Add Lead Verification System (The "Implicit Flywheel")
-- Date: 2025-12-11
-- Purpose: Track how many users save a lead and boost its AI score accordingly
-- ============================================================================

-- 1. Add verification columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS verified_by_users_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- 2. Create function to handle lead verification (when user saves a lead)
CREATE OR REPLACE FUNCTION handle_new_user_lead()
RETURNS TRIGGER AS $$
DECLARE
  current_score DECIMAL;
  current_reasons JSONB;
  new_score DECIMAL;
  boost_amount DECIMAL := 0.05; -- 5% boost per save
BEGIN
  -- Get current lead data
  SELECT ai_match_score, match_reasons 
  INTO current_score, current_reasons
  FROM leads
  WHERE id = NEW.lead_id;

  -- Initialize if null
  IF current_score IS NULL THEN
    current_score := 0.5; -- Base score if none exists
  END IF;

  -- Calculate new score (Cap at 1.0)
  new_score := LEAST(1.0, current_score + boost_amount);

  -- Update the lead
  UPDATE leads
  SET 
    verified_by_users_count = COALESCE(verified_by_users_count, 0) + 1,
    last_verified_at = NOW(),
    ai_match_score = new_score,
    -- Append verification reason if not already present (simplified logic)
    match_reasons = CASE 
      WHEN current_reasons::text LIKE '%Verified by community%' THEN current_reasons
      ELSE (COALESCE(current_reasons, '[]'::jsonb) || jsonb_build_object('reason', 'Verified by community usage', 'weight', 0.1))
    END
  WHERE id = NEW.lead_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_user_lead_created ON user_leads;

CREATE TRIGGER on_user_lead_created
AFTER INSERT ON user_leads
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_lead();

-- 4. Backfill existing counts (Optional but recommended)
-- This counts how many times each lead appears in user_leads
WITH lead_counts AS (
  SELECT lead_id, COUNT(*) as save_count
  FROM user_leads
  GROUP BY lead_id
)
UPDATE leads
SET verified_by_users_count = lead_counts.save_count
FROM lead_counts
WHERE leads.id = lead_counts.lead_id;
