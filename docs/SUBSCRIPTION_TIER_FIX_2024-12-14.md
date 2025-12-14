# Subscription Tier Fix - December 14, 2025

## 🐛 Problema Raportată
Când utilizatorul cumpăra un pachet (Pro, Fleet Manager, Pro Freighter), în Supabase rămânea setat pe `standard` în loc de tier-ul corect. Deși în app apărea mesajul că pachetul e deja cumpărat, `subscription_tier` din baza de date nu se actualiza.

---

## 🔍 Investigație

### 1. Verificare RevenueCat Configuration
- **Entitlements verificate:** `standard_access`, `pro_access`, `fleet_manager_access`, `pro_freighter_access`, `search_credits`
- **Produse iOS verificate:**
  - `truxel_2999_1month` → `standard_access` ✅
  - `truxel_4999_1month` → `pro_access` ✅
  - `truxel_2999_fleet_1month` → `fleet_manager_access` ✅
  - `truxel_4999_frighter_1month` → `pro_freighter_access` ✅

### 2. Verificare Webhook Logs
- Webhook-ul primea request-uri și returna 200 OK
- Problema nu era în webhook ci în client-side code

### 3. Root Cause Identificat
În `pricing.tsx`, după purchase, se folosea `getUserTier(info)` care citea entitlements din `CustomerInfo`. 

**Problema:** RevenueCat NU sincronizează instant entitlements-urile după purchase. Poate exista un delay de câteva secunde până când Apple/Google confirmă tranzacția și RevenueCat actualizează entitlements.

**Rezultat:** `getUserTier()` returna tier-ul vechi (ex: `standard` sau `trial`) în loc de cel tocmai cumpărat (`pro`).

---

## ✅ Modificări Efectuate

### 1. `app/(tabs)/pricing.tsx` - Fix Principal

**Înainte:**
```typescript
const newTier = getUserTier(info);
// Folosea entitlements care puteau fi neactualizate
```

**După:**
```typescript
// Get tier from entitlements
let newTier = getUserTier(info);
console.log('🔍 DEBUG: getUserTier returned:', newTier);

// Get the tier we JUST purchased from the package identifier
const purchasedTier = getTierName(pkg.identifier);
console.log('🔍 DEBUG: Package tier (what was purchased):', purchasedTier);

// IMPORTANT: Always use the tier from the package we just purchased
// RevenueCat entitlements might not be synced immediately
if (purchasedTier && purchasedTier !== 'trial' && purchasedTier !== 'search_pack') {
  if (newTier !== purchasedTier) {
    console.log(`⚠️ Tier mismatch: entitlements say "${newTier}" but we purchased "${purchasedTier}"`);
    console.log('✅ Using purchased tier as source of truth:', purchasedTier);
  }
  newTier = purchasedTier;
}
```

**Logică:** Package identifier-ul (`pkg.identifier`) este sursa de adevăr pentru ce pachet tocmai s-a cumpărat. Nu mai depindem de entitlements care pot avea delay.

---

### 2. `services/revenueCatService.ts` - Debug Logging Îmbunătățit

**Adăugat logging mai detaliat:**
```typescript
console.log('✅ Purchase successful!');
console.log('📦 Full CustomerInfo entitlements:', JSON.stringify(customerInfo.entitlements, null, 2));
console.log('🔑 Active entitlements:', Object.keys(customerInfo.entitlements.active));
```

---

### 3. `supabase/functions/revenuecat-webhook/index.ts` - Debug Logging

**Adăugat verificare user înainte de update:**
```typescript
// First check if user exists
const { data: existingUser, error: lookupError } = await supabase
  .from('profiles')
  .select('user_id, email, subscription_tier')
  .eq('user_id', userId)
  .single();

if (lookupError || !existingUser) {
  console.error(`❌ User not found in profiles: userId=${userId}, error:`, lookupError);
  console.log('🔍 subscriber_attributes:', JSON.stringify(event.subscriber_attributes));
} else {
  console.log(`✅ Found user: ${existingUser.email}, current tier: ${existingUser.subscription_tier}`);
}
```

**Adăugat logging pentru rows affected:**
```typescript
console.log(`✅ Profile update completed. Rows affected: ${count ?? 'unknown'}`);
```

