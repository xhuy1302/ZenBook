import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LocaleSwitcher() {
  const { i18n } = useTranslation()
  const locale = i18n.language || 'vi'

  function switchLocale(next: string) {
    i18n.changeLanguage(next)
  }

  return (
    <div className='flex items-center gap-1 border border-primary-foreground/30 rounded px-1.5 py-0.5'>
      <Globe className='w-3 h-3 text-primary-foreground/70' />
      <button
        onClick={() => switchLocale('vi')}
        className={`text-xs font-medium px-1 transition-opacity ${locale === 'vi' ? 'text-primary-foreground font-bold' : 'text-primary-foreground/60 hover:text-primary-foreground'}`}
        aria-label='Tiếng Việt'
      >
        VI
      </button>
      <span className='text-primary-foreground/30 text-xs'>|</span>
      <button
        onClick={() => switchLocale('en')}
        className={`text-xs font-medium px-1 transition-opacity ${locale === 'en' ? 'text-primary-foreground font-bold' : 'text-primary-foreground/60 hover:text-primary-foreground'}`}
        aria-label='English'
      >
        EN
      </button>
    </div>
  )
}
