# Android OAuth "Invalid Path" Fix

## Problema

La Google OAuth pe Android apare eroarea: **"request path it's invalid"**

## Cauza

`makeRedirectUri()` din `expo-auth-session` generează un URL specific pentru Android care **trebuie whitelistat în Supabase Dashboard**.

## Soluție: 3 Pași

### 1. Rulează app-ul și vezi exact ce URL se generează

```bash
npx expo start
# Scanează QR cu Expo Go
# Click "Sign in with Google"
# Verifică în console:
```

Vei vedea ceva gen:
```
📱 Using Expo redirect URI: https://auth.expo.io/@cioravabogdan/truxel
📱 Platform: android
📱 App scheme from config: truxel
```

**SAU** (dacă custom scheme funcționează):
```
📱 Using Expo redirect URI: truxel://
```

### 2. Adaugă URL-ul în Supabase Dashboard

1. Mergi la [Supabase Dashboard](https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/url-configuration)
2. **Authentication** → **URL Configuration**
3. **Redirect URLs** → Click "Add URL"
4. Adaugă exact URL-ul văzut în console:

**Dacă vezi universal link Expo:**
```
https://auth.expo.io/@cioravabogdan/truxel
```

**Dacă vezi custom scheme:**
```
truxel://*
```

**Recomandare:** Adaugă AMBELE pentru compatibility:
```
https://auth.expo.io/@cioravabogdan/truxel
truxel://*
```

5. Click "Save"

### 3. Re-test OAuth

```bash
# Restart Expo
npx expo start

# Scanează QR
# Click "Sign in with Google"
# ✅ Ar trebui să funcționeze acum!
```

---

## De ce apare eroarea?

Supabase validează că `redirectTo` URL-ul din OAuth request e whitelistat în dashboard. Dacă URL-ul nu e în listă → **"invalid path" error**.

`makeRedirectUri()` generează automat URL-ul potrivit pentru fiecare platformă:
- **iOS**: `truxel://` (custom scheme)
- **Android Expo Go**: `https://auth.expo.io/@owner/slug` (universal link fallback)
- **Android standalone**: `truxel://` (custom scheme)
- **Web**: `window.location.origin`

---

## Testare în Production Build

### Android (EAS Build)

```bash
# Build pentru testing
eas build --platform android --profile preview

# După build, instalează APK pe device
# OAuth va folosi custom scheme truxel:// direct
```

### iOS (EAS Build)

```bash
# Build pentru testing
eas build --platform ios --profile preview

# OAuth va folosi custom scheme truxel:// direct
```

---

## Troubleshooting

### Încă primesc "invalid path" după whitelist

**Verifică:**
1. URL-ul din console e **exact** cel adăugat în Supabase (nu uita `/` la final dacă apare)
2. Ai dat "Save" în Supabase Dashboard
3. Ai restartat Expo după modificare (`r` in terminal sau restart complet)

**Debug:**
```typescript
// În login.tsx, logging-ul e deja activat:
console.log('📱 Using Expo redirect URI:', redirectTo);
```

Compară exact ce apare aici cu ce ai în Supabase allowlist.

### OAuth se deschide dar nu revine în app

**Cauză:** Deep link handling nu funcționează în Expo Go pe Android.

**Soluție:** Folosește development build:
```bash
npx expo run:android
```

Sau build cu EAS:
```bash
eas build --platform android --profile development
```

### Browser rămâne deschis după OAuth

**Cauză:** `WebBrowser.maybeCompleteAuthSession()` lipsește.

**Soluție:** ✅ Deja adăugat în `login.tsx`:
```typescript
WebBrowser.maybeCompleteAuthSession(); // La început
```

---

## URLs de Whitelistat (Checklist Complet)

În **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**, trebuie să ai:

### Development (Expo Go)
```
https://auth.expo.io/@cioravabogdan/truxel
```

### Production & Dev Builds
```
truxel://*
```

### Web (localhost)
```
http://localhost:8081
http://localhost:8082
```

### Web (production)
```
https://truxel.app
https://www.truxel.app
```

**Nota:** Wildcard `*` nu funcționează în root (ex: `truxel://*` e OK, dar `https://*` nu e permis).

---

## Production Ready Checklist

- [x] ✅ `makeRedirectUri()` generat dinamic (platform-aware)
- [x] ✅ Logging activat pentru debug redirect URLs
- [x] ✅ `WebBrowser.maybeCompleteAuthSession()` adăugat
- [x] ✅ `QueryParams.getQueryParams()` pentru token extraction
- [x] ✅ Error handling pentru cancelled/failed OAuth
- [ ] ⚠️ Whitelist redirect URLs în Supabase (manual step - vezi pasul 2)
- [ ] 🔄 Test în Expo Go (poate avea limitări deep linking)
- [ ] 🎯 Test în EAS preview build (recommended pentru OAuth final testing)

---

## Quick Fix Summary

**Problema:** `"request path it's invalid"` pe Android OAuth

**Fix:**
1. Run app → vezi console pentru redirect URL
2. Copy URL-ul exact
3. Supabase Dashboard → Add to Redirect URLs
4. Restart app → OAuth funcționează

**Production:** În EAS builds, OAuth va funcționa perfect cu custom scheme `truxel://`.
