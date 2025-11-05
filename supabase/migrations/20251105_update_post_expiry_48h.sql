-- Update Post Expiry from 24 hours to 48 hours
-- Version: 2.2.0
-- Description: Change default post duration to be fairer to users

BEGIN;

-- Update default expiry in community_posts table
ALTER TABLE community_posts 
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '48 hours');

-- Update subscription_limits to reflect new 48h duration
UPDATE subscription_limits
SET post_duration_hours = 48
WHERE tier IN ('trial', 'standard', 'pro');

-- Premium tier keeps 48 hours as well (was already 48)
UPDATE subscription_limits
SET post_duration_hours = 48
WHERE tier = 'premium';

-- Add comment for clarity
COMMENT ON COLUMN community_posts.expires_at IS 'Post expiry timestamp - default 48 hours from creation';

COMMIT;
