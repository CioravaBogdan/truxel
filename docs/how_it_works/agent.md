# Truxel Agent Notes

> Treat the product as **Truxel** everywhere. Keep these notes aligned with the Truxel naming used across the rest of the docs.

---

## Product Identity and Value Props
- `TRUXEL_MARKETING.md` defines the narrative: three pillars (Smart Company Search, Lead Management OS, Real-Time Community) built to help drivers "never drive empty again". It quotes concrete benefits (fill 30-40% more empty trips, find return loads 15x faster than freight boards, save roughly EUR 800-1,200 per month in broker fees), so reuse those metrics in onboarding copy and sales decks.
- Community vision docs (`COMMUNITY_FEATURE_FINAL_PLAN.md`, `COMMUNITY_FEATURE_IMPLEMENTATION_PLAN.md`) set KPIs: post in <3 seconds via templates, feed loads in <2 seconds, TTL 4-24h, GPS auto-detection, Supabase realtime updates, and subscription-tier posting limits. Keep those targets in mind when touching community state/services.
- TODO.md drives the roadmap. Phase 4 (profile UX) is marked "In Progress". Phases 5-8 cover default industry search, richer n8n payloads, lead detail upgrades, and purchase validation. Future backlog spans notifications, lead filters, map view, analytics, referral program, and automated tests.

---

## Stack and Tooling
- Expo Router + React Native 0.81 / Expo SDK 54, TypeScript, ESLint/Prettier, Zustand stores.
- Supabase for auth, database tables (profiles, leads, user_leads, searches, subscription_tiers, additional_search_packs, transactions, community_*), RPC helpers (`get_total_search_credits`, `consume_search_credit`, `can_user_post`, `increment_post_usage`, etc.), Storage, and Realtime.
- RevenueCat (react-native-purchases native, purchases-js web) is the main billing layer; Stripe + Supabase Edge Functions remain for fallback (web checkout, coupons, packs).
- Expo modules (Location, Notifications, Apple Auth, SecureStore, WebBrowser) must go through `utils/safeNativeModules.ts` to avoid crashy native calls.
- n8n handles automation (search webhook, city telemetry, chat/support escalations).

---

## Codebase Landmarks
- `app/` -- Expo Router routes. `(auth)` holds login/register. `(tabs)` hosts authenticated screens (home, search, leads, community, profile, pricing). `(web)` hosts marketing pages (landing, pricing, terms, privacy, refund, contact). `+not-found` is the fallback.
- `components/` -- Shared UI plus feature-specific widgets (community QuickPostBar/PostCard/CitySearchModal, leads LeadDetailModal, ChatSupportModal).
- `services/` -- Auth, searches, leads, stripe, revenuecat, community, city, notification, session, native modules, oauth, chat/support.
- `store/` -- Zustand slices (authStore, leadsStore, communityStore, searchesStore). Follow guidance in `leadsStore.ts` to avoid destructuring setters used outside of React renders.
- `lib/` -- Supabase client (SecureStore/localStorage aware), i18n bootstrap, RevenueCat helper, theming.
- `hooks/` -- Framework readiness + GPS/geo hook.
- `utils/` -- `safeNativeModules.ts` plus helpers for distance/currency detection.
- `supabase/` -- SQL migrations, RPC definitions, Edge Functions (`create-checkout-session`, `manage-subscription`, `revenuecat-webhook`, `stripe-webhook`, `validate-coupon`, etc.).
- `.md knowledge base` -- Keep this agent file in sync with README, TODO, TRUXEL_MARKETING, community plans, App Store / RevenueCat setup guides, Stripe mapping docs, etc.

---

## Feature and Flow Highlights

### App bootstrap and auth
- `app/_layout.tsx` waits for `nativeModulesService.initialize()` before mounting navigation. Once the bridge is ready, it subscribes to `authService.onAuthStateChange`, fetches/creates the profile through REST (`authService.getProfile`), and spins up `sessionService.start()` (5-minute refresh loop) plus `notificationService.initialize()` (permissions, Expo push token, 7-minute polling).
- Logout tears down the services, clears profile/session, and resets i18n to English.

