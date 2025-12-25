const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../locales/uk.json');

// Windows-1252 to Byte mapping for 0x80-0x9F
const win1252Map = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
    'ˆ': 0x88, '‰': 0x89, 'Š': 0x8A, '‹': 0x8B, 'Œ': 0x8C, 'Ž': 0x8E,
    '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
    '˜': 0x98, '™': 0x99, 'š': 0x9A, '›': 0x9B, 'œ': 0x9C, 'ž': 0x9E, 'Ÿ': 0x9F
};

function fixString(str) {
    if (!/[ÐÑ]/.test(str)) return str;

    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const code = char.charCodeAt(0);

        if (code < 0x80) {
            bytes.push(code);
        } else if (code >= 0x80 && code <= 0x9F) {
            // Map U+0080..U+009F directly to bytes 0x80..0x9F
            // This handles ISO-8859-1 control codes
            bytes.push(code);
        } else if (code >= 0xA0 && code <= 0xFF) {
            bytes.push(code);
        } else if (win1252Map[char] !== undefined) {
            bytes.push(win1252Map[char]);
        } else {
            // console.log(`Skipping string "${str.substring(0, 20)}..." due to char "${char}" (${code})`);
            return str;
        }
    }

    try {
        const buffer = Buffer.from(bytes);
        const decoded = buffer.toString('utf8');
        if (decoded.includes('\uFFFD')) return str;
        return decoded;
    } catch (e) {
        return str;
    }
}

function traverse(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            const original = obj[key];
            const fixed = fixString(original);
            if (original !== fixed) {
                // console.log(`Fixed: "${original.substring(0, 20)}..." -> "${fixed.substring(0, 20)}..."`);
                obj[key] = fixed;
            }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key]);
        }
    }
}

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    traverse(json);
    
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    console.log('Successfully processed uk.json');
    
} catch (e) {
    console.error('Failed to process uk.json:', e);
}