---

### 4. `locales/*.json` - i18n pentru Success Messages

**Toate cele 10 locale-uri actualizate cu `{{tier}}` placeholder:**

| Locale | upgrade_success_title | upgrade_success_message |
|--------|----------------------|------------------------|
| en | Welcome to {{tier}}! 🎉 | Your subscription has been upgraded to {{tier}}! |
| ro | Bine ai venit la {{tier}}! 🎉 | Abonamentul tău a fost actualizat la {{tier}}! |
| de | Willkommen bei {{tier}}! 🎉 | Ihr Abonnement wurde auf {{tier}} aktualisiert! |
| es | ¡Bienvenido a {{tier}}! 🎉 | ¡Tu suscripción ha sido actualizada a {{tier}}! |
| fr | Bienvenue à {{tier}} ! 🎉 | Votre abonnement a été mis à niveau vers {{tier}} ! |
| it | Benvenuto in {{tier}}! 🎉 | Il tuo abbonamento è stato aggiornato a {{tier}}! |
| lt | Sveiki atvykę į {{tier}}! 🎉 | Jūsų prenumerata buvo atnaujinta į {{tier}}! |
| pl | Witaj w {{tier}}! 🎉 | Twoja subskrypcja została uaktualniona do {{tier}}! |
| tr | {{tier}} planına hoş geldiniz! 🎉 | Aboneliğiniz {{tier}} planına yükseltildi! |
| uk | Ласкаво просимо до {{tier}}! 🎉 | Вашу підписку оновлено до {{tier}}! |

---

### 5. `app.config.js` - Version Bump

```javascript
version: "1.0.14",
ios: { buildNumber: "20" },
android: { versionCode: 20 }
```

---

## 📋 Fix Anterior în Aceeași Sesiune

### Bug: getUserTier() lipsea pro_freighter_access

**services/revenueCatService.ts:**
```typescript
export function getUserTier(customerInfo: CustomerInfo): string {
  // Check pro_freighter FIRST as it's the highest tier
  if (hasEntitlement(customerInfo, 'pro_freighter_access')) {
    return 'pro_freighter';
  }
  // ... rest of tiers
}
```

**supabase/functions/revenuecat-webhook/index.ts:**
```typescript
const getTierFromEntitlements = (entitlements: string[]): string => {
  if (entitlements.includes('pro_freighter_access')) return 'pro_freighter';
  if (entitlements.includes('pro_access')) return 'pro';
  if (entitlements.includes('fleet_manager_access')) return 'fleet_manager';
  if (entitlements.includes('standard_access')) return 'standard';
  return 'trial';
};
```

---

## 🚀 Deployments

1. **Webhook deployed:** `npx supabase functions deploy revenuecat-webhook --project-ref upxocyomsfhqoflwibwn`
2. **iOS Build:** ID `8d644755-db7f-47e5-ad65-1a836423be5d` (v1.0.13, build 19) - submitted to TestFlight

---

## 🧪 Cum să Testezi

1. Deschide app-ul (build nou 1.0.14)
2. Cumpără Pro sau Fleet Manager
3. Verifică log-urile în consolă:
   ```
   🔍 DEBUG: Package tier (what was purchased): pro
   ✅ Using purchased tier as source of truth: pro
   📅 Syncing subscription to Supabase: { tier: "pro", ... }
   ✅ Subscription synced to Supabase
   ```
4. Verifică în Supabase că `subscription_tier` s-a schimbat corect

---

## 📁 Fișiere Modificate

- `app/(tabs)/pricing.tsx`
- `services/revenueCatService.ts`
- `supabase/functions/revenuecat-webhook/index.ts`
- `locales/en.json`
- `locales/ro.json`
- `locales/de.json`
- `locales/es.json`
- `locales/fr.json`
- `locales/it.json`
- `locales/lt.json`
- `locales/pl.json`
- `locales/tr.json`
- `locales/uk.json`
- `app.config.js`

---

## 📝 Git Commits

1. `fix: add pro_freighter_access to tier mapping, reset search credits on subscription`
2. `feat(i18n): dynamic tier name in upgrade success messages`
3. `fix: use package identifier as source of truth for tier after purchase`
