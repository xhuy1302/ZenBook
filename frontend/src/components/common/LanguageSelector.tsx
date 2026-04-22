import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useLocaleLanguage } from '@/hooks/useLocaleLanguage'

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLocaleLanguage()

  return (
    <Select value={currentLanguage} onValueChange={changeLanguage}>
      {/* 👉 Dùng [&>span]:flex để ép nội dung hiển thị trên Trigger luôn nằm ngang */}
      <SelectTrigger className='w-[140px] h-9 bg-transparent border-border hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 [&>span]:flex [&>span]:items-center [&>span]:gap-2 shadow-sm rounded-md'>
        <SelectValue placeholder='Ngôn ngữ' />
      </SelectTrigger>

      <SelectContent align='end' className='min-w-[140px]'>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className='cursor-pointer'>
            {/* 👉 Khối Flexbox này đảm bảo Cờ và Chữ dính chặt trên 1 dòng */}
            <div className='flex items-center gap-2 font-medium'>
              <img
                src={lang.flag}
                alt={`${lang.label} flag`}
                className='w-5 h-3.5 object-cover rounded-[2px] border border-muted shadow-sm shrink-0'
              />
              <span className='truncate'>{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
