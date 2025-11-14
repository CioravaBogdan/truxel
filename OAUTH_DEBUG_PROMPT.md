# OAuth Debug Prompt - Status Actual Probleme

## Context
Aplicație Expo/React Native cu OAuth Google prin Supabase. User raportează următoarele:

## Status Curent (14 Nov 2025)

### ✅ CE FUNCȚIONEAZĂ:
1. **Web OAuth** - funcționează PERFECT
2. **iOS Logout** - funcționează după fix-ul RevenueCat initialization tracking
3. **RevenueCat** - tracking proper al inițializării, nu mai crash-uiește

### ❌ CE NU FUNCȚIONEAZĂ:

#### iOS Login (Expo Go)
**Eroare:** "requested path is invalid"
**User Report:** "acum merge log out pe ios, dar la log in am requested path is invalid"

#### Android Login (Expo Go)  
**Eroare:** "request path is invalid" (aceeași eroare)
**User Report:** "android are aceeasi eroare"

## Cod Relevant

### app/(auth)/login.tsx - handleGoogleSignIn()
```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);

    if (Platform.OS === 'web') {
      // Web: Use direct redirect flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } else {
      // Mobile: Use recommended Expo auth flow with makeRedirectUri
      const redirectTo = makeRedirectUri();
      console.log('📱 Using Expo redirect URI:', redirectTo);
      console.log('📱 Platform:', Platform.OS);
      console.log('📱 App scheme from config:', Constants.expoConfig?.scheme);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('❌ Supabase OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('🔗 Opening OAuth URL...');
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (result.type === 'success') {
          console.log('✅ OAuth redirect successful');
          const { url } = result;
          
          // Extract tokens using QueryParams (recommended by Supabase)
          const { params, errorCode } = QueryParams.getQueryParams(url);
          
          if (errorCode) {
            throw new Error(errorCode);
          }

          const { access_token, refresh_token } = params;

          if (!access_token) {
            throw new Error('No access token received');
          }

          // Set session with tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) throw sessionError;

          Toast.show({
            type: 'success',
            text1: t('auth.login_success'),
          });
        } else if (result.type === 'cancel') {
          Toast.show({
            type: 'info',
            text1: t('common.cancel'),
            text2: 'Sign in cancelled',
          });
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Google Sign In error:', error);
    Toast.show({
      type: 'error',
      text1: t('common.error'),
      text2: error.message || 'Authentication failed',
    });
  } finally {
    setIsLoading(false);
  }
};
```

### app.config.js - Relevant Config
```javascript
{
  expo: {
    scheme: "truxel",
    owner: "cioravabogdan",
    slug: "truxel",
    android: {
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "truxel", host: "*" }],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## Supabase Dashboard - Redirect URLs (Screenshot Confirmation)

**URLs deja configurate în Supabase:**
```
✅ truxel://auth/callback
✅ truxel://subscription-success
✅ truxel://subscription-cancelled
✅ truxel://purchase-success
✅ truxel://purchase-cancelled
✅ https://truxel.io
✅ http://localhost:8081
✅ http://localhost:8082
✅ https://truxel.app
✅ https://www.truxel.app
✅ https://www.truxel.io
✅ truxel://*
✅ http://localhost:19000
✅ https://auth.expo.io/@cioravabogdan/truxel  <-- ACEST URL E DEJA ADĂUGAT!
```

## Ce Generează makeRedirectUri() (Teorie)

Conform documentației Expo AuthSession:
- **Expo Go iOS:** probabil `exp://192.168.X.X:8081` SAU `https://auth.expo.io/@cioravabogdan/truxel`
- **Expo Go Android:** probabil `exp://192.168.X.X:8081` SAU `https://auth.expo.io/@cioravabogdan/truxel`
- **Development Build:** `truxel://`
- **Web:** `window.location.origin`

## Problema Suspectată

Logging-ul din cod printează:
```
📱 Using Expo redirect URI: [NECUNOSCUT - user nu a furnizat output-ul console]
📱 Platform: ios/android
📱 App scheme from config: truxel
```

**CRITICAL:** Nu știm exact ce URL generează `makeRedirectUri()` pentru că user-ul nu a furnizat output-ul din console!

## Ipoteze de Verificat

