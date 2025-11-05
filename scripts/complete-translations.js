#!/usr/bin/env node
/**
 * Script pentru completarea traducerilor în toate limbile
 * Bazat pe structura completă din en.json
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(process.cwd(), 'locales');
const enFile = path.join(localesDir, 'en.json');
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Tracking
let totalKeys = 0;
let completedLangs = [];

// Helper: numără toate cheile recursive
function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

totalKeys = countKeys(en);
console.log(`📊 Total keys to translate: ${totalKeys} per language\n`);

// Template pentru limbile noi - vom completa manual cu traduceri profesionale
const languages = {
  pl: 'Polish (Polski)',
  tr: 'Turkish (Türkçe)',
  lt: 'Lithuanian (Lietuvių)',
  es: 'Spanish (Español)',
  uk: 'Ukrainian (Українська)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  it: 'Italian (Italiano)'
};

console.log('Languages to process:');
Object.entries(languages).forEach(([code, name]) => {
  console.log(`  - ${code}: ${name}`);
});

console.log('\n⚠️  Manual translation required for quality assurance');
console.log('Generating templates based on EN structure...\n');
