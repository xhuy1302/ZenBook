import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { logInSchema } from '@/components/auth/schemas/schemas'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '@/components/common/LanguageSelector'
import type z from 'zod'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthContext } from '@/context/AuthContext'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/defines/error.type'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

// ── Animated Book Illustration ────────────────────────────────────────────────

function BookIllustration() {
  return (
    <div className='relative w-full h-full flex items-center justify-center overflow-hidden select-none'>
      {/* Background glow blobs */}
      <div
        className='absolute w-96 h-96 rounded-full opacity-20 blur-3xl'
        style={{
          background: 'radial-gradient(circle, #4ade80 0%, #16a34a 60%, transparent 100%)',
          top: '10%',
          left: '5%',
          animation: 'blob1 8s ease-in-out infinite'
        }}
      />
      <div
        className='absolute w-72 h-72 rounded-full opacity-15 blur-3xl'
        style={{
          background: 'radial-gradient(circle, #86efac 0%, #22c55e 60%, transparent 100%)',
          bottom: '15%',
          right: '8%',
          animation: 'blob1 10s ease-in-out infinite reverse'
        }}
      />

      {/* Floating particles */}
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className='absolute rounded-full'
          style={{
            width: `${[4, 6, 3, 5, 4, 7, 3, 5, 4, 6, 3, 4, 5, 3][i]}px`,
            height: `${[4, 6, 3, 5, 4, 7, 3, 5, 4, 6, 3, 4, 5, 3][i]}px`,
            background: [
              '#4ade80',
              '#86efac',
              '#22c55e',
              '#bbf7d0',
              '#16a34a',
              '#dcfce7',
              '#4ade80'
            ][i % 7],
            left: `${[15, 75, 30, 82, 55, 8, 68, 42, 88, 22, 60, 35, 78, 48][i]}%`,
            top: `${[20, 15, 70, 45, 80, 55, 25, 90, 35, 60, 10, 40, 65, 85][i]}%`,
            opacity: 0.6,
            animation: `floatParticle${(i % 4) + 1} ${5 + (i % 5)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`
          }}
        />
      ))}

      {/* Main book SVG */}
      <div style={{ animation: 'bookFloat 6s ease-in-out infinite' }}>
        <svg
          width='340'
          height='380'
          viewBox='0 0 340 380'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          {/* Shadow under book */}
          <ellipse
            cx='170'
            cy='362'
            rx='85'
            ry='12'
            fill='rgba(0,0,0,0.18)'
            style={{ animation: 'shadowPulse 6s ease-in-out infinite' }}
          />

          {/* Back cover */}
          <rect x='78' y='62' width='178' height='248' rx='10' fill='#14532d' />
          <rect x='78' y='62' width='20' height='248' rx='4' fill='#166534' />

          {/* Page stack (back pages) */}
          {[...Array(5)].map((_, i) => (
            <rect
              key={i}
              x={98 + i * 1.5}
              y={66 + i}
              width={140 - i * 1}
              height={240 - i * 2}
              rx='2'
              fill={`rgb(${240 + i * 3}, ${248 + i * 2}, ${240 + i * 2})`}
            />
          ))}

          {/* Front cover */}
          <rect x='78' y='60' width='180' height='250' rx='10' fill='url(#coverGrad)' />
          <rect x='78' y='60' width='22' height='250' rx='5' fill='url(#spineGrad)' />

          {/* Cover decoration lines */}
          <rect x='112' y='88' width='114' height='3' rx='1.5' fill='rgba(255,255,255,0.25)' />
          <rect x='112' y='100' width='80' height='2' rx='1' fill='rgba(255,255,255,0.15)' />

          {/* Cover title block */}
          <rect
            x='108'
            y='118'
            width='120'
            height='82'
            rx='8'
            fill='rgba(255,255,255,0.08)'
            stroke='rgba(255,255,255,0.12)'
            strokeWidth='1'
          />
          <rect x='118' y='130' width='76' height='6' rx='3' fill='rgba(255,255,255,0.5)' />
          <rect x='118' y='143' width='88' height='4' rx='2' fill='rgba(255,255,255,0.3)' />
          <rect x='118' y='153' width='60' height='4' rx='2' fill='rgba(255,255,255,0.3)' />
          <rect x='118' y='163' width='72' height='4' rx='2' fill='rgba(255,255,255,0.2)' />
          <rect x='118' y='173' width='50' height='4' rx='2' fill='rgba(255,255,255,0.2)' />
          <rect x='118' y='183' width='66' height='4' rx='2' fill='rgba(255,255,255,0.15)' />

          {/* Book mark ribbon */}
          <rect x='218' y='60' width='12' height='58' fill='#4ade80' />
          <polygon points='218,118 230,118 224,132' fill='#4ade80' />

          {/* Cover bottom author area */}
          <rect x='108' y='270' width='50' height='5' rx='2.5' fill='rgba(255,255,255,0.3)' />
          <rect x='108' y='281' width='36' height='3' rx='1.5' fill='rgba(255,255,255,0.2)' />

          {/* Small leaf/logo on cover */}
          <circle
            cx='224'
            cy='270'
            r='16'
            fill='rgba(255,255,255,0.1)'
            stroke='rgba(255,255,255,0.2)'
            strokeWidth='1'
          />
          <path
            d='M224 262 C224 262 218 268 218 274 C218 278 221 281 224 281 C227 281 230 278 230 274 C230 268 224 262 224 262Z'
            fill='rgba(255,255,255,0.4)'
          />
          <line
            x1='224'
            y1='281'
            x2='224'
            y2='277'
            stroke='rgba(255,255,255,0.4)'
            strokeWidth='1.5'
            strokeLinecap='round'
          />

          {/* Turning page 1 */}
          <g
            style={{
              transformOrigin: '98px 185px',
              animation: 'pageTurn1 4s ease-in-out infinite'
            }}
          >
            <path d='M98 80 Q170 75 238 82 L238 288 Q170 292 98 288 Z' fill='#f0fdf4' />
            <rect x='118' y='105' width='88' height='3' rx='1.5' fill='#86efac' />
            <rect x='118' y='115' width='100' height='2' rx='1' fill='#d1fae5' />
            <rect x='118' y='122' width='74' height='2' rx='1' fill='#d1fae5' />
            <rect x='118' y='129' width='92' height='2' rx='1' fill='#d1fae5' />
            <rect x='118' y='136' width='60' height='2' rx='1' fill='#d1fae5' />
            <rect x='118' y='150' width='88' height='2' rx='1' fill='#e0f2fe' />
            <rect x='118' y='157' width='70' height='2' rx='1' fill='#e0f2fe' />
            <rect x='118' y='164' width='96' height='2' rx='1' fill='#e0f2fe' />
            <rect x='118' y='171' width='54' height='2' rx='1' fill='#e0f2fe' />
          </g>

          {/* Turning page 2 */}
          <g
            style={{
              transformOrigin: '98px 185px',
              animation: 'pageTurn2 4s ease-in-out infinite'
            }}
          >
            <path
              d='M98 82 Q155 78 210 84 L210 286 Q155 290 98 286 Z'
              fill='#f7fee7'
              opacity='0.9'
            />
          </g>

          {/* Gradients & filters */}
          <defs>
            <linearGradient
              id='coverGrad'
              x1='78'
              y1='60'
              x2='258'
              y2='310'
              gradientUnits='userSpaceOnUse'
            >
              <stop offset='0%' stopColor='#16a34a' />
              <stop offset='50%' stopColor='#15803d' />
              <stop offset='100%' stopColor='#14532d' />
            </linearGradient>
            <linearGradient
              id='spineGrad'
              x1='78'
              y1='60'
              x2='100'
              y2='310'
              gradientUnits='userSpaceOnUse'
            >
              <stop offset='0%' stopColor='#166534' />
              <stop offset='100%' stopColor='#052e16' />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating mini elements */}
      <div
        className='absolute'
        style={{ top: '18%', right: '15%', animation: 'floatParticle1 5s ease-in-out infinite' }}
      >
        <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
          <path
            d='M6 8 L16 4 L26 8 L26 24 L16 28 L6 24 Z'
            fill='none'
            stroke='#4ade80'
            strokeWidth='1.5'
            opacity='0.7'
          />
          <line x1='16' y1='4' x2='16' y2='28' stroke='#4ade80' strokeWidth='1' opacity='0.5' />
        </svg>
      </div>
      <div
        className='absolute'
        style={{ bottom: '22%', left: '12%', animation: 'floatParticle2 7s ease-in-out infinite' }}
      >
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
          <circle
            cx='12'
            cy='12'
            r='10'
            fill='none'
            stroke='#86efac'
            strokeWidth='1.5'
            opacity='0.6'
          />
          <circle cx='12' cy='12' r='5' fill='#4ade80' opacity='0.3' />
        </svg>
      </div>
      <div
        className='absolute'
        style={{ top: '60%', right: '10%', animation: 'floatParticle3 6s ease-in-out infinite' }}
      >
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
          <path
            d='M10 2 L12.5 7.5 L18 8 L14 12 L15.5 18 L10 15 L4.5 18 L6 12 L2 8 L7.5 7.5 Z'
            fill='#4ade80'
            opacity='0.5'
          />
        </svg>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-18px) rotate(1deg); }
        }
        @keyframes shadowPulse {
          0%, 100% { rx: 85; opacity: 0.18; }
          50% { rx: 72; opacity: 0.1; }
        }
        @keyframes pageTurn1 {
          0%, 40%, 100% { transform: rotateY(0deg); opacity: 1; }
          60%, 80% { transform: rotateY(-35deg); opacity: 0.7; }
        }
        @keyframes pageTurn2 {
          0%, 50%, 100% { transform: rotateY(0deg); opacity: 0.9; }
          65%, 85% { transform: rotateY(-20deg); opacity: 0.5; }
        }
        @keyframes blob1 {
          0%, 100% { transform: scale(1) translate(0,0); }
          33% { transform: scale(1.15) translate(20px,-15px); }
          66% { transform: scale(0.9) translate(-10px,20px); }
        }
        @keyframes floatParticle1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-12px) translateX(6px); }
        }
        @keyframes floatParticle2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(20deg); }
        }
        @keyframes floatParticle3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.2); }
        }
        @keyframes floatParticle4 {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-14px) translateX(-8px) rotate(-15deg); }
        }
      `}</style>
    </div>
  )
}

// ── Login Form ─────────────────────────────────────────────────────────────────

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type LogInFormValue = z.infer<typeof logInSchema>
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LogInFormValue>({
    resolver: zodResolver(logInSchema)
  })

  const onSubmit = async (data: LogInFormValue) => {
    if (!authContext) return
    try {
      const res = await authContext.login(data.email, data.password)
      toast.success(t('login.messages.success'))
      const roles = res.user.roles || []
      if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>
      const message = axiosError.response?.data?.message || t('login.errors.failed')
      toast.error(message)
    }
  }

  return (
    <div className={cn('min-h-screen w-full flex', className)} {...props}>
      {/* ── Left panel: Form ── */}
      <div className='flex-1 flex flex-col justify-center items-center px-8 py-12 bg-background relative overflow-hidden'>
        {/* Subtle bg pattern */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34,197,94,0.06) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className='w-full max-w-sm relative z-10'>
          {/* Language selector */}
          <div className='flex justify-end mb-8'>
            <LanguageSelector />
          </div>

          {/* Logo */}
          <a href='/' className='flex items-center gap-2 mb-10 w-fit'>
            <img
              src='https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/Logo/Zen+Book.png'
              alt='Logo'
              className='h-9 w-auto object-contain'
            />
          </a>

          {/* Heading */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-foreground tracking-tight mb-2'>
              {t('login.title')}
            </h1>
            <p className='text-muted-foreground text-sm'>{t('login.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            {/* Email */}
            <div className='space-y-1.5'>
              <label htmlFor='email' className='text-sm font-medium text-foreground'>
                {t('login.email')}
              </label>
              <div className='relative'>
                <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <input
                  id='email'
                  type='text'
                  placeholder='zenbook@gmail.com'
                  autoComplete='off'
                  {...register('email')}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm text-foreground transition-all outline-none',
                    'focus:ring-2 focus:ring-green-500/30 focus:border-green-500',
                    'placeholder:text-muted-foreground/50',
                    errors.email ? 'border-destructive' : 'border-border hover:border-green-400/60'
                  )}
                />
              </div>
              {errors.email && (
                <p className='text-destructive text-xs mt-1'>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className='space-y-1.5'>
              <label htmlFor='password' className='text-sm font-medium text-foreground'>
                {t('login.password')}
              </label>
              <div className='relative'>
                <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  {...register('password')}
                  className={cn(
                    'w-full pl-10 pr-11 py-3 rounded-xl border bg-background text-sm text-foreground transition-all outline-none',
                    'focus:ring-2 focus:ring-green-500/30 focus:border-green-500',
                    'placeholder:text-muted-foreground/50',
                    errors.password
                      ? 'border-destructive'
                      : 'border-border hover:border-green-400/60'
                  )}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              {errors.password && (
                <p className='text-destructive text-xs mt-1'>{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all'
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 24px rgba(34,197,94,0.35)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {isSubmitting ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <>
                  {t('login.loginButton')}
                  <ArrowRight className='w-4 h-4' />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className='text-center text-sm text-muted-foreground mt-6'>
            {t('login.noAccount')}{' '}
            <a
              href='/signup'
              className='font-semibold text-green-600 hover:text-green-500 transition-colors'
            >
              {t('login.signUp')}
            </a>
          </p>
        </div>
      </div>

      {/* ── Right panel: Illustration ── */}
      <div
        className='hidden lg:flex flex-1 relative overflow-hidden items-center justify-center'
        style={{
          background: 'linear-gradient(145deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)'
        }}
      >
        {/* Grid overlay */}
        <div
          className='absolute inset-0 pointer-events-none opacity-10'
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <BookIllustration />

        {/* Bottom quote */}
        <div className='absolute bottom-10 left-0 right-0 px-12 text-center'>
          <p className='text-green-200/70 text-sm italic leading-relaxed'>
            "A reader lives a thousand lives before he dies."
          </p>
          <p className='text-green-300/50 text-xs mt-1'>— George R.R. Martin</p>
        </div>
      </div>
    </div>
  )
}
