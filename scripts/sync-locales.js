const fs = require('fs');
const path = require('path');
const BASE_LANG = 'en';
const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const PLACEHOLDER_REGEX = /\{\{\s*[^}]+\s*\}\}/g;
const translationCache = new Map();
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';

const availableLocales = fs
  .readdirSync(LOCALES_DIR)
  .filter((file) => file.endsWith('.json') && file !== `${BASE_LANG}.json`)
  .map((file) => path.basename(file, '.json'));

const requestedLocales = process.argv.slice(2);
const locales = requestedLocales.length
  ? requestedLocales.filter((locale) => {
    if (!availableLocales.includes(locale)) {
      console.warn(`Locale "${locale}" not found. Skipping.`);
      return false;
    }
    return true;
  })
  : availableLocales;

const baseLocale = JSON.parse(
  fs.readFileSync(path.join(LOCALES_DIR, `${BASE_LANG}.json`), 'utf8'),
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeRegExp = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const protectPlaceholders = (text) => {
  const matches = text.match(PLACEHOLDER_REGEX) || [];
  let result = text;
  matches.forEach((placeholder, index) => {
    const token = `__PH_${index}__`;
    result = result.replace(new RegExp(escapeRegExp(placeholder), 'g'), token);
  });
  return { text: result, placeholders: matches };
};

const restorePlaceholders = (text, placeholders) => {
  let result = text;
  placeholders.forEach((placeholder, index) => {
    const token = new RegExp(`__PH_${index}__`, 'g');
    result = result.replace(token, placeholder);
  });
  return result;
};

const translateValue = async (value, lang, keyPath) => {
  if (typeof value !== 'string' || !value.trim()) {
    return value;
  }

  const cacheKey = `${lang}|||${value}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const { text, placeholders } = protectPlaceholders(value);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const params = new URLSearchParams({
        client: 'gtx',
        sl: 'en',
        tl: lang,
        dt: 't',
        q: text,
      });
      await sleep(100);
      const response = await fetch(`${GOOGLE_TRANSLATE_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const translatedText = Array.isArray(data?.[0])
        ? data[0].map((item) => (Array.isArray(item) ? item[0] : '')).join('')
        : '';
      const translated = restorePlaceholders(translatedText, placeholders);
      translationCache.set(cacheKey, translated);
      console.log(`[${lang}] ${keyPath}`);
      return translated;
    } catch (error) {
      console.warn(
        `[${lang}] Failed to translate ${keyPath} (attempt ${attempt}): ${error.message}`,
      );
      await sleep(1000 * attempt);
    }
  }

  throw new Error(`Unable to translate key ${keyPath} for ${lang}`);
};

const syncNode = async (baseNode, existingNode, lang, keyPath) => {
  if (typeof baseNode === 'string') {
    if (typeof existingNode === 'string' && existingNode.trim()) {
      return existingNode;
    }
    return translateValue(baseNode, lang, keyPath);
  }

  if (Array.isArray(baseNode)) {
    const result = [];
    const existingArray = Array.isArray(existingNode) ? existingNode : [];
    for (let i = 0; i < baseNode.length; i += 1) {
      const nextPath = `${keyPath}[${i}]`;
      result[i] = await syncNode(baseNode[i], existingArray[i], lang, nextPath);
    }
    return result;
  }

  if (baseNode && typeof baseNode === 'object') {
    const result = {};
    const existingObject = existingNode && typeof existingNode === 'object'
      ? existingNode
      : {};

    for (const key of Object.keys(baseNode)) {
      const nextPath = keyPath ? `${keyPath}.${key}` : key;
      result[key] = await syncNode(baseNode[key], existingObject[key], lang, nextPath);
    }
    return result;
  }

  return baseNode;
};

const syncLocale = async (lang) => {
  const targetPath = path.join(LOCALES_DIR, `${lang}.json`);
  const existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const synced = await syncNode(baseLocale, existing, lang, '');
  fs.writeFileSync(targetPath, `${JSON.stringify(synced, null, 2)}\n`);
};

(async () => {
  for (const lang of locales) {
    console.log(`\n>>> Syncing ${lang}`);
    await syncLocale(lang);
  }
  console.log('\nAll locales updated.');
})();
