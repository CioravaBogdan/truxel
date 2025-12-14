const fs = require('fs');
const path = require('path');

const translations = {
  'en': { restore: 'Restore Purchases', privacy: 'Privacy Policy', terms: 'Terms of Service' },
  'ro': { restore: 'Restaurează Achizițiile', privacy: 'Politica de Confidențialitate', terms: 'Termeni și Condiții' },
  'de': { restore: 'Käufe Wiederherstellen', privacy: 'Datenschutzrichtlinie', terms: 'Nutzungsbedingungen' },
  'es': { restore: 'Restaurar Compras', privacy: 'Política de Privacidad', terms: 'Términos del Servicio' },
  'fr': { restore: 'Restaurer les Achats', privacy: 'Politique de Confidentialité', terms: "Conditions d'Utilisation" },
  'it': { restore: 'Ripristina Acquisti', privacy: 'Informativa sulla Privacy', terms: 'Termini di Servizio' },
  'lt': { restore: 'Atkurti Pirkimus', privacy: 'Privatumo Politika', terms: 'Paslaugų Sąlygos' },
  'pl': { restore: 'Przywróć Zakupy', privacy: 'Polityka Prywatności', terms: 'Regulamin' },
  'tr': { restore: 'Satın Alımları Geri Yükle', privacy: 'Gizlilik Politikası', terms: 'Hizmet Şartları' },
  'uk': { restore: 'Відновити Покупки', privacy: 'Політика Конфіденційності', terms: 'Умови Використання' }
};

for (const [lang, t] of Object.entries(translations)) {
  const filePath = path.join(__dirname, '..', 'locales', `${lang}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add to subscription section
    data.subscription.restore_purchases = t.restore;
    
    // Add to auth section
    data.auth.privacy_policy = t.privacy;
    data.auth.terms_of_service = t.terms;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated ${lang}.json`);
  } catch (error) {
    console.error(`❌ Failed to update ${lang}.json:`, error.message);
  }
}

console.log('\nDone! Added translations for:');
console.log('- subscription.restore_purchases');
console.log('- auth.privacy_policy');
console.log('- auth.terms_of_service');
