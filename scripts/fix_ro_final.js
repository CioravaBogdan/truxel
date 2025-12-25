const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../locales/ro.json');
const enPath = path.join(__dirname, '../locales/en.json');

const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let roContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Fix Structure: Move 'survey' inside 'web' if it's at root
if (roContent.survey && !roContent.web.survey) {
    console.log("Moving 'survey' into 'web'...");
    roContent.web.survey = roContent.survey;
    delete roContent.survey;
}

// 2. Fix Encoding
function fixString(str) {
    return str
        .replace(/ï¿½n/g, 'în')
        .replace(/ï¿½ntoarcere/g, 'întoarcere')
        .replace(/ï¿½ncarcaturi/g, 'încărcături')
        .replace(/ï¿½Exporta/g, 'Exportă')
        .replace(/gase\?ti/g, 'găsești')
        .replace(/direc\?i/g, 'direcți')
        .replace(/Construie\?te-\?i/g, 'Construiește-ți')
        .replace(/ \?i /g, ' și ')
        .replace(/\?abloane/g, 'șabloane')
        .replace(/fi\?ele/g, 'fișele')
        .replace(/Prime\?ti/g, 'Primești')
        .replace(/cautari/g, 'căutări')
        .replace(/clien\?i/g, 'clienți')
        .replace(/gase\?ti/g, 'găsești')
        .replace(/per cuvï¿½nt cheie/g, 'per cuvânt cheie')
        .replace(/ï¿½/g, 'î'); // Fallback for other occurrences
}

function traverse(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = fixString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key]);
        }
    }
}

traverse(roContent);

// 3. Ensure all keys from EN exist (fill with EN if missing, or try to map)
// For now, just save the structural and encoding fixes.
// The user asked to verify translation completeness, so I should probably fill missing keys with EN values prefixed with "[MISSING]" or just EN values.
// But let's stick to fixing what we know first.

fs.writeFileSync(filePath, JSON.stringify(roContent, null, 2), 'utf8');
console.log('Fixed ro.json structure and encoding.');
