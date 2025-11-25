# N8N City Scoring & Importance Formula

Acest document definește logica pentru calcularea scorului de `importance` în flow-ul N8N, pentru a menține consistența cu baza de date existentă și a asigura o experiență de utilizare fluidă.

## 🎯 Obiectiv
Vrem să populăm baza de date "organic" cu orașe noi descoperite de utilizatori, dar să le clasificăm corect astfel încât orașele mari să rămână prioritare în căutări, iar satele/comunele să nu polueze rezultatele principale decât dacă devin populare.

## ⚠️ Notă Critică despre Baza de Date
Coloana corectă în tabelul `cities` este **`importance`** (nu `importance_score`).
Asigură-te că flow-ul N8N face insert/update pe coloana `importance`.

## 🧮 Formula de Calcul (JavaScript pentru N8N)

Această logică se bazează pe analiza datelor existente (importate manual) și corelează populația cu scorul de importanță.

Poți folosi acest cod într-un nod "Code" sau "Function" în N8N, după ce ai obținut datele despre oraș (de la Google Maps, OpenStreetMap, etc.).

### Codul Final (Consolidat)
Acest cod combină datele de locație (BigDataCloud) cu datele de populație (Wikidata) și calculează importanța.

```javascript
// 1. Preluăm datele de locație din nodul anterior "HTTP Request1"
// (N8N păstrează datele din pașii anteriori, le accesăm direct)
const locationData = $('HTTP Request1').first().json; 

// 2. Preluăm datele curente (Wikidata Claims) pentru populație
const claimsData = $input.item.json;

// --- LOGICA PENTRU POPULAȚIE (din Wikidata) ---
let population = 0;
if (claimsData.claims && claimsData.claims.P1082) {
  const popClaims = claimsData.claims.P1082;
  // Căutăm valoarea cu rank 'preferred' (cea mai sigură) sau luăm ultima din listă (cea mai recentă)
  let bestClaim = popClaims.find(c => c.rank === 'preferred');
  if (!bestClaim && popClaims.length > 0) {
    bestClaim = popClaims[popClaims.length - 1];
  }
  
  if (bestClaim && bestClaim.datavalue && bestClaim.datavalue.value) {
    // Valoarea vine ca string "+2632", o transformăm în număr
    population = parseInt(bestClaim.datavalue.value.amount, 10);
  }
}

// --- LOGICA PENTRU IMPORTANȚĂ (Formula Logaritmică) ---
let importance = 0.1;
if (population > 0) {
  // Logaritmul netezește diferențele uriașe (ex: 10k vs 100k vs 1M)
  importance = Math.log10(population) * 0.15;
  // Limităm între 0.1 și 1.0
  if (importance > 1.0) importance = 1.0;
  if (importance < 0.1) importance = 0.1;
}

// --- EXTRAGERE DATE RICH (Timezone, Regiune) ---
const info = locationData.localityInfo || {};
const informative = info.informative || [];
const administrative = info.administrative || [];

// Funcție helper pentru a căuta în lista 'informative'
const findInfo = (descPart) => {
  const found = informative.find(i => i.description && i.description.toLowerCase().includes(descPart));
  return found ? found.name : null;
};

// Găsim Timezone (ex: Europe/Bucharest)
const timezone = findInfo('time zone');

// Găsim Regiunea (ex: Nord-Est)
const region = findInfo('development region') || findInfo('region');

// Găsim Wikidata ID (de obicei ultimul element din administrative este localitatea)
let wikidataId = null;
if (administrative.length > 0) {
    const cityAdmin = administrative[administrative.length - 1];
    wikidataId = cityAdmin.wikidataId;
}

// --- CONSTRUIREA OBIECTULUI FINAL PENTRU SUPABASE ---
return {
  // Identificare
  name: locationData.city || locationData.locality, // Numele orașului
  ascii_name: locationData.city || locationData.locality, // Fallback pentru ascii
  
  // Coordonate
  lat: locationData.latitude,
  lng: locationData.longitude,
  
  // Ierarhie Administrativă
  country_code: locationData.countryCode,
  country_name: locationData.countryName,
  state_code: locationData.principalSubdivisionCode, // Ex: RO-BC
  state_name: locationData.principalSubdivision,     // Ex: Bacau
  region_name: region,                               // Ex: Nord-Est
  
  // Date Extra
  timezone: timezone,
  plus_code: locationData.plusCode,
  wikidata_id: wikidataId,
  
  // Statistici
  population: population,
  importance: parseFloat(importance.toFixed(2)), // Rotunjit la 2 zecimale (ex: 0.45)
  
  // Timestamp
  updated_at: new Date().toISOString()
};
```

