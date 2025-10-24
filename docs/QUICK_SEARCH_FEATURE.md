# Quick Search Feature - User Guide

## Overview
Quick Search permite utilizatorilor să înceapă o căutare instant folosind domeniile salvate în profil, fără să mai scrie nimic - perfect pentru când conduci!

## Setup (Prima dată)

### Pasul 1: Setează Domeniile Preferate
1. Deschide app-ul Truxel
2. Mergi la tab-ul **Profile** (ultima iconiță)
3. Scroll down până la secțiunea **"Preferred Industries"**
4. Selectează până la 5 industrii (exemplu: Logistics, Automotive, Food & Beverage)
5. Apasă butonul **"Save"** de jos

### Pasul 2: Folosește Quick Search
1. Mergi la tab-ul **Search**
2. Selectează locația (Use Current Location sau altă metodă)
3. Vei vedea un card albastru cu **"Quick Search"**:
   ```
   Quick Search
   Perfect for when you're driving! Start a search instantly 
   using your saved domains without typing.
   
   Your saved domains:
   [Logistics] [Automotive] [Food & Beverage]
   
   [🚀 Quick Search]
   ```
4. Apasă **"🚀 Quick Search"**
5. Căutarea pornește INSTANT!

## Cum Funcționează

### Când Apare Quick Search Button?
- Quick Search button apare DOAR dacă ai `preferred_industries` setate în profil
- Dacă array-ul e gol `[]`, butonul nu va fi vizibil
- După ce salvezi industriile în Profile, revin la Search tab pentru a vedea butonul

### Ce Face Quick Search?
1. Ia toate domeniile din `profile.preferred_industries`
2. Le combină într-un string: `"Logistics, Automotive, Food & Beverage"`
3. Trimite acest string prin webhook la n8n (ca și cum ai scrie manual)
4. Folosește locația curentă/selectată
5. NU cere confirmare - search pornește direct!

### Diferențe față de Start Search Normal

| Feature | Start Search | Quick Search |
|---------|--------------|--------------|
| Trebuie să scrii keywords | ✅ DA | ❌ NU |
| Folosește domenii salvate | ❌ NU | ✅ DA |
| Pop-up confirmare | ❌ NU (eliminat) | ❌ NU |
| Trebuie locație | ✅ DA | ✅ DA |
| Consumă 1 credit | ✅ DA | ✅ DA |

## Real-time Status Updates

După ce apeși Quick Search (sau Start Search):

1. **Status Card apare imediat** (galben):
   ```
   Processing...
   Keywords: Logistics, Automotive, Food & Beverage
   Location: Podu Turcului, Romania
   
   [Timer] 0:45 / ~5:00 estimated
   ```

2. **Timer se updatează în timp real** (fiecare secundă)

3. **Când n8n termină** (verde):
   ```
   Completed
   Check Leads tab for results
   ```

4. **Notificare Push** (dacă ai permisiuni):
   ```
   🔔 Search Complete!
   Your search results are ready
   ```

## Available Industries

Cele 20 de industrii disponibile:
- Automotive
- Construction
- Electronics
- Food & Beverage
- Furniture
- Metalworking
- Mining
- Oil & Gas
- Paper & Packaging
- Pharmaceuticals
- Plastics
- Textiles
- Timber & Wood
- Retail
- Agriculture
- Chemicals
- **Logistics** (popular)
- Manufacturing
- Waste Management
- Other

## Use Cases

### 1. Șofer în Mișcare
```
Scenariu: Conduci spre Iași, vrei să cauți companii rapid
Soluție: 
- Selectezi "Search Around Me"
- Apeși "Quick Search" (domeniile tale salvate: Logistics, Manufacturing)
- Căutarea pornește instant, fără să scrii nimic!
```

### 2. Căutări Repetitive
```
Scenariu: Cauți mereu aceleași tipuri de companii
Soluție:
- Setezi o dată domeniile în Profile
- De fiecare dată apeși doar Quick Search
- Economisești timp (nu mai scrii "logistics, warehouse" de fiecare dată)
```

