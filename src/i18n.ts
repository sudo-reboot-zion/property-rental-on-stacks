import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en/translation.json';
import de from './locales/de/translation.json';
import es from './locales/es/translation.json';
import sv from './locales/sv/translation.json';
import ru from './locales/ru/translation.json';

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources: {
            en: { translation: en },
            de: { translation: de },
            es: { translation: es },
            sv: { translation: sv },
            ru: { translation: ru },
        },
        fallbackLng: 'en', // Fallback language
        debug: false,
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
