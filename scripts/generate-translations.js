const fs = require('fs');
const path = require('path');

// Citim fișierul EN de referință
const enPath = path.join(__dirname, '..', 'locales', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

console.log('✅ Loaded EN translation file with', Object.keys(enData).length, 'top-level sections');

// Funcție pentru a salva un fișier JSON formatat frumos
function saveTranslationFile(langCode, data) {
  const filePath = path.join(__dirname, '..', 'locales', `${langCode}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Created ${langCode}.json`);
}

// Verificăm că avem toate secțiunile
const requiredSections = [
  'common', 'auth', 'directions', 'tabs', 'home', 'search', 'leads',
  'subscription', 'profile', 'templates', 'notifications', 'pricing',
  'errors', 'community'
];

console.log('\nVerifying EN structure...');
requiredSections.forEach(section => {
  if (enData[section]) {
    const keys = Object.keys(enData[section]);
    console.log(`  ${section}: ${keys.length} keys`);
  } else {
    console.log(`  ⚠️  Missing section: ${section}`);
  }
});

console.log('\n📝 Ready to generate translations for: PL, TR, LT, ES, UK, FR, DE, IT');
console.log('This will create complete translation files matching EN structure.\n');
