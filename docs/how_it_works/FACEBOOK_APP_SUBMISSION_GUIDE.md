# Facebook App Submission Guide

Acest ghid conține **exact** textele pe care trebuie să le copiezi în formularele din Facebook Developer Console, bazat pe configurația actuală a aplicației Truxel.

---

## 1. Settings → Basic (Screenshot 1 - VEZI IMAGINEA)

Completează câmpurile:

| Câmp | Ce scrii EXACT | Notă |
|------|----------------|------|
| **App ID** | `912711708582826` | ✅ Corect deja |
| **App secret** | *(hidden)* | ✅ Corect deja |
| **Display name** | `Truxel` | ✅ Corect deja |
| **Namespace** | *(lasă gol)* | Opțional |
| **App domains** | `truxel.io`<br>`truxel.app`<br>`www.truxel.app`<br>`upxocyomsfhqoflwibwn.supabase.co` | ✅ Ai deja unele, adaugă celelalte |
| **Contact email** | `office@truxel.io` | ✅ Corect deja |
| **Privacy policy URL** | `https://truxel.io/privacy` | ✅ Corect deja |
| **Terms of Service URL** | `https://truxel.io/terms` | ✅ Corect deja |
| **User data deletion** | Selectează: **Data deletion instructions URL**<br>Apoi scrie: `https://truxel.io/data-deletion` | ⚠️ **SCHIMBĂ DIN `/terms` ÎN `/data-deletion`** |
| **Category** | `Business and pages` | ✅ Corect deja |

**Data Protection Officer (jos pe pagină):**
| Câmp | Ce scrii EXACT |
|------|----------------|
| **Name** | `Ciorava Bogdan` | ✅ Corect deja |
| **Email** | `cioravageorgebogdan@gmail.com` | ✅ Corect deja |
| **Street Address** | `Strada Tudor Vladimirescu` | ✅ Corect deja |
| **Apt/Suite/Other** | `185` | ✅ Corect deja |
| **City/District** | `Sat Podu Turcului` | ✅ Corect deja |
| **State/Province/Region** | `Bacău` | ✅ Corect deja |
| **ZIP/Postal Code** | `607450` | ✅ Corect deja |
| **Country** | `Romania` | ✅ Corect deja |

---

## 2. Select Platform (Screenshot 2 - "Select platform" dialog)

Trebuie să adaugi platformele. Click pe "Add Platform" și selectează:
- ✅ **Website**
- ✅ **iOS**
- ✅ **Android**

Click **Next** după ce le-ai bifat pe toate 3.

---

## 3. Platform: Website (după ce selectezi Website)

| Câmp | Ce scrii EXACT |
|------|----------------|
| **Site URL** | `https://truxel.app` |
| **Mobile Site URL** | *(lasă gol)* |

Click **Save**.

---

## 4. Platform: iOS (Screenshot 1 - VEZI IMAGINEA "iOS" form cu ERORILE)

⚠️ **PROBLEMA CRITICĂ:** Facebook cere ca aplicația să fie **LIVE pe App Store** minimum 24 ore înainte să poți completa iPhone/iPad Store ID.

### SOLUȚIE 1: Lasă gol pentru ACUM (Recomandat pentru TestFlight Beta)

| Câmp | Ce scrii EXACT | Explicație |
|------|----------------|------------|
| **Bundle ID** | `io.truxel.app` | Din `app.config.js` ✅ |
| **iPhone Store ID** | *(lasă gol)* | ⚠️ Completezi DUPĂ ce publici live pe App Store + aștepți 24h |
| **URL Scheme Suffix** | *(lasă gol)* | Opțional |
| **iPad Store ID** | *(lasă gol)* | ⚠️ Completezi DUPĂ ce publici live pe App Store + aștepți 24h |
| **Shared secret** | `45d310ca90494ce8bc04ed398f88d12d` | Din `.env` → `TRUXEL_IOS_APP_SHARED_SECRET` ✅ |
| **Log in-app events automatically** | ❌ **DEBIFEAZĂ (Toggle OFF)** | Pentru TestFlight NU ai nevoie de tracking |

### SOLUȚIE 2: Publică aplicația LIVE pe App Store (Pentru producție)

Dacă vrei să mergi live ACUM:
1. **App Store Connect** → Submit for Review
2. Așteaptă Apple Review (2-7 zile)
3. După aprobare, setează **Release** = "Automatically release this version"
4. Așteaptă **24 ore** după ce aplicația e LIVE
5. Revino la Facebook și completează:
   - **iPhone Store ID:** `6755073677`
   - **iPad Store ID:** `6755073677`

**⚠️ IMPORTANT pentru "Provide testing instructions" (jos pe pagină):**

Click pe **"Add or update instructions"** și scrie:

```
The Truxel iOS app is currently in private beta testing via TestFlight.

Testing Steps:
1. Install the TestFlight app from the App Store.
2. Please provide your email address, and we will send you an invitation to join the beta test.
3. Open the invitation email and tap "View in TestFlight".
4. Install the Truxel app from TestFlight.
5. Open Truxel and tap "Sign in with Facebook" on the login screen.
6. Authorize the Facebook login by accepting the requested permissions (Public Profile and Email).
7. Verify that you are successfully logged in and redirected to the app's main dashboard.

Note: The app is not yet published on the App Store. TestFlight invitation required for access.
```

