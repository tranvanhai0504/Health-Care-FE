import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '@/locales/en';
import viTranslations from '@/locales/vi';

const resources = {
  en: {
    translation: enTranslations,
  },
  vi: {
    translation: viTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
