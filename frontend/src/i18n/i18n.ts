import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import resources from 'virtual:i18next-loader'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'LANGUAGE'
    },
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
