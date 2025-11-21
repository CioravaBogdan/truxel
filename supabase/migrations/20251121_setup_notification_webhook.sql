-- Enable the pg_net extension to allow making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a trigger to call the Edge Function on INSERT
-- Note: You need to replace FUNCTION_URL and SERVICE_ROLE_KEY with actual values
-- This is usually done via the Dashboard > Database > Webhooks, but here is the SQL approach if supported.

-- BETTER APPROACH: Use Supabase Dashboard Webhooks
-- 1. Go to Database > Webhooks
-- 2. Create a new webhook
-- 3. Name: "notify-users-on-post"
-- 4. Table: public.community_posts
-- 5. Events: INSERT
-- 6. Type: HTTP Request
-- 7. URL: https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/notify-users
-- 8. Method: POST
-- 9. HTTP Headers: 
--    Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]
--    Content-Type: application/json

-- Since we cannot easily deploy this via migration without the URL/Key, 
-- we will provide this as an instruction file.
