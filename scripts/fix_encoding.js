const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');

// More precise replacements for Romanian
const roReplacements = [
    { search: /ÃŽ/g, replace: 'Î' },
    { search: /Äƒ/g, replace: 'ă' },
    { search: /È™/g, replace: 'ș' },
    { search: /È˜/g, replace: 'Ș' },
    { search: /È›/g, replace: 'ț' },
    { search: /Èš/g, replace: 'Ț' },
    { search: /Ã®/g, replace: 'î' },
    { search: /Ã¢/g, replace: 'â' },
    { search: /ÅŸ/g, replace: 'ş' },
    { search: /Å£/g, replace: 'ţ' },
    { search: /Ä‚/g, replace: 'Ă' },
    { search: /Ã‚/g, replace: 'Â' },
];

function fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    if (filePath.endsWith('ro.json')) {
        roReplacements.forEach(r => {
            newContent = newContent.replace(r.search, r.replace);
        });
    } else {
        // General fixes for other languages
        newContent = newContent.replace(/Ã©/g, 'é');
        newContent = newContent.replace(/Ã¨/g, 'è');
        newContent = newContent.replace(/Ã¡/g, 'á');
        newContent = newContent.replace(/Ã±/g, 'ñ');
        newContent = newContent.replace(/Ã³/g, 'ó');
        newContent = newContent.replace(/Ãº/g, 'ú');
        newContent = newContent.replace(/Ã¼/g, 'ü');
        newContent = newContent.replace(/Ã¶/g, 'ö');
        newContent = newContent.replace(/ÃŸ/g, 'ß');
        newContent = newContent.replace(/Ã§/g, 'ç');
        
        // Polish
        newContent = newContent.replace(/Å‚/g, 'ł');
        newContent = newContent.replace(/Å„/g, 'ń');
        newContent = newContent.replace(/Å›/g, 'ś');
        newContent = newContent.replace(/Åº/g, 'ź');
        newContent = newContent.replace(/Å¼/g, 'ż');
        newContent = newContent.replace(/Ä‡/g, 'ć');
        newContent = newContent.replace(/Ä™/g, 'ę');
        newContent = newContent.replace(/Ä…/g, 'ą');
        
        // Turkish
        newContent = newContent.replace(/Ä±/g, 'ı');
        newContent = newContent.replace(/ÄŸ/g, 'ğ');
        newContent = newContent.replace(/ÅŸ/g, 'ş');
        newContent = newContent.replace(/Ã§/g, 'ç');
        newContent = newContent.replace(/Ã¶/g, 'ö');
        newContent = newContent.replace(/Ã¼/g, 'ü');
        newContent = newContent.replace(/Ä°/g, 'İ');
    }

    if (content !== newContent) {
        console.log(`Fixing encoding in ${path.basename(filePath)}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
}

fs.readdirSync(localesDir).forEach(file => {
    if (file.endsWith('.json') && file !== 'en.json') {
        fixFile(path.join(localesDir, file));
    }
});
