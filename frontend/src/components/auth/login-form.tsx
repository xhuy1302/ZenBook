import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type LogInFormValue = z.infer<typeof logInSchema>

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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <LanguageSelector />
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center gap-2'>
                <a href='/' className='mx-auto block w-fit text-center'>
                  <img
                    src='https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/Logo/Zen+Book.png'
                    alt='Logo'
                    className='w-32 h-auto object-contain' // Thêm dòng này để ép size
                  />
                </a>
                <h1 className='text-2xl font-bold'>{t('login.title')}</h1>
                <p className='text-muted-foreground text-balance'>{t('login.subtitle')}</p>
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='email'>{t('login.email')}</Label>
                <Input
                  type='text'
                  id='email'
                  placeholder='zenbook@gmail.com'
                  autoComplete='off'
                  {...register('email')}
                />
                {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='password'>{t('login.password')}</Label>
                <Input
                  type='password'
                  id='password'
                  autoComplete='new-password'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-destructive text-sm'>{errors.password.message}</p>
                )}
              </div>

              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {t('login.loginButton')}
              </Button>
              <div className='text-center text-sm'>
                {t('login.noAccount')}{' '}
                <a href='/signup' className='underline underline-offset-4'>
                  {t('login.signUp')}
                </a>
              </div>
            </div>
          </form>
          <div className='bg-muted relative hidden md:block'>
            <img
              src='https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/auth/1.png'
              alt='Image'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
