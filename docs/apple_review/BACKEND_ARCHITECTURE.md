# Backend Architecture (Supabase + Automations)

This file condenses everything we touched while auditing the backend so an LLM (or human) can jump straight to the right section. Source of truth for schema lives in `supabase/community_setup.sql` and migration files under `supabase/migrations/`. Keep this doc updated whenever tables, functions or automations change.

## 1. Schema Overview

- **Stack**: Supabase Postgres with RLS enabled on every table, auth via `auth.users`, Expo app talks through Supabase JS SDK, Edge Functions cover payments/webhooks.
- **Core Domains**: cities search, community posts + usage limits, interactions/notifications, leads metadata, subscription tiers, profile switches.
- **Key Tables**: `cities`, `community_posts`, `user_post_usage`, `subscription_limits`, `community_interactions`, `notification_log`, `profiles` (extended), `leads` (source tracking).
- **Enums**: `post_type` (`DRIVER_AVAILABLE`, `LOAD_AVAILABLE`) and `post_status` (`active`, `expired`, `cancelled`).

## 2. Tables & Columns

### 2.1 Cities & Search Helpers
- `cities`: stores normalized location data with trigram indexes on `name` + `ascii_name`, population weight, coordinates. Used by `cityService` for fuzzy search + nearest city math.
- Indexes: `cities_name_trgm`, `cities_ascii_trgm`, `cities_country`, `cities_importance` to make search responsive without PostGIS.

### 2.2 Subscription Model
- `subscription_limits`: tier → quota map (`posts_per_month`, `posts_per_day`, `concurrent_active_posts`, `post_duration_hours`, `features` json). Upsert seeds tiers: trial, standard, pro, premium. App side reads to enforce posting caps and to surface UI perks (contact visibility, priority display, analytics tags).
- `user_post_usage`: per-user counters (`posts_this_month`, `posts_today`, `last_post_at`) with rolling reset timestamps. Maintained through helper functions described later.

### 2.3 Community Posting
- `community_posts`: main listing table referencing `auth.users`. Stores origin/destination coords, template metadata (JSON), contact data, expiry and aggregate metrics (`view_count`, `contact_count`). Indexes for status, expiry, user, type, city and `metadata` GIN for template filters.
- Status auto-defaults to `active`, expiry defaults to +24h but tiers can extend via app logic (premium uses 48h).

### 2.4 Engagement + Notifications
- `community_interactions`: deduped log per (`post_id`, `user_id`, `interaction_type`). Interaction types currently `view`, `interested`, `contacted`, `saved`. Trigger helper increments `contact_count` on first `contacted` insert.
- `notification_log`: lightweight audit of pushes/emails sent per user to enforce suppression windows.
- Profile extensions: `community_notifications_enabled`, `notification_radius_km`, `last_known_lat`, `last_known_lng` support geo-triggered alerts.
- Leads table add-ons: `source_type`, `source_id` tie community actions to downstream CRM entries.
### 2.5 Notification Support Tables
- `notification_log` indexes on `(user_id, sent_at DESC)` so `notificationService` can fetch the last sent record quickly when deciding whether to ping again.
- `profiles` columns are RLS-protected (see policies below) and only writable by the owning user; Expo app updates location radius after the user opts in to notifications.

## 3. Functions, Triggers & Policies

### 3.1 Posting Quota Helpers
- `can_user_post(p_user_id uuid) → jsonb`: security definer function called before creating posts. Loads tier from `profiles.subscription_tier` (falls back to `trial`), ensures counters exist in `user_post_usage`, auto-resets monthly/daily values, counts active posts, enforces hard day cap (10). Returns structured JSON consumed by the app to show remaining quota.
- `increment_post_usage(p_user_id uuid)`: bumps counters when a post is confirmed. Only called from trusted supabase function invocation in app flows.

### 3.2 Interaction Helpers
- `increment(table_name, column_name, row_id)`: whitelisted to `community_posts` columns `view_count` or `contact_count`. Guards misuse by raising exceptions on other tables/columns.
- `record_community_interaction(p_user_id, p_post_id, p_interaction_type, p_metadata)`:
  - SECURITY DEFINER with `auth.uid()` checks so users cannot spoof other accounts.
  - Upsert merges metadata and keeps original `created_at`.
  - If newly inserted `contacted`, increments `contact_count`.
  - Returns `{ inserted: boolean }` for UI instrumentation.

