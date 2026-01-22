# Daily Community Post Automation

This system automatically generates fresh content for the Truxel app every day to ensure the "Community" tab looks active.

## 1. How It Works
The automation is built on a **Supabase Edge Function** named `seed-daily-posts`.

### The Logic flow:
1.  **Trigger**: The function is called via HTTP POST (by n8n, cURL, or pg_cron).
2.  **Fetch Bots**: It connects to the `auth.users` / `public.profiles` table and selects users who have an email ending in `@example.com` (to avoid assigning fake posts to real users).
3.  **Generate Content**: 
    - It creates **15 new posts**.
    - It picks random `Origin` and `Destination` cities from a predefined list of US logistics hubs.
    - It generates random metadata (Truck Type: Box Truck, Flatbed, etc.).
    - It sets the post expiration date to 7 days from now.
4.  **Save**: It inserts these posts into the `community_posts` table.

---

## 2. Setup & Deployment

### Prerequisites
- Supabase CLI installed.
- Logged into Supabase (`supabase login`).

### Deploy Command
To update or deploy the function, run this in your terminal:

```bash
supabase functions deploy seed-daily-posts --no-verify-jwt
```

### Environment Variables
This function uses the standard Supabase environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) which are automatically injected by Supabase. No `.env` setup is needed for the function itself.

---

## 3. How to Trigger (n8n / cURL)

You can trigger this function manually or schedule it using n8n.

### cURL Command
Use this command to run the function immediately (e.g., for testing):

```bash
curl -X POST 'https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/seed-daily-posts' \
-H 'Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>' \
-H 'Content-Type: application/json' \
--data '{}'
```

*Note: Replace `<YOUR_SERVICE_ROLE_KEY>` with the `TRUXEL_SUPABASE_SERVICE_ROLE_KEY` from your `.env` file.*

### n8n Setup
1.  Add an **HTTP Request** node.
2.  **Method**: `POST`
3.  **URL**: `https://upxocyomsfhqoflwibwn.supabase.co/functions/v1/seed-daily-posts`
4.  **Authentication**: Header Auth.
    - `Authorization`: `Bearer <YOUR_SERVICE_ROLE_KEY>`
    - `Content-Type`: `application/json`

---

## 4. How to Delete Completely (Cleanup)

If you want to stop the automation and remove all trace of the fake data.

### A. Delete the Function
Remove the function from Supabase Edge Functions:
```bash
supabase functions delete seed-daily-posts
```

### B. Delete the Fake Data
Run these SQL queries in the Supabase SQL Editor.

**⚠️ WARNING: This will delete ALL users with `@example.com` emails and ALL their posts.**

1.  **Delete Users (and their profiles/posts via Cascade)**
    ```sql
    -- This deletes the login users. 
    -- Because of Foreign Keys, it AUTOMATICALLY deletes:
    -- 1. Their row in public.profiles
    -- 2. Their rows in public.community_posts
    delete from auth.users 
    where email like '%@example.com';
    ```

2.  **Verify Removal**
    ```sql
    select count(*) from community_posts; 
    -- Should be significantly lower (only real user posts remaining)
    ```

### C. Remove Scheduler (If using pg_cron)
If you set up the SQL scheduler previously, remove it:
```sql
select cron.unschedule('seed-daily-posts');
```
