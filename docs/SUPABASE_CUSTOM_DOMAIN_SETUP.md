# Supabase Custom Domain Setup

## Problema

Când utilizatorii fac login cu Google OAuth, văd mesajul:
```
You're signing back in to upxocyomsfhqoflwibwn.supabase.co
```

Acest mesaj expune URL-ul intern al bazei de date Supabase, ceea ce nu este profesional și poate ridica probleme de securitate.

## Soluția: Custom Domain

Supabase permite configurarea unui custom domain (ex: `api.truxel.app`) care va înlocui URL-ul implicit `upxocyomsfhqoflwibwn.supabase.co`. După configurare, utilizatorii vor vedea:
```
You're signing back in to api.truxel.app
```

---

## Pași de Configurare

### 1. Alege Subdomain-ul

Recomandări pentru subdomain:
- `api.truxel.app` - cel mai comun pentru API-uri
- `auth.truxel.app` - specific pentru autentificare
- `backend.truxel.app` - alternative

**Pentru acest ghid vom folosi: `api.truxel.app`**

---

### 2. Inițializează Custom Domain în Supabase

#### Opțiunea A: Prin CLI (Recomandat)

```bash
# Instalează Supabase CLI dacă nu îl ai
npm install -g supabase

# Login la Supabase
supabase login

# Inițializează custom domain
supabase domains create api.truxel.app --project-ref upxocyomsfhqoflwibwn

# Verifică statusul
supabase domains get --project-ref upxocyomsfhqoflwibwn
```

#### Opțiunea B: Prin Management API

```bash
curl -X POST https://api.supabase.com/v1/projects/upxocyomsfhqoflwibwn/custom-hostname/initialize \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"custom_hostname": "api.truxel.app"}'
```

**După inițializare, vei primi DNS records de configurat.**

---

### 3. Configurează DNS Records

Supabase va returna 2 tipuri de records:

#### A. CNAME Record (pentru routing)
```
Type: CNAME
Name: api
Value: upxocyomsfhqoflwibwn.supabase.co
TTL: 3600
```

#### B. TXT Record (pentru SSL validation)
```
Type: TXT
Name: _cf-custom-hostname.api
Value: <valoare generată de Supabase>
TTL: 3600
```

**Unde să adaugi records:**
1. Mergi la DNS provider-ul tău (ex: Cloudflare, GoDaddy, Namecheap)
2. Găsește secțiunea "DNS Management" pentru `truxel.app`
3. Adaugă ambele records conform valorilor primite de la Supabase

**⏳ Așteptare:** DNS propagation poate dura 5 minute - 48 ore (de obicei ~15 minute).

---

### 4. Verifică și Activează Custom Domain

```bash
# Verifică statusul DNS și SSL
supabase domains get --project-ref upxocyomsfhqoflwibwn

# Când statusul e "active", activează domeniul
supabase domains activate --project-ref upxocyomsfhqoflwibwn
```

**Statusuri posibile:**
- `1_not_started` - DNS records nu au fost configurate
- `2_pending_validation` - DNS propagating, SSL generating
- `active` - Gata de activare

---

### 5. Actualizează OAuth Providers

După activarea custom domain-ului, **OBLIGATORIU** actualizează redirect URLs în:

#### Google Cloud Console
1. Mergi la [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `truxel-app`
3. **APIs & Services** → **Credentials**
4. Edit OAuth 2.0 Client ID
5. **Authorized redirect URIs**:
   ```
   # Păstrează cele existente ȘI adaugă:
   https://api.truxel.app/auth/v1/callback
   ```

#### Apple Developer Console
1. Mergi la [Apple Developer](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Select `com.cioravabogdan.truxel`
4. **Sign In with Apple** → **Configure**
5. **Return URLs**:
   ```
   # Păstrează cele existente ȘI adaugă:
   https://api.truxel.app/auth/v1/callback
   ```

#### Supabase Dashboard
1. Mergi la [Supabase Dashboard](https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/auth/url-configuration)
2. **Authentication** → **URL Configuration**
3. **Redirect URLs** (add):
   ```
   https://api.truxel.app/**
   truxel://**
   ```

---

### 6. Actualizează Codul Aplicației

#### A. Actualizează Supabase Client (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// 🔥 Folosește custom domain-ul în loc de URL-ul implicit
const supabaseUrl = 'https://api.truxel.app'; // ✅ NU mai folosi upxocyomsfhqoflwibwn.supabase.co
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

#### B. Verifică Environment Variables

În `.env` și `app.config.js`:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://api.truxel.app
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```javascript
// app.config.js
export default {
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://api.truxel.app',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  }
}
```

#### C. Nu e nevoie să modifici OAuth Service

`services/oauthService.ts` va funcționa automat cu noul domain deoarece folosește Supabase SDK:

```typescript
// Acest cod va folosi automat custom domain-ul
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: Platform.OS === 'web' ? window.location.origin : 'truxel://auth/callback',
  },
});
```

---

### 7. Testează OAuth Flow

#### Pe Web:
```bash
npx expo start --web
```
1. Click "Sign in with Google"
2. **Verifică URL-ul Google consent screen** - ar trebui să vadă `api.truxel.app` în loc de `upxocyomsfhqoflwibwn.supabase.co`
3. Confirmă autentificarea
4. Check redirect înapoi în app

#### Pe iOS/Android:
```bash
npx expo start
```
Aceeași verificare - mesajul Google ar trebui să arate custom domain-ul.

---

## Troubleshooting

### DNS nu se propagă
```bash
# Verifică DNS cu dig
dig api.truxel.app

# Verifică cu nslookup
nslookup api.truxel.app
```

### SSL Certificate Errors
- Așteaptă până statusul devine "active" în `supabase domains get`
- SSL-ul este generat automat de Cloudflare/Supabase (Let's Encrypt)

### OAuth Redirect Errors
- Verifică că ai actualizat **toate** provider-ele (Google, Apple)
- Confirmă că redirect URLs din Supabase Dashboard includ noul domain

### App nu se conectează
```bash
# Clear cache și reinstall
rm -rf node_modules
npm install

# Pe iOS
cd ios && pod install && cd ..

# Rebuild
npx expo run:ios
npx expo run:android
```

---

## Rollback Plan

Dacă ceva nu merge, poți reveni la URL-ul vechi:

1. **În cod:** Schimbă `supabaseUrl` înapoi la `https://upxocyomsfhqoflwibwn.supabase.co`
2. **OAuth providers:** Păstrează redirect URLs vechi active
3. **DNS:** Lasă records configurate (nu interferează cu funcționalitatea veche)

---

## Costuri

- **Supabase Custom Domain:** GRATUIT pe toate planurile (Free, Pro, Team, Enterprise)
- **DNS:** Gratuit (majoritatea provider-ilor)
- **SSL Certificate:** Gratuit (generat automat)

---

## Referințe

- [Supabase Custom Domains Docs](https://supabase.com/docs/guides/platform/custom-domains)
- [Supabase CLI Domains](https://supabase.com/docs/reference/cli/supabase-domains)
- [Google OAuth Setup](https://console.cloud.google.com)
- [Apple Sign In Setup](https://developer.apple.com/account)

---

## Summary

După configurarea custom domain-ului:
- ✅ Utilizatorii văd `api.truxel.app` în loc de `upxocyomsfhqoflwibwn.supabase.co`
- ✅ Branding profesional
- ✅ Securitate sporită (URL-ul bazei de date nu mai e public)
- ✅ Gratis, fără costuri suplimentare
- ✅ SSL automat, fără configurare manuală
