import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

const languages = [
  { code: 'vi', label: 'Tiếng Việt', flag: 'https://flagcdn.com/w20/vn.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w20/gb.png' } // Có thể đổi gb.png thành us.png nếu muốn cờ Mỹ
]

export default function LocaleSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Lấy ngôn ngữ hiện tại, mặc định là 'vi'
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0]

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-1.5 hover:bg-white/15 px-2.5 py-1.5 rounded-lg transition-all'
      >
        <img
          src={currentLang.flag}
          alt={currentLang.code}
          className='w-4 h-auto rounded-[2px] shadow-sm'
        />
        <span className='uppercase font-bold tracking-wide'>{currentLang.code}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200'>
          <div className='py-1'>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors ${
                  currentLang.code === lang.code
                    ? 'bg-brand-green/10 text-brand-green font-bold'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <img
                  src={lang.flag}
                  alt={lang.code}
                  className='w-4 h-auto rounded-[2px] shadow-sm'
                />
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