## 📈 Creștere Organică (Usage Boost)

Pe lângă acest scor inițial calculat de N8N, sistemul din Supabase are (sau ar trebui să aibă) un mecanism de creștere bazat pe utilizare.

Dacă un oraș mic (ex: un nod logistic important într-o comună de 2000 locuitori -> scor 0.3) este folosit des de șoferi:
1.  Aplicația trimite locația.
2.  Supabase incrementează `usage_count`.
3.  Un trigger/funcție ar trebui să crească ușor `importance`.

**Recomandare pentru funcția SQL de incrementare (`increment_city_usage`):**
În loc să seteze o valoare fixă bazată pe 0.5, ar trebui să adauge la valoarea curentă:

```sql
-- Logică recomandată pentru SQL
UPDATE cities
SET 
  usage_count = COALESCE(usage_count, 0) + 1,
  -- Crește importanța cu 0.01 la fiecare utilizare, până la max 1.0
  importance = LEAST(1.0, importance + 0.01) 
WHERE id = p_city_id;
```

Astfel, un sat (0.2) care devine hub logistic poate ajunge la 0.9 dacă este vizitat de 70 de ori, reflectând realitatea din teren a utilizatorilor tăi.

## 🛡️ Protecția Funcționalităților

Folosind această formulă:
1.  **Search:** Orașele mari rămân primele în sugestii.
2.  **Popular Cities:** Filtrul `gt('population', 100000)` din `cityService.ts` va exclude automat satele adăugate, chiar dacă au scor mare, păstrând lista "Popular" curată.
3.  **Nearest City:** Nu este afectat de scor, ci doar de coordonate.

## 📝 Checklist pentru N8N Flow
1.  [ ] Obține `lat`, `lng`, `name`, `country_code`.
2.  [ ] Interoghează API extern (Google Places / Geonames) pentru `population`.
3.  [ ] Aplică formula de mai sus.
4.  [ ] Insert/Upsert în Supabase tabelul `cities`:
    *   Setează `is_user_generated = true`.
    *   Setează `importance` cu valoarea calculată.
    *   Setează `population` cu valoarea reală (critic pentru sortare secundară).

## 🌍 Data Enrichment Mapping (N8N)

Pentru a popula noile coloane din baza de date, folosește următorul cod în nodul "Function" sau "Code" din N8N înainte de a trimite datele către Supabase.

### Extragere Date din JSON-ul BigDataCloud

```javascript
const info = $input.item.json; // Obiectul principal
const localityInfo = info.localityInfo || {};

// Helper pentru a găsi regiunea (Development Region)
// De obicei are order 5 sau descrierea "development region"
const findRegion = (items) => {
  if (!items) return null;
  const region = items.find(i => 
    (i.description && i.description.includes('development region')) || 
    (i.order === 5)
  );
  return region ? region.name : null;
};

// Helper pentru Timezone
const findTimezone = (items) => {
  if (!items) return null;
  const tz = items.find(i => i.description === 'time zone');
  return tz ? tz.name : null;
};

return {
  // Date standard
  name: info.city || info.locality,
  country_code: info.countryCode,
  country_name: info.countryName,
  lat: info.latitude,
  lng: info.longitude,
  
  // Date noi îmbogățite
  state_code: info.principalSubdivisionCode, // ex: RO-BC
  state_name: info.principalSubdivision,     // ex: Bacau
  region_name: findRegion(localityInfo.informative), // ex: Nord-Est
  timezone: findTimezone(localityInfo.informative),  // ex: Europe/Bucharest
  wikidata_id: info.wikidataId,
  plus_code: info.plusCode,
  
  // Calcul importanță (din pasul anterior)
  importance: calculateImportance(info.population, null) 
};
```
### Beneficii Logistice
1.  **Filtrare pe Județ (`state_code`):** Permite utilizatorilor să caute "Marfă în Bacău" în loc de orașe specifice.
2.  **Timezone:** Esențial pentru coordonarea curselor internaționale.
3.  **Plus Code:** Locație exactă pentru depozite fără adresă poștală.
