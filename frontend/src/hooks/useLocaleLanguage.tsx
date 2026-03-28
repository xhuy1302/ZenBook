import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type LanguageCode } from '@/defines/language-constants'

export interface UseLocaleLanguageResult {
  currentLanguage?: LanguageCode
  changeLanguage: (lang: LanguageCode) => void
  languages: typeof LANGUAGES
}

export function useLocaleLanguage(): UseLocaleLanguageResult {
  const { i18n } = useTranslation()

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((lang) => lang.code === i18n.resolvedLanguage)?.code
  }, [i18n.resolvedLanguage])

  const changeLanguage = useCallback(
    (lang: LanguageCode) => {
      if (lang !== i18n.resolvedLanguage) {
        i18n.changeLanguage(lang)
      }
    },
    [i18n]
  )

  return {
    currentLanguage,
    changeLanguage,
    languages: LANGUAGES
  }
}
