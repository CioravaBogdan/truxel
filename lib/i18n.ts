import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import ro from '@/locales/ro.json';
import pl from '@/locales/pl.json';
import tr from '@/locales/tr.json';
import lt from '@/locales/lt.json';
import es from '@/locales/es.json';

const resources = {
  en: { translation: en },
  ro: { translation: ro },
  pl: { translation: pl },
  tr: { translation: tr },
  lt: { translation: lt },
  es: { translation: es },
};

export const supportedLanguages = ['en', 'ro', 'pl', 'tr', 'lt', 'es'];

// Don't auto-detect device language - use 'en' as default
// Language will be set from user profile preference
const getDefaultLanguage = () => {
  return 'en'; // Always start with English
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: getDefaultLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
