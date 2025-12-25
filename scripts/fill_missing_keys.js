const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');
const enPath = path.join(localesDir, 'en.json');
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

function unflatten(data) {
    if (Object(data) !== data || Array.isArray(data)) return data;
    var result = {}, cur, prop, idx, last, temp;
    for(var p in data) {
        cur = result, prop = "", last = 0;
        do {
            idx = p.indexOf(".", last);
            temp = p.substring(last, idx !== -1 ? idx : undefined);
            cur = cur[temp] || (cur[temp] = {});
            prop = temp;
            last = idx + 1;
        } while(idx >= 0);
        cur[prop] = data[p];
    }
    return result[""] || result;
}

// Better unflatten that preserves existing structure
function setDeep(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

const enFlat = flatten(enContent);
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

files.forEach(file => {
    const filePath = path.join(localesDir, file);
    let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const flat = flatten(content);
    let modified = false;

    for (const key in enFlat) {
        if (!flat.hasOwnProperty(key)) {
            console.log(`[${file}] Adding missing key: ${key}`);
            setDeep(content, key, enFlat[key]);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    }
});
