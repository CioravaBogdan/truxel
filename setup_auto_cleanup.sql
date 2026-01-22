-- Enable pg_cron if not enabled (you probably already have it)
create extension if not exists pg_cron;

-- Schedule automatic cleanup of expired posts
-- Runs every hour (at minute 0)
select cron.schedule(
  'cleanup-expired-posts', -- Job Name
  '0 * * * *',             -- Cron schedule (Every hour)
  $$
    delete from community_posts 
    where expires_at < now();
  $$
);

-- Check running jobs
select * from cron.job;
