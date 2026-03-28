import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useLocaleLanguage } from '@/hooks/useLocaleLanguage'
import { useId } from 'react'

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLocaleLanguage()

  const id = useId()
  return (
    <>
      <div className='w-40 max-w-xs space-y-2'>
        <Select value={currentLanguage} onValueChange={changeLanguage}>
          <SelectTrigger
            id={id}
            className='[&>span_svg]:text-muted-foreground/80 w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0'
          >
            <SelectValue placeholder='Select framework' />
          </SelectTrigger>
          <SelectContent className='[&_*[role=option]>span>svg]:text-muted-foreground/80 max-h-100 [&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0'>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <img src={lang.flag} alt={`${lang.label} flag`} className='h-4 w-5' />{' '}
                <span className='truncate'>{lang.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