### Smart company search and credits
- `app/(tabs)/search.tsx` uses `useLocation` (safe wrappers) for GPS, enforces 1-5 keywords (or quick search with `profile.preferred_industries`), and pushes toast notifications for state changes.
- `services/searchesService.ts` checks credits via `get_total_search_credits`, burns one via `consume_search_credit`, writes the `searches` row, and POSTs to the `TRUXEL_N8N_SEARCH_WEBHOOK`. If the webhook fails, it flips the row to `failed` so the UI surfaces the error and credits can be reconciled manually. Supabase Realtime pushes updates back to the screen; when a search finishes, we schedule a local notification via `safeScheduleNotification`.

### Lead CRM
- `services/leadsService.ts` fronts the `user_leads` junction table for per-user metadata, prevents duplicates, supports `convertPostToLead` for community posts, and exports CSV data.
- `app/(tabs)/leads.tsx` offers three tabs (search results, Hot Leads saved from community, and My Book conversions), reusing `cityService` filters. Lead interactions always flow through `safeOpenWhatsApp`, `safeOpenEmail`, `safeOpenPhone` with localized templates defined in translations so messaging is consistent.

### Community system
- `components/community/CommunityFeed.tsx` + `store/communityStore.ts` coordinate feed state (availability, routes, saved posts), filters, pagination, and stats. On mount, `cityService.getCurrentLocationCity()` seeds filters with GPS.
- `services/communityService.ts` enforces subscription limits via RPCs (`can_user_post`, `increment_post_usage`), deduplicates spam via `check_duplicate_post`, keeps TTL under control, exposes stats, and converts posts to leads.
- Quick posting uses template buttons (6 templates called out in TRUXEL_MARKETING) and GPS autofill to hit the <3 second KPI described in the community plan docs.

### Pricing and monetization
- `app/(tabs)/pricing.tsx` prefers RevenueCat offerings (`services/revenueCatService.ts`). Expo Go cannot use native RevenueCat, so Stripe fallback logic stays for dev/testing or the (web) surface.
- `services/stripeService.ts` calls Supabase REST to list tiers/packs (anon-safe), handles coupon validation via the `validate-coupon` Edge Function, and proxies subscription management actions to `manage-subscription`.
- `app.config.js` carries `TRUXEL_REVENUECAT_{IOS,ANDROID,WEB}_KEY` entries. The RevenueCat migration is fully described in `IMPLEMENTARE_REVENUECAT.md`, including the entitlements to Supabase mapping, webhook sync, and compliance reasons (Apple Guideline 3.1.1). `APP_STORE_CONNECT_SETUP.md` details how to create the `Truxel Subscriptions` group and the product IDs (`truxel_2999_1month`, `truxel_4999_1month`, etc.) plus a 25-search credit IAP.

### Profile and preferences
- `app/(tabs)/profile.tsx` handles identity/company info, truck type, preferred distance unit (drives radius options via `getRadiusOptions`), industry multi-select, avatar uploads (Supabase Storage), phone numbers (country dial codes), and preferred language (switches i18n). TODO Phase 4 tracks outstanding UX tasks (radius selector, profile save pipeline).

### Notifications and telemetry
- `services/notificationService.ts` polls every 7 minutes for community posts matching `profiles.last_known_city`, schedules local notifications via safe wrappers, and stores last-check timestamps in AsyncStorage. It also uploads Expo push tokens to Supabase.
- `services/cityService.ts` caches city lookups, keeps recent cities in AsyncStorage, performs GPS reverse geocode, and sends anonymized telemetry to `TRUXEL_N8N_CITY_WEBHOOK` ("fire-and-forget") for analytics.

