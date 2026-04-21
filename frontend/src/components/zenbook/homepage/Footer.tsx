import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Mail,
  MessageCircle,
  Share2,
  Camera,
  Video,
  CreditCard,
  Smartphone,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const paymentMethods = [
  { name: 'Visa', icon: CreditCard },
  { name: 'Mastercard', icon: CreditCard },
  { name: 'PayPal', icon: Wallet },
  { name: 'Apple Pay', icon: Smartphone },
  { name: 'Google Pay', icon: Smartphone }
]

const socialLinks = [
  { name: 'Facebook', Icon: MessageCircle },
  { name: 'Twitter', Icon: Share2 },
  { name: 'Instagram', Icon: Camera },
  { name: 'YouTube', Icon: Video }
]

const sectionKeys = ['about', 'support', 'policies'] as const

export default function Footer() {
  const { t } = useTranslation('common')
  const year = new Date().getFullYear()

  // MẸO XỬ LÝ TYPESCRIPT KHÔNG DÙNG 'any':
  // Tạo hàm bọc (wrapper) để vượt qua strict type của i18next mà ESLint không bắt bẻ
  const safeTranslate = t as unknown as (key: string, options?: Record<string, unknown>) => string
  const safeTranslateArray = t as unknown as (
    key: string,
    options?: Record<string, unknown>
  ) => string[]

  return (
    <footer className='bg-neutral-900 text-neutral-200 mt-8'>
      <div className='max-w-7xl mx-auto px-4 py-10'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8'>
          {/* Brand Column */}
          <div className='lg:col-span-1'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center'>
                <BookOpen className='w-4 h-4 text-primary-foreground' />
              </div>
              <div>
                <div className='font-serif font-bold text-base text-neutral-50 leading-none'>
                  ZenBook
                </div>
                <div className='text-[10px] text-neutral-400 leading-none'>The Wise Owl</div>
              </div>
            </div>
            {/* Sử dụng safeTranslate thay cho t() */}
            <p className='text-xs text-neutral-400 leading-relaxed mb-4'>
              {safeTranslate('footer.tagline')}
            </p>
            <div className='flex gap-2'>
              {socialLinks.map(({ name, Icon }) => (
                <a
                  key={name}
                  href='#'
                  aria-label={name}
                  className='w-7 h-7 rounded-full bg-neutral-800 hover:bg-brand-green flex items-center justify-center transition-colors'
                >
                  <Icon className='w-3.5 h-3.5 text-neutral-300' />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {sectionKeys.map((section) => {
            // Sử dụng safeTranslateArray để lấy mảng an toàn
            const links = safeTranslateArray(`footer.${section}.links`, { returnObjects: true })

            return (
              <div key={section}>
                <h3 className='text-sm font-semibold text-neutral-50 mb-3'>
                  {safeTranslate(`footer.${section}.title`)}
                </h3>
                <ul className='flex flex-col gap-2'>
                  {Array.isArray(links) &&
                    links.map((link: string) => (
                      <li key={link}>
                        <Link
                          to='#'
                          className='text-xs text-neutral-400 hover:text-neutral-50 transition-colors'
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )
          })}

          {/* Payment & Newsletter */}
          <div>
            <h3 className='text-sm font-semibold text-neutral-50 mb-3'>
              {safeTranslate('footer.paymentTitle')}
            </h3>
            <div className='flex flex-wrap gap-2 mb-5'>
              {paymentMethods.map((p) => (
                <div
                  key={p.name}
                  className='flex items-center gap-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1'
                  title={p.name}
                >
                  <p.icon className='w-3 h-3 text-neutral-300' />
                  <span className='text-[9px] text-neutral-300 font-medium'>{p.name}</span>
                </div>
              ))}
            </div>
            <h3 className='text-sm font-semibold text-neutral-50 mb-2'>
              {safeTranslate('footer.newsletterTitle')}
            </h3>
            <p className='text-xs text-neutral-400 mb-2'>
              {safeTranslate('footer.newsletterDesc')}
            </p>
            <div className='flex gap-2'>
              <Input
                type='email'
                placeholder={safeTranslate('footer.emailPlaceholder')}
                className='h-8 text-xs bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-brand-green/40'
              />
              <Button
                size='sm'
                className='h-8 px-3 bg-brand-green hover:bg-brand-green-dark text-primary-foreground text-xs shrink-0'
              >
                <Mail className='w-3 h-3' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-neutral-800'>
        <div className='max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2'>
          <p className='text-xs text-neutral-500'>{safeTranslate('footer.copyright', { year })}</p>
          <p className='text-xs text-neutral-500'>{safeTranslate('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  )
}
