# OAuth Integration - Apple & Google Sign In

## ✅ Implemented Features

### Apple Sign In
- ✅ expo-apple-authentication installed
- ✅ Apple Auth button on login screen
- ✅ OAuth service with Supabase integration
- ✅ Auto-fill user name from Apple ID
- ✅ Nonce security implementation
- ✅ Translations (en, ro)

## 📋 Configuration Steps

### 1. Supabase Dashboard Setup

**Enable Apple Provider:**
1. Go to: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/providers
2. Click on "Apple"
3. Toggle "Enable Sign in with Apple"
4. Optional: Set Services ID to `com.truxel.app`
5. Click "Save"

**Redirect URLs (Auto-configured):**
- Supabase handles OAuth redirects automatically
- No manual URL configuration needed

### 2. App Configuration

**app.config.js:**
```javascript
ios: {
  bundleIdentifier: "com.truxel.app",
  usesAppleSignIn: true
}
```

**Plugins:**
```javascript
plugins: [
  "expo-apple-authentication",
  // ... other plugins
]
```

## 🚨 Important Limitations

### Apple Sign In in Expo Go
**DOES NOT WORK** ❌ - Requires custom development build

**Why?**
- Apple Authentication requires native code compilation
- Expo Go is a sandbox that doesn't include Apple Sign In capabilities
- Must use `npx expo run:ios` to build custom client

### Testing Options

**Option 1: Email/Password (Current)**
- ✅ Works in Expo Go
- ✅ No build required
- Use for development and testing

**Option 2: Custom Dev Build (Production)**
```bash
# Build custom iOS app with Apple Sign In
npx expo prebuild
npx expo run:ios
```

**Option 3: Production Build**
```bash
# Build for TestFlight/App Store
eas build --platform ios --profile production
```

## 🔐 Security Features

### Nonce Implementation
```typescript
// Generate random nonce
const nonce = Math.random().toString(36).substring(2, 10);

// Hash with SHA-256
const hashedNonce = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  nonce
);

// Use in Apple Sign In request
await AppleAuthentication.signInAsync({
  nonce: hashedNonce,
  // ...
});

// Verify with Supabase
await supabase.auth.signInWithIdToken({
  provider: 'apple',
  token: credential.identityToken,
  nonce, // Original unhashed nonce
});
```

### Profile Auto-fill
- First sign-in captures Apple ID name
- Auto-updates Supabase profile.full_name
- Subsequent sign-ins use existing profile

## 📱 User Flow

### First Time Sign In
1. User taps "Sign in with Apple" button
2. iOS shows Apple ID authentication dialog
3. User approves with Face ID/Touch ID/Password
4. App receives:
   - Identity token
   - Email (if shared)
   - Full name (first time only)
5. Supabase creates user account
6. Profile created with email + full name
7. User redirected to main app

### Returning User
1. User taps "Sign in with Apple"
2. iOS recognizes existing Apple ID
3. Quick authentication (no re-prompts)
4. Identity token verified by Supabase
5. User signed in immediately

## 🔧 Code Structure

### Services
**services/oauthService.ts:**
```typescript
export async function signInWithApple()
export async function isAppleAuthAvailable()
```

### Components
**app/(auth)/login.tsx:**
- Apple Sign In button (iOS only)
- Email/Password fallback
- Error handling with Toast

### Auth Flow
**app/_layout.tsx:**
- Monitors auth state changes
- Loads profile on sign in
- Redirects based on auth status

## 🐛 Debugging

### Check if Apple Auth is Available
```typescript
const available = await isAppleAuthAvailable();
console.log('Apple Auth available:', available);
```

### Console Logs to Monitor
```
Starting Apple Sign In...
Requesting Apple credentials...
Apple credentials received: { hasIdentityToken, hasEmail, hasFullName }
Signing in to Supabase with Apple token...
Apple Sign In successful!
```

### Common Errors

**Error: "Apple Authentication is not available"**
- Platform is not iOS
- iOS version < 13.0
- Running in Expo Go (not supported)

**Error: "ERR_REQUEST_CANCELED"**
- User tapped "Cancel" in Apple dialog
- Handled gracefully (no error shown)

**Error: "No identity token received"**
- Apple Sign In failed
- Check iOS settings → Apple ID

## 🚀 Next Steps

### For Production Release

1. **Apple Developer Account Setup:**
   - Create App ID with Sign In with Apple capability
   - Configure Services ID
   - Add redirect URLs

2. **Build Custom Client:**
```bash
eas build --platform ios --profile production
```

3. **Configure Supabase:**
   - Add Apple Services ID
   - Add Apple Team ID
   - Add Key ID and .p8 key file

4. **Test Flow:**
   - TestFlight beta testing
   - Verify profile creation
   - Test with multiple Apple IDs

### Google Sign In (Future)

**Status:** Prepared but not active

**Why not implemented yet?**
- Requires Google Cloud Console project
- Needs OAuth client ID for iOS
- Requires custom dev build (like Apple)

**To implement:**
1. Create Google Cloud project
2. Configure OAuth consent screen
3. Get iOS client ID
4. Update oauthService.ts
5. Add Google button to login.tsx

## 📊 Analytics to Track

- Apple Sign In attempts
- Successful Apple Sign In completions
- Profile auto-fill success rate
- Apple vs Email/Password usage ratio

## 🔗 Resources

- [Expo Apple Authentication Docs](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Supabase Apple Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Apple Sign In Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

---

**Last Updated:** October 22, 2025  
**Status:** Ready for custom dev build testing
