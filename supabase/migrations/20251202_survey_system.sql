-- Migration: Survey System
-- Description: Adds tables for surveys and responses, and adds country to profiles.

-- 1. Add country to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ADD COLUMN country TEXT;
        COMMENT ON COLUMN profiles.country IS 'User country code (ISO 2 chars) for targeting';
    END IF;
END $$;

-- 2. Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    questions JSONB NOT NULL, -- Array of strings
    options JSONB, -- Array of arrays of strings (for multiple choice)
    target_countries TEXT[], -- Array of country codes, NULL = all
    min_subscription_tier TEXT, -- 'standard', 'pro', etc.
    status TEXT NOT NULL DEFAULT 'draft', -- 'active', 'completed', 'draft', 'archived'
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL, -- Key-value pair: question_index -> answer
    custom_response TEXT, -- User's custom feedback
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(survey_id, user_id) -- Prevent multiple responses
);

-- 4. Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for surveys
-- Users can read active surveys
CREATE POLICY "Users can view active surveys" ON surveys
    FOR SELECT
    USING (status = 'active');

-- Admins (service role) can do everything - implicit

-- 6. RLS Policies for survey_responses
-- Users can insert their own responses
CREATE POLICY "Users can submit responses" ON survey_responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own responses
CREATE POLICY "Users can view own responses" ON survey_responses
    FOR SELECT
    USING (auth.uid() = user_id);
