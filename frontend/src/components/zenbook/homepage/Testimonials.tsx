import { useTranslation } from 'react-i18next'
import { Star, Quote } from 'lucide-react'

const testimonialKeys = ['1', '2', '3'] as const

export default function Testimonials() {
  const { t } = useTranslation('common')

  return (
    <section className='max-w-7xl mx-auto px-4 py-6'>
      <div className='text-center mb-6'>
        <h2 className='font-serif text-xl font-bold text-foreground'>{t('testimonials.title')}</h2>
        <p className='text-sm text-muted-foreground mt-1'>{t('testimonials.subtitle')}</p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {testimonialKeys.map((key) => (
          <div
            key={key}
            className='bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow'
          >
            <Quote className='w-6 h-6 text-brand-green-light fill-brand-green-light' />
            <p className='text-sm text-foreground leading-relaxed flex-1'>
              {t(`testimonials.items.${key}.comment`)}
            </p>
            <div className='flex gap-0.5'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < (key === '3' ? 4 : 5) ? 'text-brand-amber fill-brand-amber' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <div className='flex items-center gap-2.5 pt-1 border-t border-border'>
              <div className='w-8 h-8 rounded-full bg-brand-green flex items-center justify-center shrink-0'>
                <span className='text-xs font-bold text-primary-foreground'>
                  {t(`testimonials.items.${key}.name`)
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <p className='text-sm font-semibold text-foreground'>
                  {t(`testimonials.items.${key}.name`)}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t(`testimonials.items.${key}.location`)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