---

## 5. Platform: Android (după ce selectezi Android)

| Câmp | Ce scrii EXACT | Explicație |
|------|----------------|------------|
| **Google Play Package Name** | `io.truxel.app` | Din `app.config.js` ✅ |
| **Class Name** | `io.truxel.app.MainActivity` | Standard pentru Expo ✅ |
| **Key Hashes** | *(lasă gol pentru acum)* | Vezi mai jos cum să le generezi când publici |

**Provide testing instructions:**
```
The Truxel Android app is currently in closed beta testing via Google Play.

Testing Steps:
1. Please provide your email address, and we will add you to the beta testers list.
2. Check your email for the Google Play beta invitation.
3. Open the Play Store and navigate to Truxel.
4. Install the beta version of the app.
5. Open Truxel and tap "Sign in with Facebook" on the login screen.
6. Authorize the Facebook login by accepting the requested permissions (Public Profile and Email).
7. Verify that you are successfully logged in and redirected to the app's main dashboard.

Note: The app is in closed beta. Beta tester invitation required for access.
```

**Key Hashes (când publici pe Google Play):**
- Mergi la Google Play Console → Release → Setup → App Integrity
- Copiază SHA-1 certificate fingerprint
- Convertește-l în Base64 și adaugă-l aici

---

## 6. Testing Instructions: Web (Screenshot 3 & 4 - "Testing instructions for Web")

**Unde găsești acest formular:** După ce adaugi platforma Website, Facebook îți cere testing instructions.

### Câmp 1: "Where can we find the app?"
```
https://truxel.app
```

### Câmp 2: "Provide instructions for accessing the app..."
```
1. Navigate to https://truxel.app in your web browser.
2. Click the "Sign In" button in the top navigation bar.
3. On the login screen, click the blue "Sign in with Facebook" button (with 'f' logo).
4. Log in with your Facebook credentials if prompted.
5. Accept the requested permissions: Public Profile and Email.
6. Verify that you are successfully logged in and redirected to the main app dashboard (search page).

The app is free to use with a trial tier. No payment required for testing.
```

### Câmp 3: "If payment or membership is required..."
```
The app is free to download and use. No payment required. Users start with a free trial tier that includes limited searches.
```

### Câmp 4: "If access to this app or any of its features is limited..."
```
No geographic restrictions. The app is accessible worldwide.
```

Click **Save** după ce completezi toate câmpurile.

---

## 7. CHECKLIST FINAL - Verifică înainte de Save

### Settings → Basic
- [ ] **User data deletion** = "Data deletion instructions URL" → `https://truxel.io/data-deletion`
- [ ] **App domains** include: `truxel.io`, `truxel.app`, `www.truxel.app`, `upxocyomsfhqoflwibwn.supabase.co`

### Platform: Website
- [ ] **Site URL** = `https://truxel.app`
- [ ] **Testing instructions** completate (vezi Secțiunea 6)

### Platform: iOS
- [ ] **Bundle ID** = `io.truxel.app`
- [ ] **iPhone Store ID** = *(lasă gol pentru TestFlight)*
- [ ] **iPad Store ID** = *(lasă gol pentru TestFlight)*
- [ ] **Shared secret** = `45d310ca90494ce8bc04ed398f88d12d`
- [ ] **Log in-app events** = ❌ OFF (pentru TestFlight)
- [ ] **Provide testing instructions** completate (vezi Secțiunea 4)

### Platform: Android
- [ ] **Google Play Package Name** = `io.truxel.app`
- [ ] **Class Name** = `io.truxel.app.MainActivity`
- [ ] **Testing instructions** completate (vezi Secțiunea 5)

---

## 8. După ce salvezi totul

1. Click **"Save changes"** în Settings → Basic
2. Mergi la **Facebook Login → Settings**
3. Adaugă **Valid OAuth Redirect URIs**:
   ```
   https://upxocyomsfhqoflwibwn.supabase.co/auth/v1/callback
   https://truxel.app/
   https://www.truxel.app/
   http://localhost:8081
   http://localhost:8082
   ```
4. Toggle **"Use Strict Mode for Redirect URIs"** = **OFF**
5. Click **Save Changes**

---

## 9. App Review (când ești gata să publici)

1. Mergi la **App Review → Permissions and Features**
2. Click **"Request Advanced Access"** pentru:
   - `email`
   - `public_profile`
3. Upload video demo + screenshots
4. Submit for review
5. Așteaptă 3-7 zile pentru approval
6. După approval: **Settings → Basic → App Mode → Switch to "Live"**

---

## 10. Resurse Utile

- **Facebook App Console:** https://developers.facebook.com/apps/912711708582826/
- **App Store Connect:** https://appstoreconnect.apple.com/
- **Google Play Console:** https://play.google.com/console/
- **Supabase Dashboard:** https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/

---

**Last Updated:** November 20, 2025  
**Status:** Ready for Platform Configuration
