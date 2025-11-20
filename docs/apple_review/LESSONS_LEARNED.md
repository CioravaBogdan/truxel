# Lessons Learned

Single place to remember the bugs that cost us time so we stop repeating them. Each entry links back to the detailed archive note.

## 1. Zustand + Layout = Infinite Loop

- **Incident**: `app/_layout.tsx` destructured `loadSavedPosts` from `useCommunityStore` and called it inside the auth listener (see `docs/archive/CRITICAL_BUG_ANALYSIS_app_layout_savedPosts.md`). Zustand recreates function references after every `set`, so React thought dependencies changed and replayed the effect forever → app froze on iOS/Android.
- **Fix**: Never destructure store actions inside layout or router files. Use `useCommunityStore.getState().action()` or move loading logic into the feature component. If you must react to store data, select primitive state (e.g., `user?.id`) and keep actions out of dependency arrays.
- **Guardrail**: Add lint rule/code review checklist: “No Zustand destructuring in `app/_layout.tsx` or navigation files.” Mention this whenever reviewing PRs that touch layout.

## 2. Missing RLS DELETE Policy

- **Incident**: Users could “unsave” a post, UI removed it, but after restart it reappeared. Root cause: `community_interactions` lacked a DELETE policy (see `docs/archive/CRITICAL_BUG_FIX_RLS_DELETE_POLICY.md`). Supabase silently blocked the delete, returning `{ error: null }`.
- **Fix**: Added `CREATE POLICY "Users delete own interactions" ON community_interactions FOR DELETE USING (user_id = auth.uid());` and manually cleaned stuck rows.
- **Guardrail**: When enabling RLS on a table, ship all four policies (SELECT/INSERT/UPDATE/DELETE) in the same migration. For every mutation, request `count: 'exact'` and warn if 0 rows changed to detect policy blocks early.

## 3. Notification Handler Crash (Build 7)

- **Incident**: iOS TestFlight crashed ~0.11s after launch because `Notifications.setNotificationHandler` ran at module import time before the native module was ready (see `docs/archive/CRITICAL_IOS_CRASH_BUILD_7_ANALYSIS.md`).
- **Fix**: Wrap every `Notifications.setNotificationHandler` call in try/catch and move critical initialization behind `nativeModulesService`. Even if the native module throws, we log and continue.
- **Guardrail**: Never call native APIs at module scope unless they are idempotent and wrapped. Prefer calling inside `useEffect` after `nativeModulesReady`. Add regression test to search screen when editing notification code.

## 4. Defensive Native Module Initialization

- **Incident**: Earlier builds crashed ~0.4s after launch because TurboModule threw during startup (see `docs/archive/IOS_CRASH_FIX_DEFENSIVE_INITIALIZATION.md`). We had session + notification services starting before native modules were stable.
- **Fix**: Introduced `nativeModulesService.initialize()` and `nativeModulesReady` flag in `_layout`. Stage all other services behind that flag and wrap `sessionService.start()` / `notificationService.initialize()` in nested try/catch.
- **Guardrail**: Any new native dependency must be added to `nativeModulesService` first. Build checklist: “Does your code run before `nativeModulesReady`? If yes, rethink it.”

## 5. Android OAuth Redirect Failures

- **Incident**: Google/Facebook OAuth failed on Android Expo Go because we hardcoded `truxel://auth/callback` and manually parsed fragments (`split('#')[1]`). Documented in `docs/how_it_works/ANDROID_OAUTH_FIX.md` and `FACEBOOK_LOGIN_INTEGRATION.md`.
- **Fix**: Use `makeRedirectUri()` + `QueryParams.getQueryParams()` and whitelist every generated URI in Supabase + provider dashboards. Added instructions for Facebook test accounts and Live mode.
- **Guardrail**: Whenever we add a new OAuth provider, log the computed redirect and copy/paste it into both Supabase and the provider console before testing. Never manually parse OAuth responses.

## 6. Client-Side Notification Polling Gaps

- **Incident**: Users expected push alerts for city-specific posts but service only runs while the app is foregrounded, so we miss events and burn battery. Documented in `docs/NOTIFICATIONS_PLAN.md`.
- **Fix-in-progress**: Current implementation polls every 7 minutes and schedules local notifications as a stopgap. Future work is to move matching to a Supabase Edge Function + Expo push.
- **Guardrail**: Treat this as technical debt until server-driven notifications exist. When touching notification code, call out in PRs that the real fix is backend-driven.

---

Add new entries whenever we hit a production blocker. Format: *What broke → why → fix → rule to avoid regression*. If a bug doesn’t land here, we’ll probably ship it again.
