import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

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

const supportedLanguages = ['en', 'ro', 'pl', 'tr', 'lt', 'es'];

const getDeviceLanguage = () => {
  const deviceLanguage = Localization.locale.split('-')[0];
  return supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
