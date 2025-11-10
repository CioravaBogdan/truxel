# 🔧 Fix: Apple Sign In "Unacceptable Audience" Error

**Date**: November 10, 2025  
**Error**: "Unacceptable audience in id_token: [io.truxel.app]"  
**Status**: FIXABLE ✅

---

## 🔍 Root Cause

Apple Sign In a funcționat prima dată, dar a doua oară dă eroare pentru că:

1. **Prima dată**: Token generat cu audience `host.exp.Exponent` (Expo Go)
2. **A doua oară**: App rulează în TestFlight cu bundle ID `io.truxel.app`
3. **Apple cached token** și îl refolosește
4. **Supabase rejectează** pentru că audience nu match

---

## ✅ Immediate Fix (5 minute)

### Step 1: Update Supabase Auth Settings

Go to: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/providers

**Apple Provider Settings**:
```
Service ID (Client ID): io.truxel.app
Bundle ID: io.truxel.app
Team ID: 74H8XT947X
Key ID: [Your P8 key ID]
```

**⚠️ Important**: Service ID MUST match Bundle ID `io.truxel.app`

---

### Step 2: Configure Apple Developer Console

1. Go to: https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Create **New Service ID** (if not exists):
   - Description: "Truxel Auth"
   - Identifier: `io.truxel.app` (SAME as bundle ID)
3. Configure Service ID:
   - ✅ Enable "Sign In with Apple"
   - ✅ Click "Configure"
   - Primary App ID: `io.truxel.app`
   - Domains: `upxocyomsfhqoflwibwn.supabase.co`
   - Return URLs: `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`

---

### Step 3: Revoke Apple Sign In on Device

**On iPhone**:
```
Settings → Apple ID → Password & Security → Apps Using Your Apple ID
→ Find "Truxel" → Stop Using Apple ID
```

This clears cached tokens and forces fresh authentication.

---

### Step 4: Test Again

1. Open Truxel app from TestFlight
2. Tap "Sign in with Apple"
3. Should work now with correct audience

---

## 🔄 Why This Happens

### Token Lifecycle:
```
First Login (Expo Go):
  Apple generates token with audience: "host.exp.Exponent"
  → Supabase accepts (Expo Go is allowed)
  → Token cached by Apple

Second Login (TestFlight):
  Apple reuses cached token with audience: "host.exp.Exponent"
  → App sends with bundle ID "io.truxel.app"
  → Supabase rejects: "Audience mismatch!"
```

### Solution:
```
1. Revoke old token (Settings → Apple ID)
2. Configure Service ID to match Bundle ID
3. Fresh login generates new token with correct audience
```

---

## 🧪 Verification

**After Fix, Logs Should Show**:
```
LOG  Starting Apple Sign In...
LOG  Requesting Apple credentials...
LOG  Apple credentials received: { hasIdentityToken: true, hasEmail: true }
LOG  Signing in to Supabase with Apple token...
LOG  Apple Sign In successful! { hasSession: true, hasUser: true }
```

**If Still Error**:
```
ERROR  Unacceptable audience in id_token: [io.truxel.app]
```
→ Service ID not configured correctly in Apple Developer

---

## 📋 Checklist

- [ ] Supabase: Service ID = `io.truxel.app`
- [ ] Apple Developer: Service ID created with identifier `io.truxel.app`
- [ ] Apple Developer: Sign In with Apple enabled for Service ID
- [ ] Apple Developer: Return URL = `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`
- [ ] iPhone: Revoked Apple Sign In for Truxel app
- [ ] TestFlight: App restarted
- [ ] Test: Sign in with Apple works

---

## 🎯 Expected Behavior After Fix

### Login Flow:
```
User taps "Sign in with Apple"
  → Face ID prompt appears
  → User authenticates
  → Apple generates NEW token with audience "io.truxel.app"
  → Supabase accepts token ✅
  → User logged in successfully
  → Profile loaded
  → Redirected to Home tab
```

### No More Errors:
- ✅ Loading spinner disappears after login
- ✅ No "Unacceptable audience" error
- ✅ Session persists correctly
- ✅ Logout/login cycle works smoothly

---

## 🔧 Alternative: Clear App Data

If revoking doesn't work:

**On iPhone**:
```
Settings → General → iPhone Storage
→ Find "Truxel"
→ Delete App
→ Reinstall from TestFlight
```

This completely clears cached tokens.

---

## 📞 Debugging Commands

**Check Current Token**:
```typescript
// In app
const { data: { session } } = await supabase.auth.getSession();
console.log('Token audience:', session?.user?.aud);
```

**Expected**: `io.truxel.app`  
**If Wrong**: `host.exp.Exponent` → Revoke and try again

---

**Status**: Ready to fix - just needs Service ID configuration in Apple Developer Console + revoke on device
