-- Enable pg_cron and pg_net extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule the daily post generation job (Every day at midnight)
-- REPLACE <YOUR_SERVICE_ROLE_KEY> with your actual Supabase Service Role Key (from Project Settings > API)
select cron.schedule(
  'seed-daily-posts',
  '0 0 * * *',
  $$
  select
    net.http_post(
        url:='https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/seed-daily-posts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9jeW9tc2ZocW9mbHdpYnduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA1MTIzMiwiZXhwIjoyMDc2NjI3MjMyfQ.tDMvQ5_k-er1ctn5zozFlylkRKBzzR966G9BIsKbq_Q"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Check if the job is scheduled
select * from cron.job;
