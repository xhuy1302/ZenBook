import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signUpSchema } from '@/components/auth/schemas/schemas'
import LanguageSelector from '@/components/common/LanguageSelector'
import { Trans, useTranslation } from 'react-i18next'
import type { z } from 'zod'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSignUp } from '@/hooks/user-signup'
import type { ApiErrorResponse } from '@/defines/error.type'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

// ── Animated Book Stack Illustration ─────────────────────────────────────────

function BookStackIllustration() {
  return (
    <div className='relative w-full h-full flex items-center justify-center overflow-hidden select-none'>
      {/* Glow blobs */}
      <div
        className='absolute rounded-full opacity-20 blur-3xl'
        style={{
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, #4ade80, #15803d, transparent)',
          top: '5%',
          right: '0%',
          animation: 'blob1 9s ease-in-out infinite'
        }}
      />
      <div
        className='absolute rounded-full opacity-15 blur-3xl'
        style={{
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, #86efac, #166534, transparent)',
          bottom: '10%',
          left: '5%',
          animation: 'blob1 11s ease-in-out infinite reverse'
        }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className='absolute rounded-full'
          style={{
            width: `${[5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 3, 5][i]}px`,
            height: `${[5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 3, 5][i]}px`,
            background: ['#4ade80', '#86efac', '#22c55e', '#bbf7d0', '#16a34a'][i % 5],
            left: `${[12, 80, 25, 88, 50, 10, 70, 35, 85, 20, 60, 45][i]}%`,
            top: `${[25, 12, 72, 40, 85, 50, 20, 88, 32, 65, 15, 55][i]}%`,
            opacity: 0.55,
            animation: `floatP${(i % 4) + 1} ${5 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.45}s`
          }}
        />
      ))}

      {/* Book stack */}
      <div style={{ animation: 'stackFloat 6.5s ease-in-out infinite', position: 'relative' }}>
        <svg
          width='320'
          height='380'
          viewBox='0 0 320 380'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          {/* Shadow */}
          <ellipse
            cx='160'
            cy='362'
            rx='100'
            ry='10'
            fill='rgba(0,0,0,0.2)'
            style={{ animation: 'shadowPulse 6.5s ease-in-out infinite' }}
          />

          {/* ── Book 3 (bottom) ── */}
          <g style={{ animation: 'book3Float 6.5s ease-in-out infinite' }}>
            <rect x='55' y='258' width='210' height='32' rx='6' fill='#064e3b' />
            <rect x='55' y='258' width='18' height='32' rx='4' fill='#065f46' />
            {/* Pages */}
            {[...Array(4)].map((_, i) => (
              <rect
                key={i}
                x={73 + i * 1.5}
                y={260 + i * 0.5}
                width={186 - i * 3}
                height={28 - i}
                rx='1'
                fill={`rgb(${248 - i * 2},${250 - i},${248 - i * 2})`}
              />
            ))}
            <rect
              x='73'
              y='258'
              width='193'
              height='32'
              rx='3'
              fill='none'
              stroke='rgba(255,255,255,0.04)'
              strokeWidth='1'
            />
          </g>

          {/* ── Book 2 (middle) ── */}
          <g style={{ animation: 'book2Float 5.5s ease-in-out infinite' }}>
            <rect x='62' y='188' width='196' height='74' rx='8' fill='#1e3a5f' />
            <rect x='62' y='188' width='20' height='74' rx='5' fill='#1e4080' />
            {/* Pages */}
            {[...Array(5)].map((_, i) => (
              <rect
                key={i}
                x={82 + i * 1.5}
                y={191 + i}
                width={174 - i * 3}
                height={68 - i * 2}
                rx='1.5'
                fill={`rgb(${245 - i * 2},${248 - i},${252 - i * 2})`}
              />
            ))}
            {/* Cover lines */}
            <rect x='97' y='206' width='90' height='4' rx='2' fill='rgba(255,255,255,0.25)' />
            <rect x='97' y='215' width='66' height='2.5' rx='1.25' fill='rgba(255,255,255,0.15)' />
            <rect x='97' y='222' width='76' height='2.5' rx='1.25' fill='rgba(255,255,255,0.12)' />
            <rect x='97' y='229' width='58' height='2.5' rx='1.25' fill='rgba(255,255,255,0.1)' />
            {/* Bookmark */}
            <rect x='230' y='188' width='10' height='36' fill='#38bdf8' />
            <polygon points='230,224 240,224 235,232' fill='#38bdf8' />
          </g>

          {/* ── Book 1 (top / main) ── */}
          <g style={{ animation: 'book1Float 7s ease-in-out infinite' }}>
            {/* Back */}
            <rect x='68' y='60' width='184' height='132' rx='9' fill='#14532d' />
            <rect x='68' y='60' width='21' height='132' rx='5' fill='#166534' />
            {/* Pages */}
            {[...Array(6)].map((_, i) => (
              <rect
                key={i}
                x={89 + i * 1.5}
                y={63 + i}
                width={161 - i * 2.5}
                height={126 - i * 2}
                rx='1.5'
                fill={`rgb(${242 - i * 2},${249 - i},${242 - i * 2})`}
              />
            ))}
            {/* Front cover overlay */}
            <rect x='68' y='60' width='184' height='132' rx='9' fill='url(#mainCover)' />
            <rect x='68' y='60' width='21' height='132' rx='5' fill='url(#mainSpine)' />

            {/* Cover content */}
            <rect x='103' y='78' width='118' height='4' rx='2' fill='rgba(255,255,255,0.3)' />
            <rect x='103' y='86' width='88' height='2.5' rx='1.25' fill='rgba(255,255,255,0.2)' />
            <rect
              x='103'
              y='102'
              width='108'
              height='38'
              rx='6'
              fill='rgba(255,255,255,0.07)'
              stroke='rgba(255,255,255,0.1)'
              strokeWidth='0.75'
            />
            <rect x='111' y='110' width='68' height='5' rx='2.5' fill='rgba(255,255,255,0.45)' />
            <rect x='111' y='120' width='82' height='3' rx='1.5' fill='rgba(255,255,255,0.25)' />
            <rect x='111' y='127' width='58' height='3' rx='1.5' fill='rgba(255,255,255,0.2)' />
            <rect x='111' y='134' width='74' height='3' rx='1.5' fill='rgba(255,255,255,0.15)' />

            {/* Bookmark */}
            <rect x='222' y='60' width='11' height='48' fill='#4ade80' />
            <polygon points='222,108 233,108 227.5,118' fill='#4ade80' />

            {/* Author bar */}
            <rect x='103' y='158' width='46' height='4' rx='2' fill='rgba(255,255,255,0.25)' />
            <rect x='103' y='167' width='32' height='2.5' rx='1.25' fill='rgba(255,255,255,0.15)' />

            {/* Leaf badge */}
            <circle
              cx='218'
              cy='163'
              r='14'
              fill='rgba(255,255,255,0.08)'
              stroke='rgba(255,255,255,0.15)'
              strokeWidth='0.75'
            />
            <path
              d='M218 156 C218 156 213 161 213 166 C213 170 215.5 172 218 172 C220.5 172 223 170 223 166 C223 161 218 156 218 156Z'
              fill='rgba(255,255,255,0.4)'
            />
            <line
              x1='218'
              y1='172'
              x2='218'
              y2='169'
              stroke='rgba(255,255,255,0.4)'
              strokeWidth='1.5'
              strokeLinecap='round'
            />

            {/* Turning page */}
            <g
              style={{
                transformOrigin: '89px 126px',
                animation: 'pageTurnTop 4.5s ease-in-out infinite'
              }}
            >
              <path
                d='M89 65 Q150 62 228 66 L228 186 Q150 188 89 185 Z'
                fill='#f0fdf4'
                opacity='0.95'
              />
              <rect x='104' y='85' width='80' height='3' rx='1.5' fill='#86efac' />
              <rect x='104' y='93' width='94' height='2' rx='1' fill='#d1fae5' />
              <rect x='104' y='99' width='70' height='2' rx='1' fill='#d1fae5' />
              <rect x='104' y='105' width='86' height='2' rx='1' fill='#d1fae5' />
              <rect x='104' y='111' width='60' height='2' rx='1' fill='#d1fae5' />
            </g>
          </g>

          {/* Floating sparkle */}
          <g style={{ animation: 'sparkle 3s ease-in-out infinite' }}>
            <circle cx='56' cy='110' r='4' fill='#4ade80' opacity='0.6' />
            <circle
              cx='56'
              cy='110'
              r='7'
              fill='none'
              stroke='#4ade80'
              strokeWidth='1'
              opacity='0.3'
            />
          </g>
          <g style={{ animation: 'sparkle 3s ease-in-out infinite', animationDelay: '1.5s' }}>
            <circle cx='268' cy='210' r='3' fill='#86efac' opacity='0.6' />
            <circle
              cx='268'
              cy='210'
              r='6'
              fill='none'
              stroke='#86efac'
              strokeWidth='1'
              opacity='0.3'
            />
          </g>

          <defs>
            <linearGradient
              id='mainCover'
              x1='68'
              y1='60'
              x2='252'
              y2='192'
              gradientUnits='userSpaceOnUse'
            >
              <stop offset='0%' stopColor='#16a34a' />
              <stop offset='55%' stopColor='#15803d' />
              <stop offset='100%' stopColor='#14532d' />
            </linearGradient>
            <linearGradient
              id='mainSpine'
              x1='68'
              y1='60'
              x2='89'
              y2='192'
              gradientUnits='userSpaceOnUse'
            >
              <stop offset='0%' stopColor='#166534' />
              <stop offset='100%' stopColor='#052e16' />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative mini elements */}
      <div
        className='absolute'
        style={{ top: '20%', right: '14%', animation: 'floatP1 5.5s ease-in-out infinite' }}
      >
        <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
          <path
            d='M5 7 L14 3 L23 7 L23 21 L14 25 L5 21 Z'
            stroke='#4ade80'
            strokeWidth='1.5'
            fill='none'
            opacity='0.65'
          />
          <line x1='14' y1='3' x2='14' y2='25' stroke='#4ade80' strokeWidth='1' opacity='0.4' />
        </svg>
      </div>
      <div
        className='absolute'
        style={{ bottom: '28%', left: '10%', animation: 'floatP2 7.5s ease-in-out infinite' }}
      >
        <svg width='22' height='22' viewBox='0 0 22 22' fill='none'>
          <circle
            cx='11'
            cy='11'
            r='9'
            stroke='#86efac'
            strokeWidth='1.5'
            fill='none'
            opacity='0.55'
          />
          <circle cx='11' cy='11' r='4' fill='#4ade80' opacity='0.3' />
        </svg>
      </div>

      <style>{`
        @keyframes stackFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes book1Float {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(-4px) rotate(0.5deg); }
        }
        @keyframes book2Float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes book3Float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1px); }
        }
        @keyframes pageTurnTop {
          0%, 38%, 100% { transform: rotateY(0deg); }
          55%, 82% { transform: rotateY(-38deg); opacity: 0.75; }
        }
        @keyframes shadowPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.1; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0.2; }
        }
        @keyframes blob1 {
          0%, 100% { transform: scale(1) translate(0,0); }
          33% { transform: scale(1.12) translate(15px,-12px); }
          66% { transform: scale(0.92) translate(-8px,18px); }
        }
        @keyframes floatP1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-14px) translateX(5px); }
        }
        @keyframes floatP2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(22deg); }
        }
        @keyframes floatP3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.25); }
        }
        @keyframes floatP4 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-12px) translateX(-7px); }
        }
      `}</style>
    </div>
  )
}

