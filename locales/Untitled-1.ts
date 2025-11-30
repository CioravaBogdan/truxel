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