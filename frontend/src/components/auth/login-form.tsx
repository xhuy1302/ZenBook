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

// ── 3D Book Illustration ──────────────────────────────────────────────────────

function BookIllustration() {
  return (
    <div className='relative w-full h-full flex items-center justify-center overflow-hidden select-none'>
      {/* Ambient blobs */}
      <div
        className='absolute rounded-full pointer-events-none'
        style={{
          width: 420,
          height: 420,
          background:
            'radial-gradient(circle at 40% 40%, rgba(74,222,128,0.18) 0%, transparent 70%)',
          top: '-60px',
          left: '-80px',
          animation: 'blobDrift 12s ease-in-out infinite'
        }}
      />
      <div
        className='absolute rounded-full pointer-events-none'
        style={{
          width: 320,
          height: 320,
          background:
            'radial-gradient(circle at 60% 60%, rgba(134,239,172,0.12) 0%, transparent 70%)',
          bottom: '-40px',
          right: '-60px',
          animation: 'blobDrift 9s ease-in-out infinite reverse'
        }}
      />

      {/* Floating dots */}
      {[
        { x: '12%', y: '18%', size: 5, color: '#4ade80', delay: 0 },
        { x: '82%', y: '12%', size: 4, color: '#86efac', delay: 0.8 },
        { x: '88%', y: '55%', size: 6, color: '#22c55e', delay: 1.4 },
        { x: '8%', y: '72%', size: 4, color: '#bbf7d0', delay: 2 },
        { x: '50%', y: '88%', size: 5, color: '#4ade80', delay: 0.5 },
        { x: '70%', y: '80%', size: 3, color: '#86efac', delay: 1.8 },
        { x: '25%', y: '45%', size: 4, color: '#dcfce7', delay: 1.1 },
        { x: '60%', y: '20%', size: 5, color: '#22c55e', delay: 2.4 }
      ].map((dot, i) => (
        <div
          key={i}
          className='absolute rounded-full pointer-events-none'
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            background: dot.color,
            opacity: 0.55,
            animation: `floatDot 6s ease-in-out infinite`,
            animationDelay: `${dot.delay}s`
          }}
        />
      ))}

      {/* Floating mini shapes */}
      <div
        className='absolute pointer-events-none'
        style={{ left: '14%', top: '22%', animation: 'floatDot 7s ease-in-out infinite' }}
      >
        <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
          <rect
            x='4'
            y='4'
            width='20'
            height='20'
            rx='4'
            stroke='rgba(74,222,128,0.5)'
            strokeWidth='1.5'
            fill='none'
          />
          <rect x='9' y='9' width='10' height='10' rx='2' fill='rgba(74,222,128,0.2)' />
        </svg>
      </div>
      <div
        className='absolute pointer-events-none'
        style={{
          right: '12%',
          top: '30%',
          animation: 'floatDot 8s ease-in-out infinite reverse',
          animationDelay: '1.5s'
        }}
      >
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='9' stroke='rgba(134,239,172,0.45)' strokeWidth='1.5' />
          <circle cx='12' cy='12' r='4' fill='rgba(74,222,128,0.25)' />
        </svg>
      </div>
      <div
        className='absolute pointer-events-none'
        style={{
          left: '18%',
          bottom: '20%',
          animation: 'floatDot 6.5s ease-in-out infinite',
          animationDelay: '2.2s'
        }}
      >
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
          <path
            d='M10 2L12.8 7.6L19 8.6L14.5 13L15.6 19.2L10 16.3L4.4 19.2L5.5 13L1 8.6L7.2 7.6Z'
            fill='rgba(74,222,128,0.35)'
            stroke='rgba(74,222,128,0.6)'
            strokeWidth='1'
          />
        </svg>
      </div>

      {/* The 3D Book */}
      <div
        style={{
          animation: 'bookFloat 7s ease-in-out infinite',
          filter: 'drop-shadow(0 32px 48px rgba(0,0,0,0.45))'
        }}
      >
        <div style={{ perspective: '900px', perspectiveOrigin: '50% 45%' }}>
          <div
            style={{
              position: 'relative',
              width: '240px',
              height: '310px',
              transformStyle: 'preserve-3d',
              transform: 'rotateY(-28deg) rotateX(6deg)'
            }}
          >
            {/* ── SPINE (left face) ── */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '46px',
                height: '310px',
                background: 'linear-gradient(180deg, #052e16 0%, #14532d 50%, #052e16 100%)',
                transformOrigin: 'left center',
                transform: 'rotateY(90deg) translateZ(-46px)',
                borderRadius: '4px 0 0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Spine vertical text lines */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  alignItems: 'center',
                  width: '100%',
                  padding: '20px 8px'
                }}
              >
                {[30, 22, 26, 18, 20, 14, 24, 16].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${w}px`,
                      height: '2px',
                      borderRadius: '1px',
                      background:
                        i === 0
                          ? 'rgba(255,255,255,0.5)'
                          : i === 2
                            ? 'rgba(255,255,255,0.35)'
                            : 'rgba(255,255,255,0.15)'
                    }}
                  />
                ))}
                {/* Spine leaf */}
                <div style={{ marginTop: '12px' }}>
                  <svg width='18' height='22' viewBox='0 0 18 22' fill='none'>
                    <path
                      d='M9 2C9 2 3 8 3 13C3 16.87 5.69 20 9 20C12.31 20 15 16.87 15 13C15 8 9 2 9 2Z'
                      fill='rgba(74,222,128,0.6)'
                    />
                    <line
                      x1='9'
                      y1='20'
                      x2='9'
                      y2='15'
                      stroke='rgba(74,222,128,0.5)'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ── FRONT COVER ── */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '240px',
                height: '310px',
                background: 'linear-gradient(145deg, #16a34a 0%, #15803d 45%, #14532d 100%)',
                borderRadius: '4px 8px 8px 4px',
                overflow: 'hidden',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Cover texture overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 19px)',
                  pointerEvents: 'none'
                }}
              />

              {/* Cover border frame */}
              <div
                style={{
                  position: 'absolute',
                  inset: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '16px',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '3px',
                  pointerEvents: 'none'
                }}
              />

              {/* Bookmark ribbon */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: '36px',
                  width: '16px',
                  height: '64px',
                  background: 'linear-gradient(180deg, #4ade80, #22c55e)',
                  borderRadius: '0 0 3px 3px'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '64px',
                  right: '36px',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '10px solid #22c55e'
                }}
              />

              {/* Title block */}
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  left: '28px',
                  right: '28px'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: '2px',
                    marginBottom: '10px'
                  }}
                />
                <div
                  style={{
                    width: '70%',
                    height: '2px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '1px'
                  }}
                />
              </div>

              {/* Center art: open book lines */}
              <div
                style={{
                  position: 'absolute',
                  top: '88px',
                  left: '28px',
                  right: '28px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '18px 16px',
                  backdropFilter: 'blur(2px)'
                }}
              >
                {[80, 100, 72, 90, 60, 84, 68, 76, 55, 88].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${w}%`,
                      height: '2px',
                      borderRadius: '1px',
                      background:
                        i === 0
                          ? 'rgba(255,255,255,0.45)'
                          : i % 3 === 0
                            ? 'rgba(255,255,255,0.22)'
                            : 'rgba(255,255,255,0.14)',
                      marginBottom: i < 9 ? '7px' : 0
                    }}
                  />
                ))}
              </div>

              {/* Bottom author + badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '26px',
                  left: '28px',
                  right: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '56px',
                      height: '3px',
                      background: 'rgba(255,255,255,0.35)',
                      borderRadius: '2px',
                      marginBottom: '5px'
                    }}
                  />
                  <div
                    style={{
                      width: '38px',
                      height: '2px',
                      background: 'rgba(255,255,255,0.18)',
                      borderRadius: '1px'
                    }}
                  />
                </div>
                {/* Leaf icon badge */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width='18' height='20' viewBox='0 0 18 20' fill='none'>
                    <path
                      d='M9 1C9 1 2 7.5 2 12.5C2 16.64 5.13 20 9 20C12.87 20 16 16.64 16 12.5C16 7.5 9 1 9 1Z'
                      fill='rgba(255,255,255,0.5)'
                    />
                    <line
                      x1='9'
                      y1='20'
                      x2='9'
                      y2='14'
                      stroke='rgba(255,255,255,0.45)'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                    />
                    <line
                      x1='9'
                      y1='16'
                      x2='12'
                      y2='13'
                      stroke='rgba(255,255,255,0.3)'
                      strokeWidth='1'
                      strokeLinecap='round'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ── PAGE BLOCK (right side, visible as page edges) ── */}
            <div
              style={{
                position: 'absolute',
                left: '240px',
                top: '4px',
                width: '16px',
                height: '302px',
                background:
                  'linear-gradient(90deg, #e8f5e9 0%, #f1f8f1 40%, #e0f0e0 60%, #dceadc 100%)',
                transformOrigin: 'left center',
                transform: 'rotateY(-90deg)',
                borderRadius: '0 2px 2px 0',
                overflow: 'hidden'
              }}
            >
              {/* Page line texture */}
              {Array.from({ length: 38 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${8 + i * 7.5}px`,
                    height: '0.5px',
                    background: 'rgba(0,0,0,0.07)'
                  }}
                />
              ))}
            </div>

            {/* ── TOP FACE ── */}
            <div
              style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
                width: '240px',
                height: '16px',
                background:
                  'linear-gradient(90deg, #1a6b38 0%, #d4edda 15%, #c8e6c9 85%, #1a5c30 100%)',
                transformOrigin: 'top center',
                transform: 'rotateX(90deg)',
                borderRadius: '4px 8px 0 0'
              }}
            />

            {/* ── BOTTOM FACE ── */}
            <div
              style={{
                position: 'absolute',
                left: '0px',
                bottom: '0px',
                width: '240px',
                height: '16px',
                background:
                  'linear-gradient(90deg, #155224 0%, #b8dfc0 15%, #aed6b0 85%, #134a22 100%)',
                transformOrigin: 'bottom center',
                transform: 'rotateX(-90deg)',
                borderRadius: '0 0 8px 4px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0px); }
          30% { transform: translateY(-14px); }
          70% { transform: translateY(-8px); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-10px) translateX(4px); }
          66% { transform: translateY(-6px) translateX(-4px); }
        }
        @keyframes blobDrift {
          0%, 100% { transform: scale(1) translate(0, 0); }
          40% { transform: scale(1.12) translate(16px, -12px); }
          70% { transform: scale(0.92) translate(-8px, 14px); }
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
      } else if (roles.includes('STAFF') || roles.includes('ROLE_STAFF')) {
        navigate('/dashboard/support-chat')
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
    /* ✅ h-screen + overflow-hidden → không bao giờ xuất hiện thanh cuộn */
    <div className={cn('w-full flex overflow-hidden', className)} {...props}>
      {/* ── Left panel: Form ── */}
      <div className='flex-1 flex flex-col justify-center items-center px-12 py-8 bg-background relative overflow-hidden'>
        {/* Dot grid bg */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34,197,94,0.07) 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
        {/* Subtle green glow top-left */}
        <div
          className='absolute pointer-events-none'
          style={{
            top: '-120px',
            left: '-120px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 65%)'
          }}
        />

        <div className='w-full max-w-md relative z-10'>
          {/* Language selector */}
          <div className='flex justify-end mb-6'>
            <LanguageSelector />
          </div>

          {/* Logo */}
          <a href='/' className='flex items-center gap-2.5 mb-10 w-fit group'>
            <img
              src='https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/Logo/Zen+Book.png'
              alt='Logo'
              className='h-10 w-auto object-contain transition-transform group-hover:scale-105'
            />
          </a>

          {/* Heading */}
          <div className='mb-9'>
            <h1 className='text-4xl font-bold text-foreground tracking-tight mb-2.5 leading-tight'>
              {t('login.title')}
            </h1>
            <p className='text-muted-foreground text-sm leading-relaxed'>{t('login.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            {/* Email */}
            <div className='space-y-1.5'>
              <label htmlFor='email' className='text-sm font-medium text-foreground'>
                {t('login.email')}
              </label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <input
                  id='email'
                  type='text'
                  placeholder='zenbook@gmail.com'
                  autoComplete='off'
                  {...register('email')}
                  className={cn(
                    'w-full pl-11 pr-4 py-3.5 rounded-xl border bg-background text-sm text-foreground transition-all outline-none',
                    'focus:ring-2 focus:ring-green-500/25 focus:border-green-500',
                    'placeholder:text-muted-foreground/40',
                    errors.email ? 'border-destructive' : 'border-border hover:border-green-400/50'
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
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  {...register('password')}
                  className={cn(
                    'w-full pl-11 pr-12 py-3.5 rounded-xl border bg-background text-sm text-foreground transition-all outline-none',
                    'focus:ring-2 focus:ring-green-500/25 focus:border-green-500',
                    'placeholder:text-muted-foreground/40',
                    errors.password
                      ? 'border-destructive'
                      : 'border-border hover:border-green-400/50'
                  )}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              {errors.password && (
                <p className='text-destructive text-xs mt-1'>{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className='pt-1'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98]'
                style={{
                  background: isSubmitting
                    ? '#15803d'
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 4px 20px rgba(34,197,94,0.32), 0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow =
                      '0 6px 28px rgba(34,197,94,0.42), 0 2px 6px rgba(0,0,0,0.12)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow =
                    '0 4px 20px rgba(34,197,94,0.32), 0 1px 3px rgba(0,0,0,0.1)'
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
            </div>
          </form>

          {/* Sign up link */}
          <p className='text-center text-sm text-muted-foreground mt-7'>
            {t('login.noAccount')}{' '}
            <a
              href='/signup'
              className='font-semibold text-green-600 hover:text-green-500 transition-colors underline underline-offset-2 decoration-green-500/30 hover:decoration-green-500'
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
          background:
            'linear-gradient(145deg, #042214 0%, #0a3d1f 25%, #14532d 55%, #166534 80%, #1a7a3e 100%)'
        }}
      >
        {/* Subtle grid */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />
        {/* Radial vignette */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(2,14,8,0.55) 100%)'
          }}
        />

        <BookIllustration />

        {/* Bottom quote */}
        <div className='absolute bottom-10 left-0 right-0 px-14 text-center'>
          <div
            style={{
              width: '32px',
              height: '2px',
              background: 'rgba(134,239,172,0.4)',
              borderRadius: '1px',
              margin: '0 auto 12px'
            }}
          />
          <p className='text-green-200/60 text-sm italic leading-relaxed font-light tracking-wide'>
            "A reader lives a thousand lives before he dies."
          </p>
          <p
            className='text-green-300/40 text-xs mt-2 tracking-wider uppercase'
            style={{ fontSize: '10px', letterSpacing: '0.12em' }}
          >
            George R.R. Martin
          </p>
        </div>
      </div>
    </div>
  )
}
