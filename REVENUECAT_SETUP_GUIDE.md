# RevenueCat Setup Guide pentru Truxel

## Problema identificată

Ofertele RevenueCat nu apar în aplicație pentru că:
1. ✅ **SDK-ul web nu era inițializat** - FIXAT în acest commit
2. ❓ **Lipsesc produse sau offerings în RevenueCat Dashboard** - trebuie verificat
3. ❓ **Produsele nu au pricing pentru EUR/USD** - trebuie verificat

## Ce am fixat în cod

### 1. Inițializare Web SDK (`app/_layout.tsx`)
- Acum detectează corect platforma web și inițializează SDK-ul
- Web SDK se inițializează lazy când este apelat prima dată
- Logging îmbunătățit pentru debugging

### 2. Logging îmbunătățit (`services/revenueCatService.ts`)
- Afișează toate produsele disponibile ÎNAINTE de filtrare
- Arată ce produse sunt filtrate și de ce
- Mesaje clare despre currency detection și probleme

## Ce trebuie verificat în RevenueCat Dashboard

### Pasul 1: Verifică Products (Produse)

1. Mergi la **RevenueCat Dashboard** → **Products**
2. Verifică că ai creat produsele în Store Connect (iOS) și Google Play Console (Android):

#### Subscriptions (Abonamente):
- `truxel_standard_monthly` sau similar
- `truxel_pro_monthly`
- `truxel_fleet_manager_monthly`

#### One-time purchases (Search Packs):
- `truxel_search_pack_10`
- `truxel_search_pack_50`
- `truxel_search_pack_100`

#### IMPORTANT pentru Web:
- Pentru **web (Stripe)**, trebuie să creezi produsele în **Stripe Dashboard**
- Apoi conectezi Stripe cu RevenueCat în RevenueCat Dashboard → Settings → Integrations → Stripe
- RevenueCat va importa automat produsele Stripe

### Pasul 2: Verifică Entitlements

1. Mergi la **RevenueCat Dashboard** → **Entitlements**
2. Verifică că ai creat entitlements:
   - `standard_access` (pentru standard tier)
   - `pro_access` (pentru pro tier)
   - `fleet_manager_access` (pentru fleet manager tier)
   - `search_credits` (pentru search packs)

### Pasul 3: Creează Offerings

Acesta este cel mai IMPORTANT pas!

1. Mergi la **RevenueCat Dashboard** → **Offerings**
2. Creează un offering pentru **Subscriptions**:
   - Identifier: `default` (sau alt nume)
   - Adaugă packages:
     - `$rc_monthly` → truxel_standard_monthly → entitlement: standard_access
     - `custom_pro_monthly` → truxel_pro_monthly → entitlement: pro_access
     - `custom_fleet_monthly` → truxel_fleet_manager_monthly → entitlement: fleet_manager_access

3. Creează un offering pentru **Search Packs** (optional):
   - Identifier: `search_packs`
   - Adaugă packages:
     - `custom_pack_10` → truxel_search_pack_10 → entitlement: search_credits
     - `custom_pack_50` → truxel_search_pack_50 → entitlement: search_credits
     - `custom_pack_100` → truxel_search_pack_100 → entitlement: search_credits

4. **SETEAZĂ OFFERING-UL CA "CURRENT"** (cel mai important!)
   - Click pe offering-ul pentru subscriptions
   - Click pe butonul "Make Current" sau bifează "Current Offering"

### Pasul 4: Verifică Pricing

Pentru fiecare produs, verifică că are pricing setat pentru:
- **EUR** (Europa)
- **USD** (SUA, Canada, Mexic)

Codul filtrează automat produsele după currency bazat pe locale-ul device-ului.

### Pasul 5: Verifică Integration Keys

În `.env` ai următoarele chei:
```
TRUXEL_REVENUECAT_IOS_KEY=appl_bumYuiDXpITzaTYFavBtEbehTSx
TRUXEL_REVENUECAT_ANDROID_KEY=goog_xxx  ⚠️ TREBUIE COMPLETATĂ!
TRUXEL_REVENUECAT_WEB_KEY=rcb_GzDLpbJWWnHsaOkScIXNdwaDmhZm
```

Pentru Android:
1. Mergi la RevenueCat Dashboard → Settings → API Keys
2. Copiază cheia pentru Android
3. Actualizează în `.env`: `TRUXEL_REVENUECAT_ANDROID_KEY=goog_....`

## Cum să testezi

### 1. Test pe Web

```bash
npm run web
```

Deschide browser console și caută:
```
🌐 Web platform detected - RevenueCat will initialize on-demand
📦 Loading RevenueCat offerings for user: ...
🌐 Initializing RevenueCat Web SDK...
📦 Available packages in current offering: [...]
✅ Filtered to X subscriptions and Y search packs for EUR
```

### 2. Test pe iOS (TestFlight)

1. Build și upload la TestFlight
2. Instalează pe device
3. Deschide Console app pe Mac
4. Conectează device-ul
5. Filtrează logs după "RevenueCat"

### 3. Test pe Android

```bash
npx react-native run-android
```

Deschide Logcat și caută "RevenueCat".

## Debugging

Dacă ofertele tot nu apar, verifică console logs:

### Log: "⚠️ No current offering found"
→ **Soluție**: Creează offerings în Dashboard și setează unul ca "current"

### Log: "⏭️ Skipping package X (currency: USD, wanted: EUR)"
→ **Soluție**: Produsele nu au pricing pentru currency-ul dorit (EUR/USD)

### Log: "⚠️ No packages found for currency: EUR"
→ **Soluție**: Adaugă pricing EUR la toate produsele în Store Connect/Play Console

### Log: "❌ Error fetching offerings: [error]"
→ **Soluție**: Verifică API keys și integrările (Stripe pentru web)

## Resurse

- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [RevenueCat Docs - Offerings](https://www.revenuecat.com/docs/entitlements)
- [RevenueCat Docs - Web Purchases](https://www.revenuecat.com/docs/web)
- [Stripe Dashboard](https://dashboard.stripe.com/)

## Contact Support

Dacă problema persistă după verificarea pașilor de mai sus, contactează RevenueCat Support cu:
1. Screenshots din Dashboard (Products, Entitlements, Offerings)
2. Console logs din aplicație
3. Platform (web/iOS/Android) unde testezi
