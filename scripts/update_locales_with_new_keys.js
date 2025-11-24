const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

const newKeys = {
  "promo_save_badge": "SAVE {{percent}}%",
  "promo_influencer_deal": "{{name}}'s DEAL",
  "promo_success_title": "Boom! {{name}} hooked you up! 🚛💸",
  "promo_success_message": "Enjoy your {{description}}! Make that money!",
  "special_discount": "special discount"
};

const roKeys = {
  "promo_save_badge": "ECONOMISEȘTI {{percent}}%",
  "promo_influencer_deal": "OFERTA LUI {{name}}",
  "promo_success_title": "Boom! {{name}} ți-a făcut rost! 🚛💸",
  "promo_success_message": "Bucură-te de {{description}}! Fă bani!",
  "special_discount": "reducere specială"
};

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!content.pricing) content.pricing = {};
  
  const keysToAdd = file === 'ro.json' ? roKeys : newKeys;
  
  Object.keys(keysToAdd).forEach(key => {
    content.pricing[key] = keysToAdd[key];
  });
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`Updated ${file}`);
});
