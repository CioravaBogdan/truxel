# Facebook Login Integration - Complete Configuration Reference

## 📊 Current Status

### ✅ UI Implemented
- Facebook Sign In button added to login screen (`app/(auth)/login.tsx`)
- Custom Facebook-styled button with "f" icon
- Blue background (#1877F2 - Facebook blue)
- Translations in all languages (en, ro, uk, pl, de, es, tr, lt, fr, it)

### ✅ Backend Configured (Uses Generic OAuth Flow)
- Facebook login uses the **same generic OAuth flow** as Google
- Function: `handleOAuthProviderSignIn(provider: 'google' | 'facebook')`
- No Facebook-specific SDK or configuration
- **✅ CONFIGURED IN SUPABASE** - Provider enabled with App ID + Secret
- **⚠️ MISSING: localhost redirect URIs in Facebook Console** → Fails on development

---

## 🔑 Facebook App Configuration (As of November 18, 2025)

### **App Identity**
- **App Name:** Truxel
- **App ID:** `912711708582826`
- **App Secret:** `77a3f7945fbcbaded52bb243cbt2c922`
- **Client Token:** `3d3fbcf2eda7b7cba17bd6c855qa844d`
- **Status:** Published ✅
- **Category:** Business and pages

### **Contact & Privacy**
- **Contact Email:** `office@truxel.io`
- **Privacy Policy URL:** `https://truxel.io/privacy`
- **Terms of Service URL:** `https://truxel.io/terms`
- **DPO Name:** Ciorava Bogdan
- **DPO Email:** `cioravageorgebogdan@gmail.com`
- **DPO Address:** Strada Tudor Vladimirescu 185, Sat Podu Turcului, Bacău 607450, România

### **App Domains (Settings → Basic)**
**Current:** `truxel.io` (DOAR UNUL!)

**⚠️ TREBUIE ADĂUGATE:**
```
localhost
truxel.app
www.truxel.app
upxocyomsfhqoflwibwn.supabase.co
```

### **Valid OAuth Redirect URIs (Facebook Login → Settings)**
**✅ Currently Configured:**
```
https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback
https://truxel.app/
https://www.truxel.app/
```

**❌ LIPSESC (DE ACEEA NU MERGE PE DEVELOPMENT!):**
```
http://localhost:8081
http://localhost:8082
http://localhost:19000
http://localhost:19006
```

### **OAuth Settings (Facebook Login → Settings)**
- **Client OAuth Login:** ✅ YES (Enabled)
- **Web OAuth Login:** ✅ YES (Enabled)
- **Use Strict Mode for Redirect URIs:** ⚠️ YES (POSIBIL PROBLEMATIC - recomand OFF pentru development)
- **Force Web OAuth Reauthentication:** ❌ NO
- **Embedded Browser OAuth Login:** ❌ NO
- **Login from Devices:** ❌ NO
- **Login with the JavaScript SDK:** ❌ NO

### **Permissions & Features**
- ✅ `email` - Ready for testing (Completed)
- ✅ `public_profile` - Ready for testing (Completed)

### **Advanced Settings**
- **Domain Manager:** No domains configured ⚠️
  - **TREBUIE ADĂUGAT:** `upxocyomsfhqoflwibwn.supabase.co`
- **Share Redirect Allow List:** Allow Cross Domain Share Redirects ✅ Enabled

## 🔧 Current Implementation

### Login Screen (`app/(auth)/login.tsx`)

**State Management:**
```typescript
const [isFacebookAvailable, setIsFacebookAvailable] = useState(false);

useEffect(() => {
  checkOAuthProviders();
}, []);

const checkOAuthProviders = async () => {
  // ...
  setIsFacebookAvailable(true); // Always true (UI ready)
};
```

**Handler Function:**
```typescript
const handleFacebookSignIn = () => handleOAuthProviderSignIn('facebook');
```

**Generic OAuth Flow (Shared with Google):**
```typescript
const handleOAuthProviderSignIn = async (provider: 'google' | 'facebook') => {
  if (Platform.OS === 'web') {
    // Web: Direct redirect
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (data?.url) window.location.href = data.url;
  } else {
    // Mobile: Expo auth session with deep link
    const redirectTo = buildMobileRedirectUri(); // 'truxel://auth/callback'
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    // Open OAuth URL in browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    // Extract tokens and set session
    if (result.type === 'success') {
      const { access_token, refresh_token } = QueryParams.getQueryParams(result.url).params;
      await supabase.auth.setSession({ access_token, refresh_token });
    }
  }
};
```

**UI Component:**
```tsx
{isFacebookAvailable && (
  <TouchableOpacity
    style={styles.facebookButton}
    onPress={handleFacebookSignIn}
    disabled={isLoading}
  >
    <View style={styles.facebookButtonContent}>
      <Text style={styles.facebookIcon}>f</Text>
      <Text style={styles.facebookButtonText}>
        {t('auth.sign_in_with_facebook')}
      </Text>
    </View>
  </TouchableOpacity>
)}
```

**Button Styling:**
```typescript
facebookButton: {
  backgroundColor: '#1877F2', // Facebook blue
  borderRadius: 8,
  paddingVertical: 12,
  marginBottom: 12,
  shadowColor: '#1877F2',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
},
facebookButtonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
facebookIcon: {
  color: '#FFFFFF',
  fontSize: 24,
  fontWeight: 'bold',
  marginRight: 8,
},
facebookButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},
```

### Translations (All Languages)

**English (`locales/en.json`):**
```json
{
  "auth": {
    "sign_in_with_facebook": "Sign in with Facebook"
  }
}
```

**Romanian, Ukrainian, Polish, German, Spanish, Turkish, Lithuanian, French, Italian:**
- All languages have the translation key configured
- Format: `t('auth.sign_in_with_facebook')`

---

## 🔧 Supabase Configuration (Verified November 18, 2025)

### **Supabase Auth Provider Settings**
**Dashboard URL:** https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/providers

**Facebook Provider:**
- ✅ **Enabled:** YES (Toggle ON)
- ✅ **Facebook Client ID:** `912711708582826`
- ✅ **Facebook Secret:** `77a3f7945fbcbaded52bb243cbt2c922` (configured)
- ✅ **Callback URL:** `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`

### **Supabase Redirect URLs Whitelist**
**Dashboard URL:** https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/url-configuration

**✅ Must Include (for Facebook to work):**
```
truxel://*
http://localhost:8081
http://localhost:8082
http://localhost:19000
http://localhost:19006
https://truxel.app
https://www.truxel.app
```

---

## 🚨 ROOT CAUSE ANALYSIS - Why Facebook Login Fails

### **🔴 PROBLEMA #1: Facebook App în Development Mode (TestFlight Error)**

**Symptom:**
```
Error: Feature Unavailable: Facebook Login is currently unavailable for this app, 
since we are updating additional details for this app. Please try again later.
```

**Root Cause:**
- Facebook App e **Published** DAR **nu e Live** pentru toți userii
- App-ul e în **"Development Mode"** → doar Test Users pot face login
- Real users (inclusiv beta testeri TestFlight) primesc eroarea de mai sus

**Solution:**
1. **Add Test Users** pentru TestFlight beta → Quick fix
2. **Submit App Review** pentru `email` permission → Permanent fix (3-7 zile)
3. **Switch to Live Mode** după approval

---

### **🔴 PROBLEMA #2: Missing localhost Redirect URIs (Development)**

**Symptom:** 
- Apăsați butonul "Sign in with Facebook" pe localhost → Pagină albastră (blank/error page)
- Console log arată: `❌ Supabase OAuth error: "requested path is invalid"`

**Root Cause:**
Facebook App Console are configured **DOAR production URIs**:
- ✅ `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`
- ✅ `https://truxel.app/`
- ✅ `https://www.truxel.app/`

**LIPSESC localhost URIs pentru development:**
- ❌ `http://localhost:8081` (Expo web dev server)
- ❌ `http://localhost:8082` (alternate port)
- ❌ `http://localhost:19000` (Expo CLI default)
- ❌ `http://localhost:19006` (Expo web)

**Impact:**
- ✅ **Production:** Ar trebui să funcționeze pe `https://truxel.app`
- ❌ **Development:** NU funcționează pe localhost (Expo Go, Expo web dev)
- ❌ **Mobile (Expo Go):** NU funcționează pentru că `truxel://` redirect nu e în Facebook URIs

---

---

## ✅ SOLUTION #1 - Fix Facebook App Mode (Pentru TestFlight & Production)

### **STEP A: Verifică App Mode**

1. **Go to:** https://developers.facebook.com/apps/912711708582826/settings/basic/
2. **Scroll jos la:** "App Mode"
3. **Check status:**
   - 🔴 **Development:** Doar test users pot face login
   - ✅ **Live:** Toți userii pot face login

### **STEP B: Completează Detalii Obligatorii (Required pentru Live Mode)**

**În Settings → Basic:**

✅ **Privacy Policy URL:** `https://truxel.io/privacy` (deja configurat)
✅ **Terms of Service URL:** `https://truxel.io/terms` (deja configurat)
❌ **Data Deletion Instructions URL:** **LIPSEȘTE - OBLIGATORIU!**

**Adaugă Data Deletion URL:**
```
https://truxel.io/data-deletion
```

**Creează pagină simplă (https://truxel.io/data-deletion):**
```html
<h1>Delete Your Truxel Account</h1>
<p>To delete your account:</p>
<ol>
  <li>Open Truxel app</li>
  <li>Go to Settings → Account</li>
  <li>Tap "Delete Account"</li>
</ol>
<p>Or email: office@truxel.io</p>
```

### **STEP C: Submit App Review pentru `email` Permission**

**Facebook cere App Review pentru Live Mode:**

1. **Go to:** https://developers.facebook.com/apps/912711708582826/app-review/permissions/
2. **Click "Request Advanced Access"** pentru `email` și `public_profile`
3. **Fill form:**
   - **How you use email:** "We create user accounts and send notifications"
   - **Upload demo video:** Screen recording al login flow-ului
   - **Screenshots:** Login screen + after successful login
4. **Submit for Review**
5. **Wait 3-7 zile** pentru approval

### **STEP D: Switch to Live Mode (După App Review)**

1. **Go to:** Settings → Basic → App Mode
2. **Click "Switch Mode"** → **"Live"**
3. **Confirm** → Facebook Login va funcționa pentru toți userii! ✅

---

## ✅ SOLUTION #2 - Quick Fix pentru TestFlight Beta Testing

**Dacă vrei să testezi ACUM fără să aștepți App Review:**

### **Add Test Users în Facebook Console:**

1. **Go to:** https://developers.facebook.com/apps/912711708582826/roles/test-users/
2. **Click "Add Test Users"**
3. **Create 5-10 test accounts** (Facebook generează automat)
4. **Download credentials** (email + password)
5. **Share cu beta testeri:**
   ```
   TestFlight Note:
   Facebook Login requires test accounts (App Review pending).
   Credentials:
   - test_user_1@tfbnw.net / password123
   - test_user_2@tfbnw.net / password456
   ```

**În Development Mode:**
- ✅ Test users pot face login
- ✅ Perfect pentru TestFlight internal testing
- ❌ Real Facebook accounts nu funcționează

---

## ✅ SOLUTION #3 - Fix localhost Redirect URIs (Development)

### **STEP 1: Adaugă localhost URIs în Facebook Console**

1. **Go to:** https://developers.facebook.com/apps/912711708582826/fb-login/settings/

2. **Scroll to:** "Valid OAuth Redirect URIs"

3. **Click "Add URI"** și adaugă TOATE acestea (unul câte unul):

```
http://localhost:8081
http://localhost:8082
http://localhost:19000
http://localhost:19006
```

4. **Important:** NU șterge cele existente! Păstrează:
```
https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback
https://truxel.app/
https://www.truxel.app/
```

5. **Click "Save Changes"**

---

### **STEP 2: Dezactivează "Strict Mode" pentru Development**

În aceeași pagină (Facebook Login → Settings):

1. **Use Strict Mode for Redirect URIs:** Toggle **OFF** ⚠️
   - Strict Mode = Facebook respinge orice redirect URI care nu match EXACT
   - Pentru development, e prea restrictiv
   - Pentru production, îl poți activa înapoi

2. **Click "Save Changes"**

---

### **STEP 3: Adaugă App Domains**

1. **Go to:** https://developers.facebook.com/apps/912711708582826/settings/basic/

2. **App Domains** (acum e doar `truxel.io`) → Click "Add Domain"

3. **Adaugă:**
```
localhost
truxel.app
www.truxel.app
upxocyomsfhqoflwibwn.supabase.co
```

4. **Click "Save Changes"**

---

### **STEP 4: Verifică Supabase Redirect URLs**

1. **Go to:** https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/url-configuration

2. **Verifică că există:**
```
truxel://*
http://localhost:8081
http://localhost:8082
https://truxel.app
https://www.truxel.app
```

3. **Dacă lipsește vreunul → Add URL → Save**

---

### **STEP 5 (Optional): Configurează Domain Manager în Facebook**

Pentru production (App Review când publici app-ul):

1. **Go to:** App Settings → Advanced → Domain Manager

2. **Add Domain:** `upxocyomsfhqoflwibwn.supabase.co`

3. **Verify ownership** (Facebook va da instrucțiuni - de obicei prin DNS TXT record sau file upload)

**Nota:** Acest pas NU e necesar pentru development/testing, doar pentru production când faci App Review.

### 2. ❌ No Facebook SDK Integration

**Current State:**
- Does NOT use `expo-facebook` SDK
- Uses generic Supabase OAuth (same as Google)
- Opens browser-based OAuth flow

**Implications:**
- ✅ Simple implementation (reuses Google OAuth code)
- ✅ No extra dependencies needed
- ✅ Works on all platforms (web + mobile)
- ⚠️ User leaves app to authenticate (opens browser)
- ⚠️ Slightly slower UX compared to native SDK

**Alternative (Native SDK):**
If you want in-app Facebook login (like Apple Sign In):
```bash
npx expo install expo-facebook
```

Then implement native flow similar to `signInWithApple()` in `oauthService.ts`

### 3. ❌ No Facebook-Specific Error Handling

**Current:**
- Generic error handling for all OAuth providers
- No Facebook-specific permission errors
- No handling of "user denied permissions" case

**To Add:**
```typescript
if (error.message?.includes('facebook')) {
  // Handle Facebook-specific errors
  // e.g., "User cancelled Facebook login"
  // e.g., "Facebook permissions denied"
}
```

---

## 🔍 DEBUGGING GUIDE - Step-by-Step Troubleshooting

### **When Facebook Login button is pressed, check these in order:**

#### **1. Console Logs (Expo Terminal)**

Expected flow:
```
=== OAuth Redirect Debug ===
Platform: ios / android / web
Computed redirectTo: truxel://auth/callback (sau http://localhost:8081 pe web)
🔀 Supabase returned facebook OAuth URL: https://www.facebook.com/v24.0/dialog/oauth?...
🔗 Opening OAuth URL...
📬 WebBrowser result: { type: 'success', url: 'truxel://auth/callback?code=...' }
✅ OAuth redirect successful
```

**If you see:**
- `❌ Supabase OAuth error: "requested path is invalid"` 
  → **Redirect URL not whitelisted** în Supabase sau Facebook Console
  
- `❌ Supabase OAuth error: "invalid_request"`
  → **App ID sau Secret greșit** în Supabase Dashboard

- `📬 WebBrowser result: { type: 'cancel' }`
  → User a închis browser-ul manual (normal behavior)

- `❌ No access token received`
  → Redirect a funcționat dar tokens nu au fost returnate (check Facebook permissions)

#### **2. Network Logs (Chrome DevTools / React Native Debugger)**

**Web:** Deschide DevTools → Network tab → Filter by "facebook"

**Look for:**
- `https://www.facebook.com/v24.0/dialog/oauth?...` (initial redirect)
- `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback?code=...` (callback)
- `http://localhost:8081/?access_token=...` (final redirect pe web)

**If stuck on blank page:**
- Check Response tab → Look for error JSON
- Common: `{"error": "redirect_uri_mismatch"}` → URI not in Facebook whitelist

#### **3. Facebook App Dashboard - Check Recent Activity**

**Go to:** https://developers.facebook.com/apps/912711708582826/dashboard/

**Look for:**
- "Recent Activity" section
- OAuth errors
- Blocked redirect attempts

#### **4. Supabase Logs - Check Auth Attempts**

**Go to:** https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/logs/explorer

**Run query:**
```sql
SELECT * FROM auth.audit_log_entries 
WHERE action = 'user_signedup' 
AND provider = 'facebook'
ORDER BY created_at DESC 
LIMIT 10;
```

**If no rows:**
- OAuth flow never reached Supabase callback
- Problem is in Facebook redirect configuration

---

## 🧪 Testing Scenarios & Expected Results

### **Scenario 1: Web Development (localhost:8081)**

**Prerequisites:**
- ✅ `http://localhost:8081` în Facebook Valid OAuth Redirect URIs
- ✅ `http://localhost:8081` în Supabase Redirect URLs
- ✅ Strict Mode OFF în Facebook Console

**Test Steps:**
1. `npx expo start` → Press `w` (web)
2. Browser opens at `http://localhost:8081`
3. Click "Sign in with Facebook"
4. **Expected:** Browser redirects to Facebook login
5. Enter credentials → Approve permissions
6. **Expected:** Redirect back to `http://localhost:8081/?access_token=...`
7. **Expected:** User logged in, redirected to main app

**If fails:** Check console for exact error, verify redirect URIs match exactly

---

### **Scenario 2: iOS Development (Expo Go)**

**Prerequisites:**
- ✅ `truxel://*` în Supabase Redirect URLs
- ⚠️ Facebook NU permite `truxel://` în Valid OAuth URIs (known limitation)
- **Workaround:** Use Expo AuthSession universal link: `https://auth.expo.io/@cioravabogdan/truxel`

**Test Steps:**
1. Open Expo Go pe iPhone
2. Scan QR code din terminal
3. Go to login screen
4. Tap "Sign in with Facebook"
5. **Expected:** Safari opens cu Facebook login
6. Authenticate
7. **Expected:** Deep link redirect → App reopens
8. **Expected:** User logged in

**If fails:**
- Check if `buildMobileRedirectUri()` returns correct URL
- May need to use `https://auth.expo.io/@cioravabogdan/truxel` instead of `truxel://`

---

### **Scenario 3: Android Development (Expo Go)**

**Same as iOS** - Expo Go limitations apply.

**For native Android (dev build):**
- Custom scheme `truxel://` works correctly
- No Expo Go limitations

---

### **Scenario 4: Production (truxel.app deployed)**

**Prerequisites:**
- ✅ `https://truxel.app` în Facebook Valid OAuth Redirect URIs
- ✅ `https://www.truxel.app` în Facebook Valid OAuth Redirect URIs
- ✅ `https://truxel.app` în Supabase Redirect URLs

**Test Steps:**
1. Open `https://truxel.app` în browser
2. Click "Sign in with Facebook"
3. **Expected:** Redirect to Facebook
4. Authenticate
5. **Expected:** Redirect back to `https://truxel.app?access_token=...`
6. **Expected:** User logged in

**If fails:** Check if production domain is correct în Facebook + Supabase

---

## 📋 Testing Checklist (Post-Configuration)

### Web Testing
- [ ] Click "Sign in with Facebook" button
- [ ] Verify redirect to Facebook login page
- [ ] Authenticate with Facebook account
- [ ] Verify redirect back to Truxel app
- [ ] Check session created in Supabase
- [ ] Check profile auto-created with Facebook email/name

### Mobile Testing (iOS/Android)
- [ ] Tap "Sign in with Facebook" button
- [ ] Verify browser opens with Facebook login
- [ ] Authenticate with Facebook
- [ ] Verify deep link redirect: `truxel://auth/callback`
- [ ] Check session tokens extracted correctly
- [ ] Verify user redirected to main app screen

### Edge Cases
- [ ] Test canceling Facebook login (should show "cancelled" toast)
- [ ] Test with Facebook account that denies email permission
- [ ] Test signing in twice (should reuse existing account)
- [ ] Test on iOS with Facebook app installed (should use native app)
- [ ] Test on iOS without Facebook app (should use browser)

## 🔐 Security Considerations

### OAuth Flow Security
- ✅ Uses Supabase OAuth (industry standard)
- ✅ PKCE flow for mobile (built into Supabase)
- ✅ State parameter for CSRF protection (Supabase handles)
- ✅ Token exchange happens server-side (Supabase)

### Data Privacy
- Facebook email/name collected on first sign-in
- Stored in Supabase `auth.users` and `profiles` table
- No additional Facebook data collected
- User can revoke Truxel access from Facebook settings

### Redirect URI Security
- Redirect URIs must be whitelisted in:
  1. Facebook App Console
  2. Supabase Auth Settings
- Prevents redirect hijacking attacks

## 📱 User Experience Flow

### First Time Facebook Sign In
1. User taps "Sign in with Facebook"
2. Browser opens with Facebook login page
3. User enters Facebook credentials (or uses saved session)
4. Facebook asks: "Allow Truxel to access your public profile and email?"
5. User approves
6. Browser redirects to `truxel://auth/callback?access_token=...`
7. App extracts tokens and creates Supabase session
8. Profile auto-created with Facebook email + name
9. User redirected to main app (Search screen)

### Returning User
1. User taps "Sign in with Facebook"
2. Browser opens (Facebook session still active)
3. Instant redirect (no re-authentication needed)
4. App creates session
5. User signed in

## 🎨 UI Design

**Button Appearance:**
- Background: Facebook blue (#1877F2)
- Text: White
- Icon: Facebook "f" logo (using text character)
- Shadow: Blue glow effect
- Disabled state: Grayed out during loading

**Button Position:**
- Below Google Sign In button
- Above "No account? Sign up" link
- Part of OAuth buttons group

**Responsive Design:**
- Full width on mobile
- Consistent height with other OAuth buttons
- Touch target: 48px minimum (accessibility)

## 📊 Comparison with Other OAuth Providers

| Feature | Apple Sign In | Google Sign In | Facebook Sign In |
|---------|--------------|----------------|------------------|
| **SDK Used** | expo-apple-authentication | Supabase OAuth | Supabase OAuth |
| **Platform** | iOS only | All platforms | All platforms |
| **Expo Go Support** | ❌ (requires dev build) | ✅ Yes | ✅ Yes |
| **Native UI** | ✅ iOS native dialog | ❌ Browser-based | ❌ Browser-based |
| **Speed** | ⚡ Instant (native) | 🐢 Slow (browser) | 🐢 Slow (browser) |
| **UX** | Best (stays in app) | Medium (opens browser) | Medium (opens browser) |
| **Setup Complexity** | High (Apple Dev Account) | Medium (Google Console) | Medium (Meta Dev Console) |
| **Status** | ✅ Ready for dev build | ✅ Fully configured | ⚠️ UI ready, needs config |

---

## 🚀 IMMEDIATE ACTION ITEMS (To Fix Facebook Login)

### **Priority 1: Fix Facebook Console Redirect URIs** ⚠️ BLOCKER

**DO THIS NOW:**
1. Go to: https://developers.facebook.com/apps/912711708582826/fb-login/settings/
2. **Valid OAuth Redirect URIs** → Add:
   ```
   http://localhost:8081
   http://localhost:8082
   http://localhost:19000
   http://localhost:19006
   ```
3. Toggle **"Use Strict Mode for Redirect URIs"** → **OFF**
4. Click **"Save Changes"**

**Expected Result:** Development login va funcționa pe localhost.

---

### **Priority 2: Add App Domains**

**DO THIS:**
1. Go to: https://developers.facebook.com/apps/912711708582826/settings/basic/
2. **App Domains** → Add:
   ```
   localhost
   truxel.app
   www.truxel.app
   upxocyomsfhqoflwibwn.supabase.co
   ```
3. **Save Changes**

**Expected Result:** Facebook va permite OAuth de la toate domeniile.

---

### **Priority 3: Verify Supabase Redirect URLs**

**Check:**
1. Go to: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/url-configuration
2. Verify acestea există:
   ```
   truxel://*
   http://localhost:8081
   http://localhost:8082
   https://truxel.app
   https://www.truxel.app
   ```
3. Dacă lipsește ceva → Add URL → Save

---

### **Priority 4: Test Facebook Login**

**After fixing URIs:**

**Web Test:**
```powershell
npx expo start --clear
# Press 'w' for web
# Click "Sign in with Facebook"
# Should work now! ✅
```

**Expected Console Output:**
```
=== OAuth Redirect Debug ===
Platform: web
Computed redirectTo: http://localhost:8081
🔀 Supabase returned facebook OAuth URL: https://www.facebook.com/v24.0/dialog/oauth?...
(Browser opens Facebook login)
(User authenticates)
(Redirect back to http://localhost:8081/?access_token=...)
✅ User logged in successfully!
```

---

---

## 🤔 FAQ - Ce se întâmplă când...

### **Q: User NU are cont Truxel și face Facebook login?**

**A:** Supabase creează AUTOMAT un cont nou:
1. Facebook returnează: `email`, `name`, `facebook_user_id`
2. Supabase creează user în `auth.users` cu `provider = 'facebook'`
3. App creează profile în `profiles` table cu email + name
4. User e logged in instant! ✅

**Cod relevant:**
```typescript
// Supabase OAuth auto-signup
const { data } = await supabase.auth.signInWithOAuth({
  provider: 'facebook'
});
// După success, authStore.getProfile() creează profile automat
```

---

### **Q: User DEJA are cont cu email/password și încearcă Facebook login?**

**A:** Supabase NU face merge automat → Error!

**Ce se întâmplă:**
- User cu `user@example.com` (password auth) încearcă Facebook login
- Facebook returnează același email
- **Error:** `"User already exists"` (email duplicate)

**Soluție (NOT IMPLEMENTED YET):**
```typescript
// Link Facebook to existing account
await supabase.auth.linkIdentity({ provider: 'facebook' });
```

**Workaround actual:**
- User trebuie să folosească password login
- SAU să creeze cont nou cu alt email

---

### **Q: User Facebook NU are email public?**

**A:** Unii Facebook users au email privat (don't share with apps).

**Ce se întâmplă:**
- Facebook OAuth returnează `null` pentru email
- Supabase creează user DAR `user.email = null`
- **Problema:** Profile incomplet, nu poți trimite email notifications

**Soluție (NOT IMPLEMENTED YET):**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user.email) {
  // Prompt user: "Please enter your email"
  // Sau folosește facebook_user_id ca identificator primar
}
```

---

### **Q: De ce localhost nu funcționează în Facebook OAuth?**

**A:** Facebook **NU acceptă `http://localhost` ca Valid OAuth Redirect URI** în production!

**Soluție pentru development:**
- ❌ `http://localhost:8081` → Rejected de Facebook
- ✅ Use **Facebook Test Users** în Development Mode
- ✅ Sau deploy preview build la URL public (ex: Vercel preview)

**Alternative pentru local testing:**
- Use **ngrok** sau **localtunnel** pentru public URL temporar:
  ```bash
  npx localtunnel --port 8081
  # Returns: https://abc123.loca.lt
  # Add this URL to Facebook Console
  ```

---

## 📊 Configuration Summary (Quick Reference)

### **Facebook App Console**
```
App ID: 912711708582826
App Secret: 77a3f7945fbcbaded52bb243cbt2c922
Status: Published ✅
Permissions: email, public_profile ✅

Valid OAuth Redirect URIs:
  ✅ https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback
  ✅ https://truxel.app/
  ✅ https://www.truxel.app/
  ❌ http://localhost:8081 (TREBUIE ADĂUGAT!)
  ❌ http://localhost:8082 (TREBUIE ADĂUGAT!)
  ❌ http://localhost:19000 (TREBUIE ADĂUGAT!)
  ❌ http://localhost:19006 (TREBUIE ADĂUGAT!)

Client OAuth Login: YES ✅
Web OAuth Login: YES ✅
Use Strict Mode: YES ⚠️ (schimbă la OFF pentru dev!)

App Domains:
  ✅ truxel.io
  ❌ localhost (TREBUIE ADĂUGAT!)
  ❌ truxel.app (TREBUIE ADĂUGAT!)
  ❌ www.truxel.app (TREBUIE ADĂUGAT!)
  ❌ upxocyomsfhqoflwibwn.supabase.co (TREBUIE ADĂUGAT!)
```

### **Supabase Configuration**
```
Project: upxocyomsfhqoflwibwn
Facebook Provider: Enabled ✅
Facebook Client ID: 912711708582826 ✅
Facebook Secret: Configured ✅

Redirect URLs Whitelist:
  ✅ truxel://*
  ✅ http://localhost:8081
  ✅ https://truxel.app
  ✅ https://www.truxel.app
```

### **App Configuration**
```javascript
// app.config.js
scheme: "truxel" ✅

// iOS
bundleIdentifier: "io.truxel.app" ✅

// Android
package: "io.truxel.app" ✅
intentFilters: [
  { scheme: "truxel", host: "*" }
] ✅
```

---

## 🎯 Expected Behavior After Fix

### **✅ Should Work:**
- Web development: `http://localhost:8081`
- Web production: `https://truxel.app`
- iOS/Android (native builds): `truxel://` deep links

### **⚠️ Partial Support:**
- Expo Go (iOS/Android): May need Expo AuthSession universal links
  - Use: `https://auth.expo.io/@cioravabogdan/truxel`
  - Instead of: `truxel://auth/callback`

### **Known Limitations:**
- Facebook NU permite `truxel://` custom schemes în Valid OAuth URIs
- Workaround: Use Expo AuthSession universal links pentru Expo Go
- Native builds (EAS) pot folosi `truxel://` direct

## 🔗 Resources

- [Supabase Facebook Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook App Console](https://developers.facebook.com/apps/)
- [Expo Web Browser Docs](https://docs.expo.dev/versions/latest/sdk/webbrowser/)

---

## 📝 Summary

**Current State:**
- ✅ UI fully implemented (button, styling, translations)
- ✅ Generic OAuth flow ready (reuses Google implementation)
- ⚠️ Supabase provider NOT configured yet
- ⚠️ Cannot test until Supabase config complete

**To Make It Work:**
1. Create Facebook App (15 min)
2. Configure Supabase (5 min)
3. Test and verify (10 min)
4. **Total: ~30 minutes to go live**

**Technical Debt:**
- No Facebook SDK (uses browser OAuth)
- No Facebook-specific error handling
- No analytics tracking yet

**Recommendation:**
If you want the **best UX**, consider using `expo-facebook` SDK for native in-app login (like Apple Sign In). Otherwise, current browser-based implementation is good enough and works on all platforms.

---

**Last Updated:** November 18, 2025  
**Status:** UI Ready - Awaiting Supabase Configuration
