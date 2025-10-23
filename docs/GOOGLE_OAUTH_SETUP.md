# Google Sign In Setup Guide

## 📋 Overview

This guide walks you through setting up Google Sign In for Truxel app using Supabase Auth.

## 🚀 Quick Start

### Prerequisites
- Google Account
- Supabase project: `upxocyomsfhqoflwibwn`
- App bundle ID: `com.truxel.app`

---

## Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create New Project
1. Click **"Select a project"** dropdown (top left)
2. Click **"NEW PROJECT"**
3. Project name: **"Truxel App"**
4. Organization: Leave as default
5. Click **"CREATE"**

### 1.3 Enable Google+ API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"Google+ API"**
3. Click on **"Google+ API"**
4. Click **"ENABLE"**

---

## Step 2: Configure OAuth Consent Screen

### 2.1 Go to OAuth Consent Screen
- Visit: https://console.cloud.google.com/apis/credentials/consent
- Select your project: **"Truxel App"**

### 2.2 Choose User Type
- Select: **"External"** (for public app)
- Click **"CREATE"**

### 2.3 Fill App Information

**App Information:**
- App name: `Truxel`
- User support email: `office@infant.ro`
- App logo: (Upload Truxel logo if available)

**App Domain:**
- Application home page: `https://truxel.app` (or leave empty)
- Application privacy policy link: (Optional)
- Application terms of service link: (Optional)

**Authorized Domains:**
- Add: `supabase.co`
- Add: `upxocyomsfhqoflwibwn.supabase.co`

**Developer Contact Information:**
- Email addresses: `office@infant.ro`

Click **"SAVE AND CONTINUE"**

### 2.4 Scopes
- Click **"ADD OR REMOVE SCOPES"**
- Select:
  - `userinfo.email` (View your email address)
  - `userinfo.profile` (View your basic profile info)
- Click **"UPDATE"**
- Click **"SAVE AND CONTINUE"**

### 2.5 Test Users (Optional)
- Add test users if in development mode
- Click **"SAVE AND CONTINUE"**

### 2.6 Summary
- Review settings
- Click **"BACK TO DASHBOARD"**

---

## Step 3: Create OAuth Client ID

### 3.1 Go to Credentials
- Visit: https://console.cloud.google.com/apis/credentials
- Click **"+ CREATE CREDENTIALS"**
- Select **"OAuth client ID"**

### 3.2 Create iOS Client ID

**Application Type:** iOS

**Name:** `Truxel iOS App`

**Bundle ID:** `com.truxel.app`

Click **"CREATE"**

**Save this Client ID!** You'll need it for Supabase.

Example: `123456789-abcdefgh.apps.googleusercontent.com`

### 3.3 Create Web Client ID (for Supabase)

Click **"+ CREATE CREDENTIALS"** again
- Select **"OAuth client ID"**

**Application Type:** Web application

**Name:** `Truxel Supabase`

**Authorized JavaScript origins:**
- Add: `https://upxocyomsfhqoflwibwn.supabase.co`

**Authorized redirect URIs:**
- Add: `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`

Click **"CREATE"**

**Save these credentials:**
- Client ID: `123456789-abcdefgh.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxxxxxxxxxxxxxxxxx`

---

## Step 4: Configure Supabase

### 4.1 Go to Supabase Auth Providers
- Visit: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/providers
- Find **"Google"** in the list
- Click to expand

### 4.2 Enable Google Provider

**Toggle ON:** "Enable Sign in with Google"

**Client ID (for OAuth):**
- Paste the **Web Client ID** from Step 3.3
- Example: `123456789-abcdefgh.apps.googleusercontent.com`

**Client Secret (for OAuth):**
- Paste the **Client Secret** from Step 3.3
- Example: `GOCSPX-xxxxxxxxxxxxxxxxxxxx`

**Authorized Client IDs (Optional):**
- Add the **iOS Client ID** from Step 3.2
- This allows native iOS app to use Google Sign In

**Redirect URL (Auto-configured):**
- Should already be: `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`
- This was set in Step 3.3

Click **"SAVE"**

---

## Step 5: Test the Integration

### 5.1 Restart Expo App
```bash
npx expo start --clear
```

### 5.2 Test Sign In Flow

1. Open app on iOS device or simulator
2. Go to Login screen
3. Click **"Sign in with Google"** button
4. Browser opens with Google Sign In
5. Select your Google account
6. Grant permissions
7. Redirected back to app
8. Logged in! ✅

### 5.3 Verify Profile Creation

Check Supabase Dashboard:
- Go to: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/users
- Find your new user
- Check `profiles` table for auto-created profile

---

## 🔐 Security Considerations

### OAuth Scopes
We request minimal scopes:
- `email` - Required for account identification
- `profile` - Optional, for user name

### Token Storage
- Access tokens stored securely by Supabase
- Refresh tokens handled automatically
- Session managed by Supabase Auth

### Deep Links
- App handles `truxel://` deep links
- OAuth redirects back to app after auth
- Session synced automatically

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** Redirect URI not authorized in Google Console

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit Web Client ID
3. Add: `https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback`
4. Save and try again

### Error: "invalid_client"

**Problem:** Client ID or Secret incorrect in Supabase

**Solution:**
1. Double-check Client ID and Secret in Google Console
2. Copy-paste exactly (no extra spaces)
3. Update in Supabase Auth Providers
4. Save and try again

### Error: "access_denied"

**Problem:** User denied permissions or OAuth consent screen not published

**Solution:**
1. If in testing mode, add user as test user in Google Console
2. Or publish OAuth consent screen for public access
3. User must grant email and profile permissions

### Google Sign In button not showing

**Problem:** `isGoogleAuthAvailable()` returns false

**Solution:**
- This shouldn't happen - Google OAuth works on all platforms
- Check console logs for errors
- Verify `signInWithGoogle` is imported in login.tsx

### Browser not opening on iOS

**Problem:** `Linking.openURL()` fails

**Solution:**
- Ensure URL scheme `truxel://` is configured in app.config.js
- Check iOS permissions for opening URLs
- Try on physical device (not simulator)

---

## 📱 Platform Support

### iOS
- ✅ Works in Expo Go
- ✅ Works in custom dev build
- ✅ Works in production build
- Opens Safari for OAuth
- Redirects back via deep link

### Android
- ✅ Should work (not tested yet)
- Opens Chrome for OAuth
- Redirects back via deep link

### Web
- ✅ Works directly in browser
- No deep links needed
- Seamless OAuth flow

---

## 🎨 UI Customization

### Google Button Design

Current design:
- White background
- Gray border
- Blue "G" logo (text-based)
- Black text

To add official Google logo:
1. Download SVG from: https://developers.google.com/identity/branding-guidelines
2. Use `react-native-svg` to render
3. Replace text "G" with SVG component

---

## 📊 Analytics

### Events to Track
- Google Sign In button clicked
- OAuth browser opened
- OAuth completed successfully
- OAuth failed/cancelled
- Profile created from Google auth

### User Data Available
- Email (always)
- Name (if granted)
- Profile picture URL (if granted)
- Google User ID (sub claim)

---

## 🚀 Production Checklist

Before launching:
- [ ] Publish OAuth consent screen in Google Console
- [ ] Add all production domains to authorized domains
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Verify profile creation in Supabase
- [ ] Test returning user flow
- [ ] Add error tracking (Sentry, etc.)
- [ ] Monitor OAuth success/failure rates

---

## 📚 Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

---

**Last Updated:** October 23, 2025  
**Status:** Ready to configure and test
