# OAuth Quick Fix - Action Required

## 🔴 URGENT: Add Redirect URLs to Supabase Dashboard

### Go to Supabase Dashboard:
https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/url-configuration

### Add These Redirect URLs:
1. `truxel://auth/callback` (for production app)
2. `exp://192.168.1.*:8081` (for Expo Go testing - replace with your IP)
3. `http://localhost:19006/**` (for web testing)

---

## Testing Instructions

### ✅ Google Sign In (Works Now):
```bash
# Clear cache and restart
npx expo start --clear
```
- Click "Sign in with Google"
- Browser opens, authenticate
- App receives callback
- ✅ Should work if redirect URLs added above

### ❌ Apple Sign In (Needs Development Build):
**ERROR**: "Unacceptable audience in id_token: [host.exp.Exponent]"

**CAUSE**: Expo Go doesn't support Apple Sign In natively.

**SOLUTION**: Create Development Build:
```bash
# Install dependencies
npm install -g eas-cli
eas login

# Build for iOS device
eas build --profile development --platform ios

# Or run locally on device
npx expo prebuild --clean
npx expo run:ios --device
```

**TEMPORARY**: Apple Sign In button will show error message directing users to use development build.

---

## What Changed in Code:

### 1. `services/oauthService.ts`:
- ✅ Added Expo Go detection for Apple Sign In
- ✅ Fixed Google OAuth redirect URL
- ✅ Added `skipBrowserRedirect` for mobile
- ✅ Better logging for debugging

### 2. `app/(auth)/login.tsx`:
- ✅ Added `WebBrowser.openAuthSessionAsync()` for Google
- ✅ Manual token extraction from callback URL
- ✅ Manual `setSession()` call

---

## Next Steps:

1. **NOW**: Add redirect URLs to Supabase Dashboard (see above)
2. **TEST**: Google Sign In should work immediately
3. **LATER**: Create Development Build for Apple Sign In testing

## Verify Redirect URLs Added:
After adding URLs, run:
```bash
npx expo start --clear
```
Try Google Sign In - should work!