### 3. Zone Noi
```
Scenariu: Ajungi în oraș nou, vrei să vezi companii din industria ta
Soluție:
- "Search Around Me" → Quick Search
- Instant vezi companii din domeniile tale preferate
```

## Error Handling

### "No saved domains"
```
Mesaj: "No saved domains"
Descriere: "Please set your preferred industries in Profile settings"
Fix: Go to Profile → Preferred Industries → Select → Save
```

### "Please select a location first"
```
Mesaj: "Please select a location first"
Fix: Apasă "Search Around Me" sau setează locația manual
```

### "You don't have enough searches"
```
Mesaj: "Insufficient searches remaining"
Fix: Buy more searches sau upgrade subscription
```

## Technical Details

### Database Schema
```typescript
interface Profile {
  preferred_industries?: string[];  // Max 5 items
  // Examples: ["Logistics", "Automotive", "Food & Beverage"]
}
```

### Webhook Payload
```json
{
  "search_id": "uuid",
  "user_id": "uuid",
  "keywords": "Logistics, Automotive, Food & Beverage",  // From profile
  "address": "Podu Turcului, Romania",
  "latitude": 46.204123,
  "longitude": 27.385735,
  "radius_km": 5,
  "tier": "standard",
  "features": {
    "linkedinEnabled": false,
    "aiMatchingEnabled": false,
    "advancedResearchEnabled": false
  },
  "credit_source": "subscription"
}
```

### Component Logic
```typescript
// searchesService.ts
const quickKeywords = profile.preferred_industries.join(', ');
// ["Logistics", "Automotive"] → "Logistics, Automotive"

await searchesService.initiateSearch(user.id, profile, {
  keywords: quickKeywords,
  address,
  latitude,
  longitude,
});
```

## iOS Notification Warning

### Expo Go Warning (Normal)
```
ERROR expo-notifications: Android Push notifications (remote notifications) 
functionality provided by expo-notifications was removed from Expo Go with 
the release of SDK 53. Use a development build instead of Expo Go.
```

**Ce înseamnă?**
- Warning-ul apare DOAR în Expo Go (development)
- Notificările funcționează în production build (standalone app)
- Feature-ul Quick Search funcționează NORMAL
- Status updates funcționează NORMAL
- Timer funcționează NORMAL

**Când dispar warning-urile?**
- În production build (EAS Build)
- În development build (cu expo-dev-client)

## Best Practices

### 1. Alege Industrii Relevante
❌ Nu selecta random toate cele 5 slot-uri
✅ Selectează doar industriile în care lucrezi frecvent

### 2. Actualizează Periodic
- Dacă îți schimbi focus-ul (ex: din Automotive în Food & Beverage)
- Mergi la Profile → Edit industries → Save

### 3. Combină cu Start Search Normal
- Quick Search pentru căutări rapide, repetitive
- Start Search pentru căutări specifice, unice

### 4. Testează După Setup
- După ce setezi industriile în Profile
- Fă un Quick Search test
- Verifică că domeniile sunt corecte în Status Card

## FAQ

**Q: Quick Search button nu apare?**
A: Verifică că ai `preferred_industries` setate în Profile și ai salvat!

**Q: Pot schimba industriile după ce le-am salvat?**
A: Da! Mergi la Profile → Edit industries → Save din nou

**Q: Quick Search consumă credite?**
A: Da, consumă 1 credit (la fel ca Start Search normal)

**Q: Pot avea mai mult de 5 industrii?**
A: Nu, maximum 5 pentru a păstra căutările focusate

**Q: Ce se întâmplă dacă șterг toate industriile?**
A: Quick Search button va dispărea (doar Start Search va rămâne)

**Q: Pot folosi Quick Search fără internet?**
A: Nu, trebuie conexiune la internet pentru webhook

**Q: Notificările funcționează în iOS?**
A: Da, în production build. Warning-ul din Expo Go e normal.

---

**Last Updated:** October 24, 2025
**Feature Status:** ✅ Live & Tested
**Commit:** 0cd0645
