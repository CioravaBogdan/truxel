# 🔴 URGENT: Fix Web OAuth - Add Redirect URL to Supabase

## Problem
Web Google OAuth fails with: `{"error":"requested path is invalid"}`

## Root Cause
`http://localhost:8081` is **NOT** in the Supabase allowed redirect URLs list.

## ✅ Solution - Add to Supabase Dashboard

### Step 1: Open Supabase URL Configuration
Go to: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/url-configuration

### Step 2: Add These Redirect URLs

In the **"Redirect URLs"** section, add:

```
http://localhost:8081
http://localhost:8082
http://localhost:19000
http://localhost:19006
https://truxel.app
https://www.truxel.app
truxel://*
```

### Step 3: Click "Save"

### Step 4: Test Web OAuth
1. Open `http://localhost:8081`
2. Click "Sign in with Google"
3. Should work now! ✅

## Why This Fixes It

- Supabase validates **every** redirect URL against an allowlist
- When `window.location.origin` returns `http://localhost:8081`, Supabase checks if it's allowed
- If not in the list → `"requested path is invalid"` error
- After adding it → OAuth flow completes successfully

## Current State

✅ **iOS**: Works (using `truxel://auth/callback`)  
❌ **Web**: Fails (needs `http://localhost:8081` in Supabase)  
⏸️ **Android**: Requires dev build (Expo Go limitation)

## Next Steps

1. Add URLs to Supabase dashboard (see above)
2. Test web OAuth
3. For Android: Build with `npx expo run:android` (when emulator ready)
