# Monetization Guide (RevenueCat + Stripe)

This document explains how paid subscriptions and add-ons work across mobile (RevenueCat-native) and web (Stripe) surfaces. Keep it next to `docs/how_it_works/STRIPE_IMPLEMENTATION_GUIDE.md` for deeper API payloads.

## 1. Architecture Snapshot

- **Primary flow**: Native apps purchase via RevenueCat (StoreKit / Play Billing). Web users or fallback cases use Stripe Checkout powered by Supabase Edge Functions.
- **Entitlements source of truth**: Supabase `profiles.subscription_tier` + `subscription_status`. RevenueCat and Stripe webhooks both write back here so the client can render consistent gates.
- **Search credits**: Subscriptions include bundled searches. Additional packs live in `additional_search_packs` + `transactions` tables and are exposed via `stripeService.getAvailableSearchPacks()`.
- **Edge Functions involved**: `create-checkout-session`, `manage-subscription`, `stripe-redirect`, `stripe-webhook`, `revenuecat-webhook`, `validate-coupon`.

## 2. Environment & Keys

| Purpose | Env var | Location |
| --- | --- | --- |
| Supabase project URL | `TRUXEL_SUPABASE_URL` | consumed in `app.config.js` + Stripe service REST calls |
| Supabase anon key | `TRUXEL_SUPABASE_ANON_KEY` | same as above |
| Stripe publishable key (web) | `TRUXEL_STRIPE_PUBLISHABLE_KEY` | used in Expo web views if needed |
| RevenueCat API keys | `TRUXEL_REVENUECAT_IOS_KEY`, `TRUXEL_REVENUECAT_ANDROID_KEY`, `TRUXEL_REVENUECAT_WEB_KEY`, `TRUXEL_REVENUECAT_WEB_APP_ID` | used inside `services/revenueCatService.ts` |
| n8n webhooks | `TRUXEL_N8N_*` | analytics + notification automations, not user-facing billing |
| Stripe secret + webhook secret | stored in Supabase Edge Function env / Dashboard secrets | never hard-coded |

## 3. RevenueCat Flow (Mobile + Web Billing API)

1. **Initialization**
   - `services/revenueCatService.ts` detects `Platform.OS`.
   - Mobile: ensures `react-native-purchases` is configured (fails fast inside Expo Go). Web: lazily configures `purchases-js` via `revenueCatWebKey`.
2. **Offerings retrieval** (`getOfferings(userId?)`)
   - Detects locale with `expo-localization`, maps to EUR/USD via `autoDetectCurrency`.
   - Fetches RevenueCat offerings, filters packages by detected currency (`rcBillingProduct.currentPrice.currency` on web, `product.currencyCode` on native).
   - Splits results into `subscriptions` vs `searchPacks` (RevenueCat `search_packs` offering) and falls back to all packages if local currency missing.
3. **Purchasing & Restore**
   - `purchasePackage` invokes RevenueCat SDK (web requires `userId`; native requires non-Expo builds). Returns unified `CustomerInfo` which app uses to refresh stores.
   - `restorePurchases` and `getCustomerInfo` follow same platform split.
4. **Entitlement Sync**
   - RevenueCat webhook (`supabase/functions/revenuecat-webhook/`) receives subscriber updates, resolves entitlement → tier mapping (see `docs/how_it_works/APPLE_IAP_COMPLETE_STATUS.md`).
   - Webhook updates `profiles.subscription_tier`, `subscription_status`, and, when applicable, inserts into `transactions` or `search_pack_usage` with service role key.
   - Client polls Supabase via `authStore`/`sessionService` to reflect the change immediately after purchase.

## 4. Stripe Flow (Web Fallback + Cross-Platform Portal)

1. **Product catalog**
   - `stripeService.getAvailableSubscriptionTiers()` + `.getAvailableSearchPacks()` call Supabase REST endpoints (`/rest/v1/subscription_tiers`, `/rest/v1/additional_search_packs`) using anon key because Supabase JS client hung under Expo web.
2. **Coupons**
   - `stripeService.validateCoupon()` hits Edge Function `validate-coupon` with the user JWT. Function checks Stripe promo validity server-side before enabling discount UI.
3. **Checkout sessions**
   - `stripeService.createCheckoutSession()` posts to `create-checkout-session` Edge Function with `priceId`, `type`, optional `couponCode` and embed-friendly success/cancel URLs pointing to `stripe-redirect`.
   - Edge Function creates Stripe Checkout session, stores `user_id` + price info in Supabase so webhook can reconcile after payment.
4. **Post-purchase redirect**
   - Customer lands on `stripe-redirect` Edge Function which renders a simple HTML auto-redirect back to `truxel://` deep link or `/pricing` on web depending on query params.
5. **Subscription management**
   - `stripeService.manage-subscription` (actions `cancel|reactivate|upgrade|downgrade`) calls Edge Function which uses Stripe Billing APIs, then updates Supabase profile rows.
6. **Webhooks**
   - `stripe-webhook` verifies signature, reacts to `checkout.session.completed`, `customer.subscription.updated|deleted`, `invoice.payment_failed`.
   - On success, updates `profiles.subscription_tier/status`, resets `user_post_usage` quotas if needed, writes `transactions` history.

## 5. Data Synchronization Rules

- Supabase is always treated as final source for entitlement gating. Stores read `profiles.subscription_tier`, `subscription_status`, `search_credits_remaining` to render CTAs.
- RevenueCat + Stripe both send events → Supabase; whichever fires last wins, but they use the same tier names (`trial`, `standard`, `pro`, `premium`).
- Usage counters (`user_post_usage`) reset inside `can_user_post` when month/day boundaries hit, regardless of billing provider.
- Additional search packs increase credit counts via RPC `get_total_search_credits` (see `stripeService.getSearchCreditsBreakdown`).

## 6. Testing Matrix

| Scenario | Steps | Expected |
| --- | --- | --- |
| Native RevenueCat purchase | Build via EAS, login, call `purchasePackage` for EUR pack | Edge: RevenueCat receipt → webhook updates profile, app store shows new entitlements |
| Web Stripe subscription | Login on web, start checkout (Stripe) | `stripe-redirect` brings user back, `profiles.subscription_status=active`, `subscription_tier` matches selected plan |
| Coupon validation | Enter code before checkout | `validate-coupon` returns `{ valid: true, coupon }`, discount visible in Checkout summary |
| Upgrade/downgrade via portal | Call `stripeService.upgradeSubscription` | Manage function hits Stripe subscription update, webhook reconciles, UI refresh shows new tier |
| Restore purchases | Native reinstall → `restorePurchases` | RevenueCat returns entitlements, webhook already synced so Supabase row unchanged but client fetch confirms |

## 7. Operational Notes

- Never ship Expo Go builds to testers when validating RevenueCat; SDK requires native runtime.
- Keep Edge Function secrets rotated; do not log Stripe or RevenueCat payloads verbatim (redact PII).
- When adding new tiers/products, update **both**: RevenueCat offerings and Supabase `subscription_limits` / `subscription_tiers` seeds, plus mapping inside `revenuecat-webhook`.
- For platform disputes, Supabase timestamp columns (`transactions.created_at`, `profiles.updated_at`) act as audit trail; include them in support replies.
