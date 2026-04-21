import { useTranslation } from 'react-i18next'
import { Truck, RefreshCw, Shield, Headphones } from 'lucide-react'

const icons = [Truck, RefreshCw, Shield, Headphones]
const keys = ['shipping', 'returns', 'secure', 'support'] as const

export default function TrustBanner() {
  const { t } = useTranslation('common')

  return (
    <div className='max-w-7xl mx-auto px-4 py-4'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {keys.map((key, i) => {
          const Icon = icons[i]
          return (
            <div
              key={key}
              className='flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:border-brand-green/40 transition-colors'
            >
              <div className='w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center shrink-0'>
                <Icon className='w-4 h-4 text-brand-green' />
              </div>
              <div>
                <p className='text-sm font-semibold text-foreground'>{t(`trust.${key}.title`)}</p>
                <p className='text-xs text-muted-foreground'>{t(`trust.${key}.desc`)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
