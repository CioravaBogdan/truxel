const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');
const enPath = path.join(localesDir, 'en.json');

if (!fs.existsSync(enPath)) {
    console.error('en.json not found!');
    process.exit(1);
}

const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function flatten(obj, prefix = '', res = {}) {
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            flatten(value, newKey, res);
        } else {
            res[newKey] = value;
        }
    }
    return res;
}

const enFlat = flatten(enContent);
const enKeys = Object.keys(enFlat);

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

const report = {};

files.forEach(file => {
    const lang = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    let content;
    try {
        content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Error parsing ${file}:`, e.message);
        return;
    }

    const flat = flatten(content);
    const missing = [];
    const identical = [];
    const empty = [];

    enKeys.forEach(key => {
        if (!flat.hasOwnProperty(key)) {
            missing.push(key);
        } else {
            const val = flat[key];
            if (!val) {
                empty.push(key);
            } else if (val === enFlat[key] && val.length > 5 && !/^[0-9\W]+$/.test(val)) {
                // Only flag identical if length > 5 and not just numbers/symbols
                // Common words like "Email", "SMS" might be identical, so we need to be careful.
                // We'll flag them for review.
                identical.push({ key, value: val });
            }
        }
    });

    report[lang] = {
        missingCount: missing.length,
        identicalCount: identical.length,
        emptyCount: empty.length,
        missing: missing.slice(0, 20), // Limit output
        identical: identical.slice(0, 20),
        empty: empty
    };
});

console.log(JSON.stringify(report, null, 2));
