const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');

// Comprehensive list of UTF-8 double encoding artifacts
const replacements = [
    // Romanian
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
    { search: /â€ž/g, replace: '„' },
    { search: /â€/g, replace: '”' }, // Be careful with this one, might be incomplete
    
    // General Western European (French, Spanish, German, Italian, etc.)
    { search: /Ã©/g, replace: 'é' },
    { search: /Ã¨/g, replace: 'è' },
    { search: /Ã¡/g, replace: 'á' },
    { search: /Ã±/g, replace: 'ñ' },
    { search: /Ã³/g, replace: 'ó' },
    { search: /Ãº/g, replace: 'ú' },
    { search: /Ã¼/g, replace: 'ü' },
    { search: /Ã¶/g, replace: 'ö' },
    { search: /ÃŸ/g, replace: 'ß' },
    { search: /Ã§/g, replace: 'ç' },
    { search: /Ã¤/g, replace: 'ä' },
    { search: /Ã€/g, replace: 'À' },
    { search: /Ã‰/g, replace: 'É' },
    { search: /Ãˆ/g, replace: 'È' },
    { search: /Ã–/g, replace: 'Ö' },
    { search: /Ãœ/g, replace: 'Ü' },
    { search: /Ã‘/g, replace: 'Ñ' },
    { search: /Ã\s/g, replace: 'à ' }, // Ã followed by space is often à
    { search: /Ã\-/g, replace: 'à-' },
    { search: /Ã'/g, replace: 'à\'' },
    
    // Polish
    { search: /Å‚/g, replace: 'ł' },
    { search: /Å„/g, replace: 'ń' },
    { search: /Å›/g, replace: 'ś' },
    { search: /Åº/g, replace: 'ź' },
    { search: /Å¼/g, replace: 'ż' },
    { search: /Ä‡/g, replace: 'ć' },
    { search: /Ä™/g, replace: 'ę' },
    { search: /Ä…/g, replace: 'ą' },
    { search: /Å/g, replace: 'Ł' }, // Check context
    { search: /Åƒ/g, replace: 'Ń' },
    { search: /Åš/g, replace: 'Ś' },
    { search: /Å¹/g, replace: 'Ź' },
    { search: /Å»/g, replace: 'Ż' },
    { search: /Ä†/g, replace: 'Ć' },
    { search: /Ä\u0098/g, replace: 'Ę' }, // Ä followed by control char?
    { search: /Ä\u0084/g, replace: 'Ą' },

    // Turkish
    { search: /Ä±/g, replace: 'ı' },
    { search: /ÄŸ/g, replace: 'ğ' },
    { search: /ÅŸ/g, replace: 'ş' },
    { search: /Ã§/g, replace: 'ç' },
    { search: /Ã¶/g, replace: 'ö' },
    { search: /Ã¼/g, replace: 'ü' },
    { search: /Ä°/g, replace: 'İ' },
    { search: /Ä/g, replace: 'Ğ' }, // Check context
    { search: /Å/g, replace: 'Ş' }, // Check context
    { search: /Ã‡/g, replace: 'Ç' },
    { search: /Ã–/g, replace: 'Ö' },
    { search: /Ãœ/g, replace: 'Ü' },

    // Lithuanian
    { search: /Ä—/g, replace: 'ė' },
    { search: /Å¡/g, replace: 'š' },
    { search: /Å¾/g, replace: 'ž' },
    { search: /Ä¯/g, replace: 'į' },
    { search: /Å³/g, replace: 'ų' },
    { search: /Ä/g, replace: 'č' }, // Context dependent?
    { search: /Ä…/g, replace: 'ą' },
    { search: /Ä™/g, replace: 'ę' },
    { search: /Å«/g, replace: 'ū' },
    
    // Common Symbols
    { search: /â€“/g, replace: '–' }, // En dash
    { search: /â€”/g, replace: '—' }, // Em dash
    { search: /â€™/g, replace: '’' }, // Right single quote
    { search: /â€˜/g, replace: '‘' }, // Left single quote
    { search: /â€œ/g, replace: '“' }, // Left double quote
    { search: /â€/g, replace: '”' }, // Right double quote (incomplete pattern often)
    { search: /â€¦/g, replace: '…' }, // Ellipsis
    { search: /Â©/g, replace: '©' },
    { search: /Â®/g, replace: '®' },
    { search: /â‚¬/g, replace: '€' },
];

function fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    replacements.forEach(r => {
        newContent = newContent.replace(r.search, r.replace);
    });

    // Special handling for "Ã" which often maps to "à" or "í" depending on next char
    // But usually "Ã" alone is "à" (C3 A0 -> C3=Ã, A0=NBSP? No. C3 83 -> Ãƒ -> Ã)
    // Let's stick to the explicit list above which covers most cases.

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
