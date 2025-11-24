# Truxel - Technical Documentation: Coupons & Discounts System

## 1. Overview & Strategy
Truxel uses a **Hybrid Discount Strategy** to handle the technical differences between Web (Stripe) and Mobile (App Stores), while maintaining a unified experience for the user and a simple workflow for Admins.

### The Core Problem
- **Web (Stripe):** Supports dynamic "Coupons" that can be applied at runtime (e.g., "20% off for 3 months").
- **Mobile (Apple/Google):** Does **NOT** support dynamic coupons. Discounts must be pre-configured as "Introductory Offers" inside specific Products.

### The Solution: "Unified Code, Divergent Execution"
1. **Admin/Influencer:** Distributes a single code (e.g., `TRUXEL20`).
2. **Database:** The code maps to *both* a Stripe Coupon ID (for Web) and a RevenueCat Offering ID (for Mobile).
3. **App Logic:** Detects the platform and executes the appropriate redemption flow.

---

## 2. Architecture & Database

### Database Schema (`public.promo_codes`)
The `promo_codes` table is the central registry.

| Column | Type | Description |
| :--- | :--- | :--- |
| `code` | `text` | The string user types (e.g., `TRUXEL20`). PK. |
| `stripe_coupon_id` | `text` | ID of the Coupon in Stripe Dashboard (e.g., `INFLUENCER_3MONTHS`). Used for **Web**. |
| `offering_id` | `text` | ID of the Offering in RevenueCat (e.g., `influencer_special`). Used for **Mobile**. |
| `influencer_id` | `uuid` | Link to `influencers` table for tracking. |
| `active` | `bool` | Master switch to enable/disable. |

### Supabase RPC: `redeem_promo_code`
A secure PostgreSQL function called by the frontend to validate codes.
- **Input:** `code_lookup` (string)
- **Output:** JSON object containing:
  - `valid` (boolean)
  - `offering_id` (for Mobile/RevenueCat override)
  - `stripe_coupon_id` (for Web/Stripe application)
  - `tracking_id` (for analytics)

---

## 3. Web Implementation (Stripe)

### Mechanism: Customer-Level Coupons
Since RevenueCat Web Billing manages the Checkout Session, we cannot easily inject a coupon code into the session creation client-side. Instead, we apply the coupon to the **Stripe Customer Object** *before* the checkout starts.

### Workflow
1. **User** enters code `TRUXEL20` in `pricing.tsx`.
2. **Frontend** calls `rpc('redeem_promo_code')`.
3. **Database** returns `stripe_coupon_id: 'INFLUENCER_3MONTHS'`.
4. **Frontend** (if Web) calls Edge Function: `supabase.functions.invoke('apply-coupon')`.
5. **Edge Function (`apply-coupon`)**:
   - Initializes Stripe SDK.
   - Retrieves the user's Stripe Customer ID from `auth.users` (or creates one).
   - Updates the Stripe Customer: `stripe.customers.update(id, { coupon: 'INFLUENCER_3MONTHS' })`.
6. **Frontend** proceeds to `purchaseRevenueCatPackage()`.
7. **Stripe Checkout** detects the customer-level coupon and automatically applies the 20% discount to the subscription invoice.

### Key Files
- `supabase/functions/apply-coupon/index.ts`: Backend logic to talk to Stripe API.
- `app/(tabs)/pricing.tsx`: Frontend logic to orchestrate the redemption.

---

## 4. Mobile Implementation (iOS & Android)

### Mechanism: RevenueCat Offerings & Store Intro Offers
Mobile stores require discounts to be baked into the product. We use RevenueCat's **Offerings** system to swap the displayed products.

### Workflow
1. **User** enters code `TRUXEL20` in `pricing.tsx`.
2. **Frontend** calls `rpc('redeem_promo_code')`.
3. **Database** returns `offering_id: 'influencer_special'`.
4. **Frontend** calls `RevenueCat.getOfferings()`.
5. **Frontend** manually selects the offering returned by the DB (instead of the default 'current').
6. **UI** updates to show the products contained in the `influencer_special` offering.
   - *Crucial:* These products (e.g., `truxel_pro_monthly_intro`) must be configured in App Store Connect / Google Play Console with an **Introductory Offer** (e.g., "Pay $39.99 for 3 months, then $49.99").
7. **User** purchases. The Store handles the billing logic.

### Configuration Requirements
- **App Store Connect:** Create a new subscription price point with an "Introductory Offer".
- **Google Play Console:** Create a new "Introductory Price" for the base plan.
- **RevenueCat:** Create a new Offering (`influencer_special`) and attach these specific products.

---

## 5. Future Work & Pending Tasks

### ✅ Completed
- [x] **Database:** Schema updated with `stripe_coupon_id`.
- [x] **Backend:** `apply-coupon` Edge Function created and deployed.
- [x] **Web Frontend:** Logic to call Edge Function and apply coupon implemented.
- [x] **Stripe:** Coupon `INFLUENCER_3MONTHS` created.

### ⏳ To Do (Critical for Launch)

#### 1. Android Configuration (Google Play Console)
- **Task:** Create Introductory Offers for your subscription products.
- **Details:**
  - Go to Monetization > Products > Subscriptions.
  - Select `truxel_standard_monthly` (and Pro/Fleet).
  - Add an **Offer**: "20% off for 3 months".
  - **Important:** Ensure the Offer ID matches what you expect or simply rely on the fact that if the user is eligible, Google applies it. *Better approach:* Create a separate Product ID if you want to force it via a specific Offering, OR just rely on the standard product having an available offer.
  - *Recommended Strategy:* Create a distinct Product ID (e.g., `truxel_pro_influencer`) that is **only** available in the `influencer_special` RevenueCat offering, which has the Intro Price configured as the default behavior or a specific offer.

#### 2. iOS Configuration (App Store Connect)
- **Task:** Configure Introductory Offers.
- **Details:**
  - Select the Subscription Group.
  - Select the Product.
  - Add "Introductory Offer": Pay as you go, 3 months, specific price.

#### 3. RevenueCat Configuration
- **Task:** Create the `influencer_special` Offering.
- **Details:**
  - Dashboard > Offerings > New Offering.
  - Identifier: `influencer_special`.
  - Attach the products that have the Intro Offers configured.

#### 4. Testing
- **Web:** Verify Stripe Checkout shows the crossed-out price.
- **Mobile:** Verify the native purchase sheet shows the introductory terms (e.g., "3 months for $X, then $Y").

---

## 6. Summary for Admin
To create a new Influencer Campaign:
1. **Stripe:** Ensure `INFLUENCER_3MONTHS` coupon exists.
2. **RevenueCat:** Ensure `influencer_special` Offering exists.
3. **Supabase (Admin):** Insert row into `promo_codes`:
   - Code: `NEW_INFLUENCER_NAME`
   - Stripe Coupon: `INFLUENCER_3MONTHS`
   - Offering ID: `influencer_special`