// ── Signup Form ───────────────────────────────────────────────────────────────

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type SignUpFormValue = z.infer<typeof signUpSchema>
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormValue>({
    resolver: zodResolver(signUpSchema)
  })

  const navigate = useNavigate()
  const signUpMutation = useSignUp()

  const onSubmit = async (data: SignUpFormValue) => {
    try {
      await signUpMutation.mutateAsync(data)
      toast.success(t('signup.success') || 'Đăng ký thành công!')
      navigate('/login')
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>
      const message =
        axiosError.response?.data?.message || t('signup.errors') || 'Đăng ký thất bại!'
      toast.error(message)
    }
  }

  return (
    <div className={cn('min-h-screen w-full flex', className)} {...props}>
      {/* ── Left panel: Illustration ── */}
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

        <BookStackIllustration />

        {/* Bottom quote */}
        <div className='absolute bottom-10 left-0 right-0 px-12 text-center'>
          <p className='text-green-200/70 text-sm italic leading-relaxed'>
            "Not all those who wander are lost."
          </p>
          <p className='text-green-300/50 text-xs mt-1'>— J.R.R. Tolkien</p>
        </div>
      </div>

      {/* ── Right panel: Form ── */}
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
              {t('signup.title')}
            </h1>
            <p className='text-muted-foreground text-sm'>{t('signup.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Username */}
            <div className='space-y-1.5'>
              <label htmlFor='username' className='text-sm font-medium text-foreground'>
                {t('signup.username')}
              </label>
              <div className='relative'>
                <User className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <input
                  id='username'
                  type='text'
                  placeholder='Zbook'
                  autoComplete='off'
                  {...register('username')}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm text-foreground transition-all outline-none',
                    'focus:ring-2 focus:ring-green-500/30 focus:border-green-500',
                    'placeholder:text-muted-foreground/50',
                    errors.username
                      ? 'border-destructive'
                      : 'border-border hover:border-green-400/60'
                  )}
                />
              </div>
              {errors.username && (
                <p className='text-destructive text-xs mt-1'>{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className='space-y-1.5'>
              <label htmlFor='email' className='text-sm font-medium text-foreground'>
                {t('signup.email')}
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
                {t('signup.password')}
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
              className='w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all mt-2'
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
                  {t('signup.button')}
                  <ArrowRight className='w-4 h-4' />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className='text-center text-sm text-muted-foreground mt-5'>
            {t('signup.hasAccount')}{' '}
            <a
              href='/login'
              className='font-semibold text-green-600 hover:text-green-500 transition-colors'
            >
              {t('signup.login')}
            </a>
          </p>

          {/* Terms */}
          <p className='text-xs text-muted-foreground text-center mt-5 px-2 leading-relaxed'>
            <Trans
              ns='auth'
              i18nKey='signup.term-privacy'
              components={{
                terms: (
                  <a
                    href='#'
                    className='underline underline-offset-4 hover:text-foreground text-muted-foreground transition-colors'
                  />
                ),
                privacy: (
                  <a
                    href='#'
                    className='underline underline-offset-4 hover:text-foreground text-muted-foreground transition-colors'
                  />
                )
              }}
            />
          </p>
        </div>
      </div>
    </div>
  )
}
