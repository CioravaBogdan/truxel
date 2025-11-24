# Influencer & Promo Code Management System - Technical Specification

## 1. System Architecture & Data Flow

### The "Promo Code" Concept
Instead of just a text string, a Promo Code in Truxel acts as a **Key** that unlocks a specific **RevenueCat Offering**.
*   **Standard User:** Sees default Paywall (Standard, Pro, Premium).
*   **Promo User:** Enters "TRUXEL20" -> Unlocks "Special Offer Paywall" (e.g., 20% off monthly).

### Interaction Logic (Step-by-Step)

1.  **User Action (App):**
    *   User goes to `PricingScreen`.
    *   Taps "Have a promo code?" and enters `TRUXEL20`.
    *   App calls Supabase RPC: `redeem_promo_code('TRUXEL20')`.

2.  **Validation (Supabase):**
    *   Database checks table `promo_codes`:
        *   Does code exist?
        *   Is it active?
        *   Is `usage_limit` reached?
    *   **If Valid:** Returns the `revenue_cat_offering_id` (e.g., `offering_promo_20`).
    *   **If Invalid:** Returns error.

3.  **Presentation (App):**
    *   App receives `offering_promo_20`.
    *   App calls RevenueCat: `Purchases.getOfferings()`.
    *   App finds the specific offering `offering_promo_20` and displays *those* packages instead of the default ones.
    *   UI shows: "Special Offer Unlocked: 20% Off Forever!".

4.  **Purchase (RevenueCat):**
    *   User purchases a package from the special offering.
    *   Transaction is processed by Apple/Google.

5.  **Attribution & ROI (Backend):**
    *   **Immediate:** When code is validated (Step 2), Supabase logs an entry in `promo_code_redemptions` (Status: 'applied').
    *   **Delayed (Webhook):** When purchase completes, RevenueCat sends a webhook to Supabase.
    *   Supabase Edge Function matches the webhook `user_id` to the `promo_code_redemptions` table and marks it as `converted_to_purchase = true`.

---

## 2. Database Schema (Supabase)

### A. Table: `influencers` (New)
*Stores the partners who promote the app.*

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `name` | `text` | Internal name (e.g., "Trucker Steve") |
| `handle` | `text` | Social handle (e.g., "@steve_trucks") |
| `platform` | `text` | Source (Instagram, TikTok, YouTube, Email) |
| `cost_per_promotion` | `decimal` | Fixed cost we paid (e.g., 500.00) |
| `status` | `text` | 'active', 'paused' |
| `created_at` | `timestamptz` | Creation date |

### B. Table: `promo_codes` (Update Existing)
*Links a text code to an influencer and a RevenueCat Offering.*

| Column | Type | Description |
| :--- | :--- | :--- |
| `code` | `text` | **Primary Key**. The code user types (e.g., "STEVE20"). |
| `influencer_id` | `uuid` | FK to `influencers.id`. |
| `offering_id` | `text` | **CRITICAL**. The Offering ID from RevenueCat dashboard. |
| `description` | `text` | User-facing text (e.g., "20% Off Monthly Plan"). |
| `usage_limit` | `int` | Max total uses (optional). |
| `times_redeemed` | `int` | Counter (Default: 0). |
| `active` | `boolean` | Master switch (Default: true). |

### C. Table: `promo_code_redemptions` (New)
*Tracks the funnel: Code Entered -> Purchase Made.*

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key. |
| `promo_code` | `text` | FK to `promo_codes.code`. |
| `user_id` | `uuid` | FK to `auth.users` or `profiles`. |
| `applied_at` | `timestamptz` | When they entered the code. |
| `converted_to_purchase` | `boolean` | True if they bought something later. |
| `revenue_amount` | `decimal` | The actual $ amount generated. |

---

## 3. Implementation Steps

### Step 1: Create Tables (SQL Migration)
Run this in Supabase SQL Editor:

```sql
-- 1. Create Influencers
create table public.influencers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  handle text,
  platform text,
  cost_per_promotion decimal(10,2) default 0,
  status text default 'active'
);

-- 2. Create/Update Promo Codes
-- (Assuming table exists, if not create it similar to below)
create table if not exists public.promo_codes (
  code text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.promo_codes 
add column if not exists influencer_id uuid references public.influencers(id),
add column if not exists revenue_cat_offering_id text, -- e.g. 'offering_steve_20'
add column if not exists description text,
add column if not exists usage_limit integer,
add column if not exists times_redeemed integer default 0,
add column if not exists is_active boolean default true;

-- 3. Create Redemptions
create table public.promo_code_redemptions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  promo_code text references public.promo_codes(code),
  user_id uuid references auth.users(id),
  converted_to_purchase boolean default false,
  revenue_amount decimal(10,2) default 0
);

-- 4. Enable RLS
alter table public.influencers enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_code_redemptions enable row level security;

-- 5. Policies (Public can read codes, Admins can do all)
create policy "Public read codes" on public.promo_codes for select using (true);
create policy "Public insert redemptions" on public.promo_code_redemptions for insert with check (auth.uid() = user_id);
```

### Step 2: Create the RPC Function (Backend Logic)
This function is what the App calls to validate the code.

```sql
create or replace function redeem_promo_code(code_input text)
returns json
language plpgsql
security definer
as $$
declare
  promo_record record;
begin
  -- 1. Find Code
  select * into promo_record from public.promo_codes where code = code_input;
  
  -- 2. Validate
  if promo_record is null then
    return json_build_object('valid', false, 'message', 'Invalid code');
  end if;
  
  if promo_record.active = false then
    return json_build_object('valid', false, 'message', 'Code expired');
  end if;

  if promo_record.usage_limit is not null and promo_record.times_redeemed >= promo_record.usage_limit then
     return json_build_object('valid', false, 'message', 'Usage limit reached');
  end if;

  -- 3. Log Redemption (Attempt)
  insert into public.promo_code_redemptions (promo_code, user_id)
  values (code_input, auth.uid());

  -- 4. Increment Counter
  update public.promo_codes set times_redeemed = times_redeemed + 1 where code = code_input;

  -- 5. Return Offering ID
  return json_build_object(
    'valid', true, 
    'offering_id', promo_record.offering_id,
    'description', promo_record.description
  );
end;
$$;
```

### Step 3: Admin Dashboard (Next Steps)
Use the AI Prompt below to generate the Admin UI components.

## 🤖 AI Agent Prompt
*Copy and paste this prompt to your AI coding assistant to build the Admin Dashboard features:*

> "I need to implement an Influencer Management System in our Admin Dashboard.
>
> **Goal:** Track which influencers generate the most leads and calculate ROI based on their promo code usage.
>
> **Requirements:**
> 1.  **Database:**
>     *   Use the `influencers`, `promo_codes`, and `promo_code_redemptions` tables defined in the spec.
> 2.  **Admin UI (React/Next.js/Expo):**
>     *   **Influencers List:** Show all influencers with their stats (Total Redemptions, Estimated Revenue, ROI).
>     *   **Add/Edit Influencer:** Form to input details like Cost per Promotion and Social Stats.
>     *   **Promo Code Assignment:** When creating a promo code, allow selecting an Influencer.
> 3.  **Analytics Logic:**
>     *   `ROI %` = ((Revenue Generated - Influencer Cost) / Influencer Cost) * 100.
>     *   `Conversion Rate` = (Purchases / Code Redemptions) * 100.
>
> Please generate the React components for the Admin Dashboard."
