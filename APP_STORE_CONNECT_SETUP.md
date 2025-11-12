# App Store Connect - Setup Produse In-App Purchase

## 🚨 Problema actuală

În TestFlight, nu apar **toate** planurile de abonament (Standard, Pro, Fleet Manager).

Doar planul curent (Standard) este vizibil.

## 🔍 Cauza probabilă

Din `PRODUCTS_MAPPING_COMPLETE.md` (generat pe 10 noiembrie):
```
### iOS PRODUCTS (App Store Connect)
1. Standard Plan - Monthly: "Could not check" ⚠️
2. Pro Plan - Monthly: "Could not check" ⚠️
3. Fleet Manager - Monthly: "Could not check" ⚠️
```

Aceasta înseamnă că produsele **NU** sunt create în App Store Connect sau au status **"Ready to Submit"** în loc de **"Approved"**.

## ✅ Soluție: Creează produsele în App Store Connect

### Pas 1: Accesează App Store Connect

1. Mergi la [App Store Connect](https://appstoreconnect.apple.com/)
2. Login cu Apple ID-ul tău de developer
3. Selectează **Truxel** (Bundle ID: `io.truxel.app`)

### Pas 2: Navighează la In-App Purchases

1. Click pe **Features** în sidebar
2. Click pe **In-App Purchases**
3. Verifică dacă produsele există deja

### Pas 3: Creează produsele (dacă nu există)

#### Produsul 1: Standard Plan - Monthly

1. Click **+ (Create)** → **Auto-Renewable Subscription**
2. **Reference Name**: `Standard Plan - Monthly`
3. **Product ID**: `truxel_2999_1month`
4. **Subscription Group**: `Truxel Subscriptions` (creează dacă nu există)
5. **Subscription Duration**: `1 Month`
6. **Price**:
   - US: `$29.99`
   - RO: `129 RON` (sau echivalent EUR €29.99)
7. **Localization** (English - United States):
   - **Display Name**: `Standard Plan`
   - **Description**: `30 searches per month, LinkedIn contacts, community access`
8. **Review Information**:
   - Screenshot (opțional, dar recomandat)
   - Review Notes: "Standard subscription tier for Truxel logistics platform"
9. Click **Save**

#### Produsul 2: Pro Plan - Monthly

1. Click **+ (Create)** → **Auto-Renewable Subscription**
2. **Reference Name**: `Pro Plan - Monthly`
3. **Product ID**: `truxel_4999_1month`
4. **Subscription Group**: `Truxel Subscriptions` (același ca Standard)
5. **Subscription Duration**: `1 Month`
6. **Price**:
   - US: `$49.99`
   - RO: `219 RON` (sau echivalent EUR €49.99)
7. **Localization** (English - United States):
   - **Display Name**: `Pro Plan`
   - **Description**: `100 searches per month, advanced research, AI matching, priority support`
8. **Review Information**: Similar cu Standard
9. Click **Save**

#### Produsul 3: Fleet Manager - Monthly

1. Click **+ (Create)** → **Auto-Renewable Subscription**
2. **Reference Name**: `Fleet Manager - Monthly`
3. **Product ID**: `truxel_2999_fleet_1month`
4. **Subscription Group**: `Truxel Subscriptions` (același)
5. **Subscription Duration**: `1 Month`
6. **Price**:
   - US: `$29.99`
   - RO: `129 RON`
7. **Localization** (English - United States):
   - **Display Name**: `Fleet Manager Plan`
   - **Description**: `30 searches per month, fleet management tools, logistics tracking`
8. **Review Information**: Similar cu Standard
9. Click **Save**

#### Produsul 4: Pro Freighter - Monthly

1. Click **+ (Create)** → **Auto-Renewable Subscription**
2. **Reference Name**: `Pro Freighter - Monthly`
3. **Product ID**: `truxel_4999_profreighter_1month`
4. **Subscription Group**: `Truxel Subscriptions` (același)
5. **Subscription Duration**: `1 Month`
6. **Price**:
   - US: `$49.99`
   - RO: `219 RON`
7. **Localization** (English - United States):
   - **Display Name**: `Pro Freighter Plan`
   - **Description**: `50 searches per month, 1500 community posts/month, priority support`
8. **Review Information**: Similar cu Pro
9. Click **Save**

#### Produsul 5: 25 Search Credits (One-time purchase)

1. Click **+ (Create)** → **Non-Consumable** (sau **Consumable** dacă vrei să poată cumpăra de mai multe ori)
2. **Reference Name**: `25 Search Credits`
3. **Product ID**: `truxel_2499_onetime`
4. **Price**:
   - US: `$24.99`
   - RO: `109 RON`
5. **Localization**:
   - **Display Name**: `25 Search Credits`
   - **Description**: `Add 25 extra company searches to your account`
6. Click **Save**

### Pas 4: Verifică Subscription Group Settings

1. Click pe **Truxel Subscriptions** (subscription group)
2. **Subscription Name**: `Truxel Subscriptions`
3. **Subscription Ranking** (în ordine de upgrade):
   1. Pro Freighter - $49.99 (highest tier)
   2. Pro Plan - $49.99
   3. Fleet Manager - $29.99
   4. Standard Plan - $29.99 (base tier)

Acesta setează ordinea de upgrade/downgrade.

### Pas 5: Submit for Review

Pentru fiecare produs creat:
1. Click pe produs
2. Verifică că toate informațiile sunt complete (✓ verde)
3. Status va fi **"Ready to Submit"**
4. Click **Submit for Review**

⚠️ **IMPORTANT**: Produsele trebuie aprobate de Apple înainte să funcționeze în producție!

### Pas 6: Testare în Sandbox (înainte de aprobare)

1. Mergi la **Users and Access** → **Sandbox Testers**
2. Creează un sandbox tester:
   - Email: `test@truxel.io` (sau orice email fake)
   - Password: Alege o parolă
   - Region: Romania
3. Pe device (TestFlight):
   - Logout din App Store
   - Deschide app-ul Truxel
   - Încearcă să cumperi un abonament
   - Va cere login cu sandbox tester
4. Verify purchase flow funcționează

## 🔗 Conectare cu RevenueCat

După ce produsele sunt create în App Store Connect:

1. Mergi la [RevenueCat Dashboard](https://app.revenuecat.com/)
2. **Product catalog** → **Products** → **Truxel (iOS)**
3. Click **+ New** → **Import from App Store**
4. RevenueCat va importa automat produsele
5. **Attach** produsele la entitlements:
   - `truxel_2999_1month` → `standard_access`
   - `truxel_4999_1month` → `pro_access`
   - `truxel_2999_fleet_1month` → `fleet_manager_access`
6. Verifică în **Offerings** că toate produsele sunt în offering-ul "default"

## 📱 Verificare în TestFlight

După ce ai creat produsele:

1. Build nou cu EAS:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

2. Instalează din TestFlight

3. Navighează la Pricing page

4. Ar trebui să vezi **toate** cele 3 planuri:
   ```
   ┌─────────────────────┐
   │ Standard Plan       │
   │ $29.99/month        │
   │ [Current Plan]      │
   └─────────────────────┘

   ┌─────────────────────┐
   │ Pro Plan            │
   │ $49.99/month        │
   │ [Subscribe]         │
   └─────────────────────┘

   ┌─────────────────────┐
   │ Fleet Manager       │
   │ $29.99/month        │
   │ [Subscribe]         │
   └─────────────────────┘

   ┌─────────────────────┐
   │ Pro Freighter       │
   │ $49.99/month        │
   │ [Subscribe]         │
   └─────────────────────┘
   ```

Plus **Search Pack addon** (optional, apare separat):

## 🐛 Debugging

### Check Console Logs (TestFlight)

Conectează device-ul la Mac și deschide **Console** app:

1. Conectează iPhone-ul
2. Deschide Console.app pe Mac
3. Selectează device-ul
4. Filtrează după "Truxel" sau "RevenueCat"

Ar trebui să vezi:
```
✅ RevenueCat mobile SDK initialized successfully
📦 Loading RevenueCat offerings for user: ...
🔍 ALL subscriptions BEFORE filter: [
  { id: 'truxel_2999_1month', currency: 'USD', price: '$29.99' },
  { id: 'truxel_4999_1month', currency: 'USD', price: '$49.99' },
  { id: 'truxel_2999_fleet_1month', currency: 'USD', price: '$29.99' },
  { id: 'truxel_4999_profreighter_1month', currency: 'USD', price: '$49.99' }
]
📋 Tier mapping: truxel_2999_1month → standard
📋 Tier mapping: truxel_4999_1month → pro
📋 Tier mapping: truxel_2999_fleet_1month → fleet_manager
📋 Tier mapping: truxel_4999_profreighter_1month → pro_freighter
✅ RevenueCat offerings loaded: { subscriptions: 4, searchPacks: 1 }
```

### Dacă tot nu apar:

**Log-uri importante:**
```
⚠️ No current offering found in RevenueCat Dashboard
→ Verifică RevenueCat Offerings și setează unul ca "Current"

🔍 ALL subscriptions BEFORE filter: []
→ RevenueCat nu returnează produse - verifică import în RevenueCat

🗑️ Removing duplicate tier: pro (package: truxel_4999_1month)
→ Tier mapping-ul este greșit - verifică getTierName()
```

## ✅ Checklist Final

- [ ] Produse create în App Store Connect:
  - [ ] `truxel_2999_1month` (Standard - $29.99/month)
  - [ ] `truxel_4999_1month` (Pro - $49.99/month)
  - [ ] `truxel_2999_fleet_1month` (Fleet Manager - $29.99/month)
  - [ ] `truxel_4999_profreighter_1month` (Pro Freighter - $49.99/month)
  - [ ] `truxel_2499_onetime` (25 Search Credits - $24.99 one-time)
- [ ] Toate produsele au status **"Ready to Submit"** sau **"Approved"**
- [ ] Subscription Group creat: `Truxel Subscriptions`
- [ ] Produse importate în RevenueCat
- [ ] Produse attached la entitlements în RevenueCat
- [ ] Produse adăugate în offering "default" (și setat ca Current)
- [ ] Tier mapping-ul în `pricing.tsx` include iOS identifiers ✅ (deja făcut!)
- [ ] Build nou făcut și testat în TestFlight

## 📚 Resurse

- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Docs - In-App Purchase](https://developer.apple.com/in-app-purchase/)
- [RevenueCat iOS Setup](https://www.revenuecat.com/docs/getting-started/installation/ios)
- [RevenueCat Offerings](https://www.revenuecat.com/docs/entitlements)

## ❓ FAQ

**Q: Cât durează approval-ul Apple?**
A: Între 24-48 ore în general. Poți testa în Sandbox înainte de aprobare.

**Q: Pot testa fără să submit for review?**
A: Da! Folosește Sandbox Testers. Produsele funcționează în Sandbox chiar dacă nu sunt aprobate.

**Q: De ce apar doar 1 plan în loc de 3?**
A: Cel mai probabil produsele nu sunt create în App Store Connect sau nu sunt importate în RevenueCat Offerings.

**Q: Trebuie să fac build nou după ce creez produsele?**
A: **NU** pentru Sandbox testing, **DA** pentru producție (după aprobare).
