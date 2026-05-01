import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { useLocaleLanguage } from '@/hooks/useLocaleLanguage'
import { Check } from 'lucide-react'

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLocaleLanguage()
  const current = languages.find((l) => l.code === currentLanguage)

  return (
    <Select value={currentLanguage} onValueChange={changeLanguage}>
      <SelectTrigger
        className='
          group h-9 w-auto min-w-[130px] gap-2 px-2.5
          bg-background border border-border/60
          hover:border-border hover:bg-muted/30
          focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
          data-[state=open]:border-indigo-400 data-[state=open]:ring-2 data-[state=open]:ring-indigo-500/20
          rounded-lg shadow-sm transition-all duration-150
          [&>svg]:text-muted-foreground [&>svg]:group-data-[state=open]:text-indigo-500 [&>svg]:transition-colors
          [&>span]:hidden
        '
      >
        <img
          src={current?.flag}
          alt={current?.label}
          width={26}
          height={18}
          style={{
            width: 26,
            height: 18,
            objectFit: 'cover',
            borderRadius: 3,
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        />
        <span className='text-[13px] font-medium text-foreground truncate'>
          {current?.label ?? 'Ngôn ngữ'}
        </span>
      </SelectTrigger>

      <SelectContent
        align='end'
        sideOffset={6}
        className='min-w-[180px] p-0 rounded-xl border border-border/70 shadow-xl overflow-hidden'
      >
        {/* Header */}
        <div className='px-3 py-2 border-b border-border/50 bg-muted/30'>
          <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-widest'>
            Chọn ngôn ngữ
          </p>
        </div>

        {languages.map((lang) => {
          const isSelected = lang.code === currentLanguage
          return (
            <SelectItem
              key={lang.code}
              value={lang.code}
              className={`
                p-0 cursor-pointer transition-colors duration-100
                focus:bg-indigo-50 dark:focus:bg-indigo-950/40
                ${isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''}
                border-b border-border/30 last:border-0
                [&>span:first-child]:hidden
              `}
            >
              {/* Bọc trong div flex để kiểm soát layout, không phụ thuộc vào shadcn internals */}
              <div className='flex items-center gap-2.5 px-3 py-2.5 w-full'>
                <img
                  src={lang.flag}
                  alt={lang.label}
                  width={24}
                  height={16}
                  style={{
                    width: 24,
                    height: 16,
                    objectFit: 'cover',
                    borderRadius: 2,
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.10)'
                  }}
                />

                {/* Tên + code trên 1 hàng */}
                <span
                  className={`text-[13px] font-medium truncate flex-1 ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground'}`}
                >
                  {lang.label}
                </span>

                <span className='text-[10px] text-muted-foreground font-mono shrink-0'>
                  {lang.code}
                </span>

                {isSelected ? (
                  <Check size={13} className='text-indigo-500 shrink-0' strokeWidth={2.5} />
                ) : (
                  <span className='w-[13px] shrink-0' />
                )}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