### Support channels
- `components/ChatSupportModal.tsx` + `services/supportChatService.ts` combine Supabase conversations/messages with Realtime updates. `services/chatService.ts` posts user requests to the n8n chat webhook for AI-assisted replies while templates come from translations.

### Web bundle
- The `(web)` route group exposes static marketing pages. They reuse translations/components, so shared UI changes affect both the native experience and the public marketing site.

---

## Doc Library Cheat Sheet
- `README.md` -- Base overview.
- `TRUXEL_MARKETING.md` -- Messaging bible, ROI calculator, testimonials, onboarding checklist, support contacts, launch promo code.
- `COMMUNITY_FEATURE_FINAL_PLAN.md` / `COMMUNITY_FEATURE_IMPLEMENTATION_PLAN.md` -- Detailed architecture, UX, limits, and rollout for the realtime community feature.
- `COMMUNITY_FEATURE_SETUP.md`, `COMMUNITY_FILTER_IMPLEMENTATION_STATUS.md` -- Step-by-step setup and progress trackers for community workstreams.
- `TODO.md` -- Roadmap phases, backlog, metrics, reminders, setup instructions.
- `APP_STORE_CONNECT_SETUP.md`, `APPLE_IAP_COMPLETE_STATUS.md` -- iOS IAP product creation, subscription group reviews, QA checklists.
- `IMPLEMENTARE_REVENUECAT.md`, `STRIPE_PRICE_IDS_MAPPING.md`, `APPLE_IAP_COMPLETE_STATUS.md` -- RevenueCat migration plan, ID mapping tables, compliance status.
- `TRUXEL_MARKETING.md`, `TRUXEL_MARKETING_*` docs -- Marketing collateral and funnels.
- `TRUXEL_MARKETING.md` plus `TRUXEL_MARKETING` add-ons -- Use cases, support copy, testimonials, ROI math.
- Additional docs (e.g., `APPLE_IAP_COMPLETE_STATUS`, `STRIPE_PRICE_IDS_MAPPING`, `PRODUCTS_MAPPING_COMPLETE.md`) verify product IDs across stores and services.

---

## Operations, Environment, and Workflow
- Required env vars live in `.env` and `app.config.js`: `TRUXEL_SUPABASE_URL`, `TRUXEL_SUPABASE_ANON_KEY`, `TRUXEL_STRIPE_PUBLISHABLE_KEY`, `TRUXEL_REVENUECAT_{IOS,ANDROID,WEB}_KEY`, `TRUXEL_REVENUECAT_WEB_APP_ID`, `TRUXEL_N8N_{SEARCH,CITY,CHAT}_WEBHOOK`.
- Commands: `npm install`, `npm run dev` (Expo), `npm run android` / `npm run ios`, `npm run typecheck`, `expo start -c` after env changes. Supabase migrations via `npx supabase db push`; regenerate TS types with `npx supabase gen types typescript --local > types/database.types.ts`.
- Workflow from TODO.md: branch off main, implement with incremental commits, test on a physical iOS device (Expo Go lacks Apple Sign-In/RevenueCat), update TODO.md, merge, deploy edge functions if relevant.

---

## Gotchas and Reminders
- Always route Linking, WhatsApp, phone, email, notifications, GPS, and permissions through `safeNativeModules.ts`. Previous TestFlight crashes were tied to raw `Linking.openURL`.
- RevenueCat and Apple Sign-In do not work in Expo Go. Use dev/EAS builds for purchase/auth QA.
- Search credits are consumed before the webhook runs. On webhook failure, update the `searches` row to `failed` and follow up so credits can be restored.
- `notificationService` requires `profiles.last_known_city`; make sure profile updates record location once search/location flows succeed.
- Community and leads share location filters. Keep `cityService` caches accurate and avoid destructuring Zustand actions that you later call outside of render (prevents stale closures).
- README, marketing, and code should all say "Truxel". Flag any new stray references for cleanup.
