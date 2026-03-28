export const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'https://flagpedia.net/data/flags/w1160/us.webp' },
  { code: 'vi', label: 'Tiếng Việt', flag: 'https://flagpedia.net/data/flags/w1160/vn.webp' }
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']
