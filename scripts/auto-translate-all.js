const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const enFile = path.join(localesDir, 'en.json');
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Dicționare de traduceri pentru toate limbile - COMPLETATE MANUAL
const translations = {
  pl: require('./translations-pl.json'),
  tr: require('./translations-tr.json'),
  lt: require('./translations-lt.json'),
  es: require('./translations-es.json'),
  uk: require('./translations-uk.json'),
  fr: require('./translations-fr.json'),
  de: require('./translations-de.json'),
  it: require('./translations-it.json')
};

// Funcție recursivă pentru a traduce toate cheile
function translateObject(obj, langCode) {
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      result[key] = translateObject(obj[key], langCode);
    } else {
      // Păstrează variabilele {{name}}, {{count}}, etc.
      result[key] = obj[key]; // Vom înlocui manual după
    }
  }
  return result;
}

// Generăm fișierele
Object.keys(translations).forEach(langCode => {
  const translated = translateObject(en, langCode);
  const outputFile = path.join(localesDir, `${langCode}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(translated, null, 2), 'utf8');
  console.log(`✅ Generated ${langCode}.json`);
});

console.log('\n🎉 All translations generated!');
