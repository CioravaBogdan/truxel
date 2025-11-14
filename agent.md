# Agent Notes

## Stack & Tooling
- Expo Router + React Native 0.81 on top of Expo SDK 54, TypeScript, ESLint/Prettier, and Zustand stores
- Supabase handles auth, row-level data, storage, Realtime, RPC helpers (consume_search_credit, get_total_search_credits, can_user_post, etc.)
- RevenueCat (react-native-purchases on native, purchases-js on web) is the primary billing surface; Supabase Edge Functions + Stripe serve as fallback checkout/search packs
- Expo modules (Location, Notifications, Apple Auth, SecureStore, WebBrowser) plus safeNativeModules.ts wrappers prevent crashes and coordinate permission flows
- n8n automations: search webhook, location logging, and chat/support escalations

## Directory Hints
- app/ — Expo Router routes; (auth) for login/register, (tabs) for core screens, (web) for marketing/static content, +not-found fallback
- components/ — shared UI (Button, Input, Card), community widgets (QuickPostBar, CitySearchModal, PostCard), leads modals, ChatSupportModal
- services/ — all remote/domain logic (authService, searchesService, leadsService, communityService, stripeService, revenueCatService, notificationService, cityService, oauthService, supportChatService, chatService)
- store/ — Zustand slices for auth, leads, searches, and the community feed (filters, pagination, stats)
- lib/ — platform clients (supabase wrapper with SecureStore/localStorage, i18n bootstrapping, revenueCat helper, theming)
- hooks/ — platform-safe helpers like useLocation/useFrameworkReady
- utils/ — shared utilities (distance + currency auto-detection, safeNativeModules wrappers)
- supabase/ — SQL migrations, RPC definitions, and Edge Functions (create-checkout-session, manage-subscription, revenuecat-webhook, stripe endpoints, validate-coupon)

## Key Flows & Screens
### App bootstrap & auth
- Root layout (app/_layout.tsx) waits for nativeModulesService to finish, conditionally brings up RevenueCat, and wires authService.onAuthStateChange to hydrate useAuthStore
- Profiles are fetched via REST calls (authService.getProfile) with fallbacks that auto-create a profile entry if missing; sessionService + notificationService kick off once logged in
- Login/register screens wrap Supabase auth and optional Apple/Google flows (oauthService), including deep link handling

### Location search & credits
- Search screen (app/(tabs)/search.tsx) collects keywords, handles quick-search templates from profile industries, and records GPS via useLocation safe wrappers
- searchesService hits RPCs to confirm/consume credits, writes a search record, then POSTs payloads to an n8n webhook; subscribeToSearchUpdates wires Supabase Realtime status pushes and toast/notification feedback

### Lead management
- leadsService abstracts the user_leads junction table, duplicate detection, conversion from community posts, and CSV exports
- Leads tab (app/(tabs)/leads.tsx) shares filters with community (country/city) and toggles between search results, hot (saved) posts, and My Book conversions via useLeadsStore
- LeadDetailModal centralizes contact actions by calling safeOpenWhatsApp/email/phone with translated templates, and exposes "convert to My Book" for community leads

### Community feed & quick posting
- CommunityFeed component drives the availability/routes/saved tabs, uses cityService for GPS defaults, and keeps pagination/infinite scroll state in useCommunityStore
- communityService wraps RPCs for posting limits, duplicate detection, saved posts, stats, conversions, and Supabase channel updates
- QuickPostBar/TemplateSelector components build structured posts tied to translation keys instead of hardcoded text

### Payments & subscriptions
- Pricing screen (app/(tabs)/pricing.tsx) prefers RevenueCat offerings via revenueCatService (mobile/web) and falls back to Stripe-based Supabase functions (stripeService) for coupons, upgrades, packs, and history
- RevenueCat keys live in app.config.js extra (TRUXEL_REVENUECAT_*); Expo Go is explicitly blocked because native SDKs need dev/EAS builds
- Supabase functions (create-checkout-session, manage-subscription, validate-coupon, revenuecat-webhook) synchronize Stripe/RevenueCat events back into profiles + transactions tables

### Profile & personalization
- Profile screen lets users edit identity/company fields, truck type, industries, search radius/distance units, and preferred language (ties into i18n changeLanguage)
- Avatar uploads use Expo ImagePicker + Supabase Storage, while phone number inputs split country dialing info for validation

### Notifications & background services
- notificationService polls for nearby community loads every ~7 minutes, matching cities against profile.last_known_city and firing safeScheduleNotification alerts
- nativeModulesService centralizes initialization order so push/location/Stripe dependencies do not crash the bridge; sessionService silently refreshes Supabase sessions every 5 minutes

### Support & automation
- ChatSupportModal combines live Supabase conversations (supportChatService) with n8n-triggered AI responses (chatService) and quick templates keyed in locales
- cityService also reports anonymized telemetry to an n8n webhook for future analytics

### Web marketing bundle
- app/(web) houses Expo Router pages for marketing (landing, pricing, terms, cookies, etc.) that reuse the same translation + component primitives

## Integrations & Data Contracts
- Supabase tables of interest: profiles, leads, user_leads, searches, subscription_tiers, additional_search_packs, transactions, community_posts, community_post_saves, community_interactions, support_conversations/messages, cities
- RPC helpers: get_total_search_credits, consume_search_credit, can_user_post, increment_post_usage, check_duplicate_post, increment
- External webhooks: TRUXEL_N8N_SEARCH_WEBHOOK, TRUXEL_N8N_CITY_WEBHOOK, TRUXEL_N8N_CHAT_WEBHOOK; RevenueCat webhooks map entitlements to subscription tiers/search credits

## Environment & Commands
- .env/app.config.js expect TRUXEL_SUPABASE_URL, TRUXEL_SUPABASE_ANON_KEY, TRUXEL_STRIPE_PUBLISHABLE_KEY, TRUXEL_REVENUECAT_{IOS,ANDROID,WEB}_KEY, TRUXEL_REVENUECAT_WEB_APP_ID, TRUXEL_N8N_* URLs
- Run npm install then npm run dev (expo start) for development; npm run android/ios create local builds, npm run typecheck for TS validation, expo start -c to clear caches
- Supabase CLI migrations live under supabase/migrations; Edge Functions are JS/TS projects deployed with supabase functions deploy

## Gotchas / Reminders
- Always use safeNativeModules wrappers for Linking, WhatsApp, phone, email, Notifications, and Location APIs to avoid TestFlight crashes
- RevenueCat + Apple Sign-In fail inside Expo Go; rely on dev/EAS builds before testing purchases or Apple auth
- Search credits are decremented immediately via RPC; handle webhook failures by updating the searches row to failed so the UI can surface errors
- Leads converted from community posts should call leadsService.isDuplicateLead before inserts or the UI will surface DUPLICATE_LEAD errors
- Notification polling requires profile.last_known_city to be populated (update via location capture on the profile/search flows)
- Community filters share state with leads; keep cityService caches in sync and avoid destructuring Zustand actions you plan to call imperatively
