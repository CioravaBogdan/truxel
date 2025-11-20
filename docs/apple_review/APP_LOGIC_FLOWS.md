# App Logic Flows & Service Map

This is the high-level wiring diagram for Expo Router + Zustand + service layer. Use it alongside `docs/how_it_works/PROJECT_SUMMARY.md` when onboarding.

## 1. Shell & Navigation

- **Entry point**: `app/_layout.tsx` mounts the root `Stack` with `(auth)`, `(tabs)`, `(web)` groups. Routing decisions happen inside a `useEffect` that watches auth state + current segments.
- **Framework readiness**: `useFrameworkReady()` blocks rendering until Expo Router + fonts are initialized.
- **Native modules first**: `nativeModulesService.initialize()` runs before anything else to avoid the iOS TurboModule crash documented in `docs/archive/IOS_CRASH_FIX_DEFENSIVE_INITIALIZATION.md`.
- **RevenueCat gating**: After native modules resolve, layout decides whether to configure `react-native-purchases` (native builds only) or mark web SDK as ready for lazy init.
- **Auth listener**: `authService.onAuthStateChange` updates `authStore` and kicks off downstream services (session refresh + notifications). Logout tears them down and resets i18n to English.

## 2. Global State (Zustand Stores)

| Store | File | Responsibilities |
| --- | --- | --- |
| `useAuthStore` | `store/authStore.ts` | Tracks session, user, profile, loading flags. Provides `isAuthenticated` for navigation guard. |
| `useCommunityStore` | `store/communityStore.ts` | Holds feed data, filters, quotas, saved posts, creation modal states. Wraps `communityService` methods and ensures arrays emit new references (see bookmark bug postmortem). |
| `useLeadsStore` | `store/leadsStore.ts` | Manages saved leads, filters, pagination for CRM exports. Tightly coupled with `leadsService.ts`. |
| `useSearchesStore` | `store/searchesStore.ts` | Stores advanced search templates and handles credit consumption logic. |

**Patterns**
- All stores expose async actions that delegate to services (no direct Supabase calls from components).
- Stores avoid side effects during initialization; services return plain data, then stores update arrays to avoid Zustand subscription pitfalls.
- When writing new stores, follow the same shape: declare initial state object, use `create<StoreType>`, keep `set`/`get` usage localized.

## 3. Service Layer

### 3.1 Auth & Session
- `authService`: wraps Supabase auth calls (login/register/reset) and exposes `getProfile` which merges auth user data with `profiles` table extras.
- `sessionService`: singleton interval that refreshes Supabase JWT every 5 minutes and writes the new session back into `authStore`.

### 3.2 Community & Leads
- `communityService`: handles search filters, `canUserPost` RPC, CRUD for posts, interactions via `record_community_interaction`, and stats aggregations.
- `leadsService`: persists saved posts/leads into `leads` table, also used when converting community posts to CRM entries.
- `cityService`: powers QuickPost location features, caches search results, and sends location telemetry to n8n (fire-and-forget).

### 3.3 Payments & Entitlements
- `revenueCatService`: abstracts RevenueCat SDK differences (native vs web). Only called after `nativeModulesService` marks ready.
- `stripeService`: uses Supabase Edge Functions for checkout sessions, coupon validation, and subscription management.

### 3.4 Device Capabilities
- `nativeModulesService`: orchestrates safe init for i18n, Stripe, Location, Notifications. All new native dependencies should be wired here first.
- `notificationService`: registers for Expo push, tracks location to drive geo notifications, and throttles polling (details live in notifications doc).
- `safeNativeModules.ts`: wraps risky Expo APIs (Location, Linking, Notifications) with try/catch + default fallbacks; services must use these wrappers instead of raw modules.

## 4. Login → Home Flow

1. User opens app, native modules initialize. RevenueCat either configures (native builds) or defers (web/lazy init).
2. `authService.onAuthStateChange` fires instantly with cached session, populating `authStore`.
3. When session exists, layout fetches profile via `authService.getProfile`, then:
   - Sets i18n language to `profile.preferred_language` (if different).
   - Starts `sessionService` interval.
   - Calls `notificationService.initialize(userId)` and `startLocationPolling()`.
4. Navigation guard pushes authenticated users into `/(tabs)`; unauthenticated users stay in `/(auth)` or `/(web)` landing.

## 5. Community Posting Flow

1. `QuickPostBar` asks `cityService.getCurrentLocationCity()` → permission wrappers prevent crashes.
2. Before showing templates, `communityService.canUserPost` (RPC) ensures quotas; `useCommunityStore.postLimits` drives UI copy.
3. On submit, `communityService.createPost` inserts into Supabase, calls `increment_post_usage` and invalidates caches. Store prepends the new post if it matches current tab filters.
4. `communityStore.savePost/unsavePost` wraps `recordInteraction`/`deleteInteraction` to keep DB + client arrays in sync.
5. Views/contacts call helper RPC + `increment` function so RLS is respected and counters stay accurate.

## 6. Leads & Search Credits

- Leads screens rely on `leadsService` to read/write `leads` table, tagging entries with `source_type` + `source_id` to know whether they came from community posts or manual input.
- Advanced search uses credit accounting from Supabase RPCs (`get_total_search_credits`). Stores combine subscription allowance + purchased packs to block overuse.

## 7. Defensive Patterns To Keep

1. **Native-first initialization**: Always gate new modules behind `nativeModulesService.initialize()` and only touch them after `nativeModulesReady === true` in layout.
2. **Service singletons**: `sessionService`, `notificationService` expose `start/stop`. Always call `stop` on logout to avoid leaks (already done in `_layout`).
3. **Zustand updates**: Never mutate arrays in place; return new arrays so React components rerender (see saved posts incident in `docs/archive/CRITICAL_BUG_ANALYSIS_app_layout_savedPosts.md`).
4. **Safe wrappers**: Use `safeRequestLocationPermissions`, `safeGetCurrentPosition`, `safeReverseGeocode`, etc. They log and swallow platform errors so user sessions stay alive.
5. **Edge navigation**: When adding new router groups, update `_layout` guard logic to keep same parity between mobile and web (especially for marketing routes).

## 8. Future Work Hooks

- Notification automation is evolving; keep `notificationService` interactions minimal in layout so we can swap in a background task.
- Community filters will expand (per `docs/how_it_works/COMMUNITY_FEATURE_FINAL_PLAN.md`); ensure store actions remain generic (filters stored as plain object) to support new keys.
- Any upcoming agent/AI features should plug into services rather than components to preserve this architecture.