### 3.3 Anti-spam & Housekeeping
- `check_duplicate_post(p_user_id, p_origin_city, p_post_type default null)` rejects duplicates in same city + type within 15 minutes.
- `update_updated_at_column()` trigger keeps `updated_at` fresh on `community_posts` and `user_post_usage`.

### 3.4 Row Level Security (summary)
- **community_posts**: authenticated users can see active posts or their own; insert/update/delete limited to owner.
- **cities**: read-only for authenticated users.
- **subscription_limits**: read-only for authenticated users so tiers are visible client-side without service key.
- **user_post_usage**: full CRUD limited to owner (app only reads/writes its row).
- **community_interactions**: everyone can select (for aggregated stats) but can insert/update only their own rows.
- **notification_log**: users can only see their entries.
- Functions `increment` + `record_community_interaction` granted to `authenticated` role to avoid service key usage.
## 4. Edge Functions & Webhooks

| Folder | Purpose | Notes |
| --- | --- | --- |
| `create-checkout-session` | Creates Stripe Checkout session for web flow, returns session URL to Expo web. | Called from `services/stripeService.ts` via Supabase functions client. |
| `manage-subscription` | Portal link for Stripe billing management. | Used for web fallback when RevenueCat portal unavailable. |
| `stripe-redirect` | Handles universal link after Stripe payment to deep-link back into app/browser. | Ensures `redirectTo` respects environment. |
| `stripe-webhook` | Validates Stripe signing secret, syncs subscription status back to Supabase profiles & `user_post_usage` counters. | Critical for keeping tiers in sync when RevenueCat not source of truth. |
| `revenuecat-webhook` | Receives RevenueCat subscriber events, maps offerings to `subscription_tier`. | Aligns mobile-native purchases with Supabase.
| `validate-coupon` | Lightweight endpoint for campaign codes before creating Stripe sessions. | Prevents invalid codes reaching Stripe API. |
| `delete-user-account` | Wipes Supabase auth/profile/leads data and hits n8n for CRM clean up. | Invoked from DeleteAccountModal. |

All functions run in the Supabase Edge runtime (Deno). Config lives under `supabase/functions/<name>/`. Remember to redeploy via `supabase functions deploy <name>` and update `docs/how_it_works/DEPLOY_EDGE_FUNCTIONS.md` when behavior changes.
## 5. Automations & n8n Workflows

- **Location logging webhook**: `cityService.sendLocationToWebhook` posts to the internal n8n endpoint using the fire-and-forget pattern (see `docs/how_it_works/FIRE_AND_FORGET_PATTERN.md`). App never awaits the fetch; errors stay silent because the workflow only enriches analytics (`city_usage_stats`, heatmaps). This keeps modal opening latency under ~200 ms.
- **Support chat workflows**: Refer to `n8n-workflow-support-chat.json` and `docs/how_it_works/N8N_WEBHOOK_GUIDE.md`. Supabase edge functions trigger n8n when user-facing actions need CRM sync (lead creation, deletes) but UI never blocks on those hooks.
- **Stripe / RevenueCat bridges**: Webhooks ultimately call Supabase via service key stored in n8n secrets for fallback reconciliation if Edge Functions throttle out. Make sure `service_role` keys stay confined to n8n vault.
## 6. Data Flow Cheatsheet

1. **Post creation**
   - App calls `can_user_post` → if `can_post=false`, surfaces reason string and blocks.
   - On success, inserts row into `community_posts`, then calls `increment_post_usage` and optionally `record_community_interaction(..., 'interested')` for telemetry.
   - Expiration job currently handled client-side (cron WIP); app sets `expires_at` and background jobs archive expired posts.
2. **Interaction logging**
   - App never writes directly to tables; it invokes `record_community_interaction` RPC with the current `auth.uid()` JWT so RLS stays intact.
   - `increment('community_posts','view_count', postId)` used for low-latency counters without broad table access.
3. **Notifications**
   - `notificationService` polls Supabase for nearby posts, inserts into `notification_log` and updates `profiles.last_known_lat/lng` to tighten future geo queries. Push payload delivered via Expo services (see notifications doc for detail).
4. **Payments**
   - Native purchases go through RevenueCat SDK; web fallback uses Stripe + Edge Functions which update Supabase tiers and, via triggers/n8n, adjust `subscription_limits` usage windows.
5. **Analytics**
   - n8n receives optional telemetry (city usage, deletions, support chat) asynchronously so frontend threads stay responsive.

Keep this sheet synced with `docs/how_it_works/PROJECT_SUMMARY.md` whenever schema or flows evolve, and link back here from new feature specs so contributors know which server pieces already exist.
