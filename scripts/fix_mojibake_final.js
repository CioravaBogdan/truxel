const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');

// Windows-1252 to Byte mapping for 0x80-0x9F
const win1252 = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
    'ˆ': 0x88, '‰': 0x89, 'Š': 0x8A, '‹': 0x8B, 'Œ': 0x8C, 'Ž': 0x8E,
    '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
    '˜': 0x98, '™': 0x99, 'š': 0x9A, '›': 0x9B, 'œ': 0x9C, 'ž': 0x9E, 'Ÿ': 0x9F,
    // NBSP is 0xA0, which is handled by charCodeAt check usually, but let's be safe
    '\u00A0': 0xA0
};

function stringToWin1252Bytes(str) {
    const bytes = [];
    let valid = true;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const code = char.charCodeAt(0);
        if (code < 0x80) {
            bytes.push(code);
        } else if (code >= 0xA0 && code <= 0xFF) {
            bytes.push(code);
        } else if (win1252[char]) {
            bytes.push(win1252[char]);
        } else {
            // Character not in Win1252 single-byte range
            // This means the string contains something that CANNOT be the result of Win1252 decoding
            // e.g. a real Emoji, or a real Cyrillic char (if we are looking at mojibake)
            // If we are trying to "reverse" mojibake, we expect ONLY Win1252 chars.
            // So if we see a real 'Î' (0xCE), it fits in 0xA0-0xFF.
            // But if we see '🚀' (U+1F680), it does NOT fit.
            // So if we encounter a char that doesn't fit, this string is probably NOT (pure) mojibake
            // or it's mixed.
            // However, for the purpose of "fixing", if we can't map it to a byte, we can't reconstruct the UTF-8.
            valid = false;
            break;
        }
    }
    return valid ? Buffer.from(bytes) : null;
}

function fixString(str) {
    if (!str) return str;
    
    // Optimization: If string is ASCII, no need to fix
    if (/^[\x00-\x7F]*$/.test(str)) return str;

    const bytes = stringToWin1252Bytes(str);
    if (!bytes) return str; // Contains chars not in Win1252, so probably already fixed or different encoding

    try {
        const decoded = bytes.toString('utf8');
        
        // Validation:
        // 1. Should not contain replacement char 
        if (decoded.includes('\uFFFD')) return str;
        
        // 2. Heuristic: If the decoded string is shorter, it's a good sign (multibyte -> single char)
        // e.g. ÃŽ (2) -> Î (1)
        // But sometimes length is same: Ã© (2) -> é (1)? No, Ã© is 2 chars. é is 1 char.
        // Wait, JS string length counts UTF-16 code units.
        // 'ÃŽ'.length = 2. 'Î'.length = 1.
        // 'ðŸš€'.length = 4. '🚀'.length = 2 (surrogate pair).
        
        // 3. If the original contained "Mojibake markers" and the new one doesn't?
        // Markers: Ã, Å, ð, â, etc.
        // This is hard to generalize.
        
        // Let's rely on the fact that we successfully reconstructed valid UTF-8 from what looked like Win1252 bytes.
        // And that the result is different.
        if (decoded !== str) {
            return decoded;
        }
    } catch (e) {
        return str;
    }
    return str;
}

function processObject(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = fixString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            processObject(obj[key]);
        }
    }
}

fs.readdirSync(localesDir).forEach(file => {
    if (file.endsWith('.json') && file !== 'en.json') {
        const filePath = path.join(localesDir, file);
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        try {
            const json = JSON.parse(content);
            processObject(json);
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
});
