# RevenueCat în Expo Go - Ce trebuie să știi

## ⚠️ De ce nu funcționează RevenueCat în Expo Go?

RevenueCat folosește **native modules** (StoreKit pentru iOS, Play Billing pentru Android) care **NU sunt disponibile în Expo Go**.

Expo Go este o aplicație generică care rulează cod JavaScript, dar nu poate încărca module native custom.

## ✅ Ce funcționează în Expo Go?

- **Tot restul aplicației** funcționează normal
- **Web payments** funcționează (dacă testezi în browser)
- Poți testa UI-ul, navigation, etc.

## ❌ Ce NU funcționează în Expo Go?

- RevenueCat SDK (iOS/Android)
- Native In-App Purchases (Apple/Google)
- Afișarea ofertelor (subscriptions) pe mobile

## 🔍 Log-uri normale în Expo Go

Când rulezi în Expo Go și mergi la pagina Pricing, vei vedea:

```
✅ Log-uri normale (așteptate):
🔍 RevenueCat Init Check: { platform: 'ios', appOwnership: 'expo', ... }
🟡 Expo Go detected - RevenueCat disabled for mobile
   appOwnership: expo
   executionEnvironment: storeClient
   For RevenueCat to work, build with EAS or npx expo run:ios

📦 PricingScreen mounted - Loading RevenueCat offerings (Universal)
⚠️ Expo Go detected - RevenueCat SDK not available
   Build with EAS (eas build) or native (npx expo run:ios) to use RevenueCat
```

```
❌ Erori așteptate (sunt OK!):
ERROR ❌ Error fetching offerings: [Error: There is no singleton instance...]
ERROR ❌ Failed to get customer info: [Error: There is no singleton instance...]
```

**Acestea NU sunt bug-uri!** Sunt comportamentul așteptat în Expo Go.

## 🚀 Cum să testezi RevenueCat corect

### Opțiunea 1: Web (cel mai rapid) ✅

```bash
npm run web
```

Apoi deschide http://localhost:8081 în browser. RevenueCat va funcționa perfect pe web!

### Opțiunea 2: Native Build local (iOS)

```bash
# Creează native project
npx expo prebuild

# Rulează pe simulator/device
npx expo run:ios
```

### Opțiunea 3: EAS Build (pentru TestFlight) 🏆

```bash
# Build pentru iOS
eas build --platform ios --profile production

# Upload la TestFlight
eas submit --platform ios
```

După ce instalezi din TestFlight, RevenueCat va funcționa 100%!

### Opțiunea 4: EAS Build pentru Development

```bash
# Build de development (mai rapid, cu hot reload)
eas build --platform ios --profile development

# Instalează pe device
# Apoi rulează:
npx expo start --dev-client
```

## 📋 Checklist pentru testare

### Teste în Expo Go (limitate, doar UI):
- ✅ Poți testa navigation
- ✅ Poți testa design-ul paginii Pricing
- ✅ Poți testa alte funcții (search, profile, etc.)
- ❌ **NU** poți testa RevenueCat/purchases

### Teste pe Web:
- ✅ RevenueCat funcționează complet
- ✅ Stripe checkout funcționează
- ✅ Ofertele apar corect

### Teste în TestFlight/Native Build:
- ✅ RevenueCat funcționează complet
- ✅ Apple In-App Purchases funcționează
- ✅ Ofertele apar corect
- ✅ Purchase flow funcționează

## 🐛 Cum să deosebești o eroare reală de Expo Go

### ✅ Normal în Expo Go:
```
❌ Error fetching offerings: There is no singleton instance
❌ Failed to get customer info: There is no singleton instance
```

### 🚨 Eroare reală (chiar și în native build):
```
❌ RevenueCat API key not configured for ios
❌ No current offering found in RevenueCat Dashboard
❌ No packages found for currency: EUR
```

## 💡 Recomandări

1. **Pentru development zilnic**: Folosește Expo Go pentru tot ce nu e RevenueCat
2. **Pentru testare RevenueCat pe mobile**: Folosește EAS Build development
3. **Pentru testare rapidă RevenueCat**: Folosește Web (`npm run web`)
4. **Pentru testare finală înainte de release**: Folosește TestFlight

## 🔗 Resurse

- [Expo Go Limitations](https://docs.expo.dev/workflow/expo-go/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [RevenueCat iOS Setup](https://www.revenuecat.com/docs/getting-started/installation/ios)

## ❓ FAQ

**Q: De ce văd errori în Expo Go dacă am fixat codul?**
A: Erori sunt **normale** în Expo Go pentru că RevenueCat nu poate funcționa acolo. Am adăugat verificări pentru a opri SDK-ul să încerce să se inițializeze, dar poate mai apare câteva errori înainte.

**Q: Trebuie să fac build pentru fiecare test?**
A: Nu! Folosește **web** (`npm run web`) pentru testare rapidă. Build-ul este doar pentru testare finală pe device real.

**Q: Cum știu că RevenueCat funcționează pe iOS?**
A: Instalează din TestFlight și verifică console logs. Ar trebui să vezi:
```
✅ RevenueCat mobile SDK initialized successfully
📦 Available packages in current offering: [...]
✅ Filtered to X subscriptions for EUR
```

**Q: Pot testa payments în development build?**
A: Da, dar va folosi **sandbox environment** de la Apple. Trebuie să creezi sandbox tester în App Store Connect.
