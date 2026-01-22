import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations, type TranslationKeys } from '../locales/translations';

const resources: Record<string, { translation: TranslationKeys }> =
  Object.entries(translations).reduce((prev, [key, value]) => {
    return { ...prev, [key]: { translation: value } };
  }, {});

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
