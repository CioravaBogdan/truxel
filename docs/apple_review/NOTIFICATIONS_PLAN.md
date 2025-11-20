# Notifications Plan

Covers the current Expo-based polling approach and the work left to reach full push automation.

## 1. Product Requirement

> “User should receive a notification when someone posts a load in the city they are in; check Supabase at app open and every 5–10 minutes.”

Derived expectations:
- Respect the 5–10 minute window (currently 7 minutes) and also run once immediately after login.
- Targeting is city-level using `profiles.last_known_city` / `last_known_lat` / `last_known_lng` updated by location flows.
- Pushes can be local (foreground) or Expo push if token available.

## 2. Current Implementation (`services/notificationService.ts`)

1. **Initialization**
   - Called from `app/_layout.tsx` after auth + profile load.
   - Requests permissions via safe wrappers, configures Expo notification handler, retrieves push token (native only) and stores it in `profiles.expo_push_token`.
2. **Polling loop**
   - `startLocationPolling()` sets a 7-minute interval (`POLLING_INTERVAL = 7 * 60 * 1000`).
   - Each tick runs `checkForNewPosts()` which:
     - Reads the user’s last known city from `profiles`.
     - Pulls posts created since the previous check (timestamp saved in AsyncStorage `notification_last_check`).
     - Filters posts whose `origin_city` matches the user city (case insensitive, trims “ - 42km” suffix).
     - Calls `safeScheduleNotification` for the newest matching post with a contextual title/body.
3. **Local storage**
   - AsyncStorage keeps `notification_last_check` so polls resume even if app restarts.
4. **Safety**
   - Every native call runs through `safeNativeModules` wrappers, preventing the iOS crash we hit in Build 7.

## 3. Backend Touchpoints

- **Tables**: `community_posts` (source), `profiles` (location + token), `notification_log` (future server-side audit), `user_post_usage` (unrelated to notifications but already policed).
- **No server job yet**: All filtering happens client-side. n8n workflows currently ignore notifications.
- **Required columns**: Ensure `profiles.last_known_city/lat/lng` stay updated whenever `cityService` fetches location (today done during posting flow).

## 4. Limitations & Next Steps

| Gap | Impact | Proposed fix |
| --- | --- | --- |
| Client-only polling drains battery and misses users when app closed | Push cadence unreliable | Move logic to Supabase Edge Function + background worker (cron) that writes to `notification_log`, then use Expo push (requires server key storage). |
| City match uses plain string equality | Misspellings or translations fail | Store `origin_city_id` (FK to `cities`) and compare by UUID; or use trigram similarity on server. |
| AsyncStorage timestamp per device only | Multi-device users may receive duplicates | Persist `notification_log` entries keyed by `user_id`; clients fetch the last `sent_at` instead of local timestamps. |
| Expo push token saved but unused | No remote pushes yet | Once server sends notifications, use `profiles.expo_push_token` list instead of local scheduling. |
| Permissions prompt happens immediately on login | Potential drop-off | Delay prompt until user opts into “Community Alerts” toggle in settings (store preference in profile). |

## 5. Suggested Roadmap

1. **Short term (client)**
   - Add debounce to `checkForNewPosts` so manual refresh runs once per minute maximum.
   - Track when permission denied and avoid re-prompting each login.
   - Log notification events to `notification_log` even for local notifications (insert via Supabase RPC) to gain observability.
2. **Medium term (backend)**
   - Create `supabase/functions/notify-city-subscribers` that:
     - Runs every 5 minutes (Supabase scheduled function).
     - Fetches new posts per city, joins with `profiles` who opted in within radius, inserts rows into `notification_log` and triggers Expo push via service key.
   - Add `community_notifications_enabled` toggle to profile settings screen (fields already added in schema).
3. **Long term**
   - Replace polling with Expo Push Notifications delivered even when the app is closed.
   - Implement radius-based targeting using `notification_radius_km` rather than exact city.
   - Feed n8n workflow with notification events for analytics.

## 6. QA Checklist

- [ ] Login → ensure `notificationService.initialize` resolves true (check console).
- [ ] Post new load in same city → wait ≤ 7 minutes → local notification appears.
- [ ] Logout → verify `notificationService.stopLocationPolling()` logs and interval clears.
- [ ] Toggle permissions off in device settings → service should log “Permissions not granted” and skip scheduling without crashing.
- [ ] Backgrounded app for >8 minutes → open → confirm `checkForNewPosts` runs once and timestamp updates.

Record findings here whenever behavior changes so future notification work starts from an accurate baseline.
