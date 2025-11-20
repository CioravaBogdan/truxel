# Platform Auth Setup (Google · Apple · Facebook)

Use this doc as the entry point for configuring every social provider. Keep the deeper references handy:
- `docs/how_it_works/OAUTH_IMPLEMENTATION.md`
- `docs/how_it_works/GOOGLE_OAUTH_SETUP.md`
- `docs/how_it_works/ANDROID_OAUTH_FIX.md` + `GOOGLE_OAUTH_FIX.md`
- `docs/how_it_works/FACEBOOK_LOGIN_INTEGRATION.md`

## 1. Supabase Foundation

1. **Enable providers**: In Supabase Dashboard → Auth → Providers, toggle Google, Apple, Facebook and paste the client IDs + secrets created in their respective consoles.
2. **URL configuration**: Under Auth → URL Configuration add every redirect we use:
   - `truxel://*`
   - `https://truxel.app` and `https://www.truxel.app`
   - `http://localhost:8081`, `http://localhost:8082`, `http://localhost:19000`, `http://localhost:19006`
   - `https://auth.expo.io/@cioravabogdan/truxel` (Expo AuthSession universal link fallback)
3. **Profile sync**: Confirm the `profiles` insert trigger is active so OAuth signups automatically create rows; `authService.getProfile` depends on it.
4. **JWT refresh**: Leave Supabase defaults; `sessionService` refreshes tokens every 5 minutes on the client.
## 2. Google Sign-In

- **Console setup**: Follow `GOOGLE_OAUTH_SETUP.md` to create the Web OAuth client (used by Supabase) and platform-specific clients (iOS bundle `io.truxel.app`, Android package `io.truxel.app`). Publish the consent screen with `supabase.co` + `truxel.app` domains.
- **Redirect construction**: `makeRedirectUri()` from `expo-auth-session` generates platform-aware callbacks, so never hardcode `truxel://...`. Ensure every generated origin is present in Supabase and (for Facebook) provider consoles.
- **Mobile flow** (`app/(auth)/login.tsx`):
  1. Call `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true }})`.
  2. Open the returned URL with `WebBrowser.openAuthSessionAsync`.
  3. Parse tokens via `QueryParams.getQueryParams` (avoid manual `URLSearchParams` per `ANDROID_OAUTH_FIX.md`).
  4. Persist session using `supabase.auth.setSession({ access_token, refresh_token })`.
- **Web flow**: Direct redirect (`window.location.href = data.url`) and Supabase handles the callback.
- **Testing**: Works inside Expo Go/Web after clearing caches (`npx expo start --clear`). If redirects fail, log `makeRedirectUri()` output and whitelist that exact value.
## 3. Apple Sign-In (iOS)

- **Build requirement**: `expo-apple-authentication` only works in custom dev/prod builds (`npx expo run:ios` or EAS). Expo Go will always skip Apple Sign In.
- **Apple Developer tasks** (see `APP_STORE_CONNECT_SETUP.md`):
  1. Create App ID with Sign In with Apple capability.
  2. Create Services ID + Key (retain Key ID + Team ID + .p8 file).
  3. Configure return URLs to match Supabase callback.
- **Supabase**: In Providers, enable Apple and upload the .p8 key along with Services ID, Key ID, Team ID.
- **App configuration**: `app.config.js` must set `ios.bundleIdentifier = "io.truxel.app"` and `usesAppleSignIn: true`. Button UI lives in `app/(auth)/login.tsx` and `oauthService.ts` handles nonce hashing + Supabase token exchange (see `OAUTH_IMPLEMENTATION.md`).
- **Flow summary**: `signInWithApple()` generates SHA-256 nonce, invokes native dialog, then calls `supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce })`. Layout listener picks up the new session.
- **Testing**: Use TestFlight or dev builds. On error `Apple Authentication is not available`, confirm build type and iOS version ≥ 13.
## 4. Facebook Login

- **Status**: UI + generic OAuth flow implemented; console configuration still needs cleanup per `FACEBOOK_LOGIN_INTEGRATION.md`.
- **Meta developer console**:
  - Add all app domains (`truxel.io`, `truxel.app`, `www.truxel.app`, `localhost`, `upxocyomsfhqoflwibwn.supabase.co`).
  - Append every dev redirect (`http://localhost:8081`, etc.) under **Valid OAuth Redirect URIs** and disable Strict Mode while testing.
  - Switch the app to Live mode after completing permission review (`email`, `public_profile`). Until then, testers must use Facebook test accounts.
- **Supabase**: Provider toggle is already on; ensure Client ID/Secret match console entries and that `truxel://*` plus Expo auth URLs are whitelisted.
- **Client flow**: `handleOAuthProviderSignIn('facebook')` reuses the Google WebBrowser + `QueryParams` path, so no extra code is required once redirects are accepted.
- **Testing tips**: Watch console logs for `requested path is invalid` (missing redirect). Use `localtunnel`/`ngrok` to provide a public HTTPS URL if Facebook refuses localhost.
## 5. Deep Linking & Redirect Hygiene

- `app.config.js` defines `scheme: 'truxel'` plus Android intent filters so `truxel://auth/callback` works on native builds.
- Expo Go often fails custom schemes on Android; fall back to `https://auth.expo.io/@cioravabogdan/truxel` via `makeRedirectUri({ useProxy: true })` during debugging.
- Always log `redirectTo` before starting OAuth; mismatches are the #1 failure cause.
- If you change bundle identifier/package name, regenerate Google/Facebook client IDs and update Supabase + console entries immediately.

## 6. QA Matrix

| Scenario | Steps | Expected |
| --- | --- | --- |
| Google on web | `npx expo start --clear`, press `w`, click Google button | Browser OAuth, redirect back to `http://localhost:8081`, auto login |
| Google on Android dev build | `npx expo run:android`, tap Google | Chrome custom tab opens, returns tokens via `truxel://`, session set |
| Apple Sign In | TestFlight build, tap Apple | Native sheet, FaceID, profile auto-filled, Supabase session created |
| Facebook on prod web | Deploy to `truxel.app`, click button | Redirect to facebook.com, returns to site, profile created |
| Facebook test mode | Expo Go + Facebook test user | Browser shows login, returns tokens; if blocked, check Valid OAuth URI list |

Document deviations + fixes here so future audits stay short.