### Ipoteza 1: makeRedirectUri() generează IP-based URL
`exp://192.168.1.100:8081` - acest URL NU e în Supabase allowlist!

**Test:**
```typescript
// Înlocuiește makeRedirectUri() cu hardcoded URL pentru test
const redirectTo = 'https://auth.expo.io/@cioravabogdan/truxel';
```

### Ipoteza 2: Supabase invalidează URL-ul din alt motiv
Verifică exact ce eroare returnează Supabase:
```typescript
if (error) {
  console.error('❌ Supabase OAuth FULL error:', JSON.stringify(error, null, 2));
  throw error;
}
```

### Ipoteza 3: makeRedirectUri() are comportament diferit decât documentația
Adaugă mai mult logging ÎNAINTE de Supabase call:
```typescript
const redirectTo = makeRedirectUri();
console.log('=== REDIRECT DEBUG ===');
console.log('Generated redirectTo:', redirectTo);
console.log('Type:', typeof redirectTo);
console.log('Constants.executionEnvironment:', Constants.executionEnvironment);
console.log('Constants.appOwnership:', Constants.appOwnership);
console.log('======================');
```

## Task pentru Următorul LLM

### 1. VERIFICĂ MAI ÎNTÂI
- [ ] Citește COMPLET acest document
- [ ] Verifică că ai înțeles: iOS și Android au ACEEAȘI eroare "invalid path", dar Web funcționează
- [ ] Confirmă că `https://auth.expo.io/@cioravabogdan/truxel` E DEJA în Supabase allowlist (vezi screenshot)

### 2. DIAGNOSTICARE
- [ ] Adaugă logging extins în `handleGoogleSignIn()` pentru a vedea EXACT ce URL generează `makeRedirectUri()`
- [ ] Rulează app pe iOS/Android Expo Go
- [ ] Capturează EXACT output-ul console când user dă click pe "Sign in with Google"
- [ ] Compară URL-ul generat cu lista din Supabase Dashboard

### 3. FIX BAZAT PE OUTPUT
**Dacă `makeRedirectUri()` generează `exp://192.168.X.X:8081`:**
- Adaugă `exp://*` în Supabase redirect URLs
- SAU folosește `preferLocalhost: true` în makeRedirectUri() options
- SAU hardcode `https://auth.expo.io/@cioravabogdan/truxel` pentru Expo Go

**Dacă `makeRedirectUri()` generează URL valid dar Supabase respinge:**
- Verifică error details complet din Supabase response
- Posibil issue cu Supabase SDK version sau config

**Dacă altceva:**
- Documentează ce URL exact apare și de ce e invalid

### 4. NU PRESUPUNE
- ❌ NU presupune că știi ce URL generează makeRedirectUri() fără să verifici în console
- ❌ NU adaugi URL-uri random în Supabase fără să confirmi că sunt generate de cod
- ❌ NU rescrii codul fără să înțelegi de ce versiunea curentă eșuează

### 5. RAPORTEAZĂ ÎNAPOI
Oferă user-ului:
1. Ce URL EXACT generează makeRedirectUri() pe iOS și Android
2. De ce acel URL nu e acceptat de Supabase (cu dovezi din logs)
3. Fix-ul specific pentru acel URL (adaugă în Supabase SAU modifică cod pentru a genera URL diferit)

## Fișiere Relevante pentru Investigare
- `app/(auth)/login.tsx` - OAuth flow principal
- `services/oauthService.ts` - OAuth helper functions (DEPRECAT, nu mai e folosit în login.tsx)
- `app.config.js` - Expo scheme config
- `lib/supabase.ts` - Supabase client setup

## Resurse Documentație
- [Expo AuthSession.makeRedirectUri()](https://docs.expo.dev/versions/latest/sdk/auth-session/#makeredirecturi)
- [Supabase Auth with React Native](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
- [Expo Deep Linking](https://docs.expo.dev/guides/deep-linking/)

## Note Finale
User-ul e frustrat pentru că presupunem soluții fără să verificăm output-ul real din console. Următorul LLM TREBUIE să înceapă cu diagnosticare completă bazată pe logging, NU cu presupuneri despre ce URL-uri ar trebui să fie în Supabase.
