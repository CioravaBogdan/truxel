# Influencer & Promo Code Management System - Technical Specification

## 🤖 AI Agent Prompt
*Copy and paste this prompt to your AI coding assistant to build the Admin Dashboard features:*

> "I need to implement an Influencer Management System in our Admin Dashboard. We already have a `promo_codes` table in Supabase.
>
> **Goal:** Track which influencers generate the most leads and calculate ROI based on their promo code usage.
>
> **Requirements:**
> 1.  **Database:**
>     *   Create a new `influencers` table (name, platform, handle, followers, country, cost, etc.).
>     *   Link `promo_codes` to `influencers`.
>     *   Create a `promo_code_redemptions` table to track who used which code and when.
> 2.  **Admin UI (React/Next.js/Expo):**
>     *   **Influencers List:** Show all influencers with their stats (Total Redemptions, Estimated Revenue, ROI).
>     *   **Add/Edit Influencer:** Form to input details like Cost per Promotion and Social Stats.
>     *   **Promo Code Assignment:** When creating a promo code, allow selecting an Influencer.
> 3.  **Analytics Logic:**
>     *   `ROI %` = ((Revenue Generated - Influencer Cost) / Influencer Cost) * 100.
>     *   `Conversion Rate` = (Purchases / Code Redemptions) * 100.
>
> Please generate the Supabase SQL migrations and the React components for the Admin Dashboard."

---

## 1. Database Schema (Supabase)

### New Table: `influencers`
Stores data about the partners promoting the app.

```sql
create table public.influencers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text,
  platform text not null, -- e.g., 'Instagram', 'TikTok', 'YouTube'
  handle text not null, -- e.g., '@trucker_john'
  followers_count integer,
  country text,
  cost_per_promotion decimal(10,2) default 0, -- How much we paid them
  notes text
);

-- Enable RLS
alter table public.influencers enable row level security;

-- Policy: Only admins can view/edit (assuming you have an admin role or check)
create policy "Admins can manage influencers"
  on public.influencers
  for all
  using (auth.uid() in (select user_id from public.admins)); -- Adjust based on your actual admin auth logic
```

### Update Table: `promo_codes`
Link codes to influencers.

```sql
alter table public.promo_codes 
add column influencer_id uuid references public.influencers(id),
add column usage_limit integer, -- Optional: max times code can be used
add column times_redeemed integer default 0;
```

### New Table: `promo_code_redemptions`
Track every time a user applies a code.

```sql
create table public.promo_code_redemptions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  promo_code text references public.promo_codes(code) not null, -- References the code string directly
  user_id uuid references public.profiles(user_id) not null,
  converted_to_purchase boolean default false, -- To be updated via Webhook later
  revenue_amount decimal(10,2) default 0 -- To be updated via Webhook later
);
```

---

## 2. Business Logic & ROI Calculation

To get the "Return on Investment" (ROI), we need to track two flows:

1.  **Redemption (Lead):** User enters code in the app -> We insert into `promo_code_redemptions`.
2.  **Conversion (Sale):** User actually pays via RevenueCat/Stripe.

### The Flow:
1.  **User enters code:**
    *   App calls Supabase to validate code.
    *   If valid, App inserts record into `promo_code_redemptions`.
    *   App unlocks the RevenueCat Offering.
2.  **User purchases:**
    *   RevenueCat sends a **Webhook** to your backend (Supabase Edge Function).
    *   The Edge Function checks if this `user_id` has a recent entry in `promo_code_redemptions`.
    *   If yes, update `converted_to_purchase = true` and `revenue_amount = price`.

### ROI Formula for Dashboard:
```typescript
const calculateROI = (influencer) => {
  const totalRevenue = influencer.promo_codes.reduce((sum, code) => sum + code.total_revenue, 0);
  const cost = influencer.cost_per_promotion;
  
  if (cost === 0) return 0;
  return ((totalRevenue - cost) / cost) * 100;
}
```

---

## 3. Admin Dashboard Features

### A. Influencer Management Page
*   **Columns:** Name, Platform, Followers, Cost, **Leads Generated** (Redemptions), **Sales** (Conversions), **ROI**.
*   **Sort by:** ROI (High to Low) to see best performers.

### B. Add Influencer Form
*   **Inputs:**
    *   Name (e.g., "Trucker Steve")
    *   Platform (Dropdown: Instagram, TikTok, etc.)
    *   Handle (e.g., "@steve_trucks")
    *   Followers (Number)
    *   Country (Dropdown)
    *   **Promotion Cost** (Currency input) - Critical for ROI.

### C. Promo Code Creation (Enhanced)
*   When creating a code (e.g., `STEVE20`), add a dropdown to select "Trucker Steve" from the `influencers` table.
*   This links the code `STEVE20` to the influencer `Trucker Steve`.

---

## 4. Integration Steps

1.  **Run the SQL Migrations** in Supabase SQL Editor.
2.  **Update `pricing.tsx`**:
    *   When `handleRedeemCode` is successful, trigger an insert to `promo_code_redemptions`.
3.  **Build the Admin Pages** using the prompt above.
