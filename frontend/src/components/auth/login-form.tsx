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
// import { useAuthStore } from '@/store/auth.store'
import type z from 'zod'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type LogInFormValue = z.infer<typeof logInSchema>
  // const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LogInFormValue>({
    resolver: zodResolver(logInSchema)
  })

  // const { login, roles } = useAuthStore()

  const onSubmit = async (data: LogInFormValue) => {
    // try {
    //   await login(data)
    //   if (roles.includes('ADMIN')) {
    //     navigate('/dashboard')
    //   } else {
    //     navigate('/profile')
    //   }
    // } catch (error: unknown) {
    //   if (error instanceof Error) {
    //     toast.error(error.message)
    //   } else {
    //     toast.error('Login failed')
    //   }
    // }
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
                  <img src='/black_on_trans2.png' alt='Logo' />
                </a>
                <h1 className='text-2xl font-bold'>{t('login.title')}</h1>
                <p className='text-muted-foreground text-balance'>{t('login.subtitle')}</p>
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='email' className='block text-sm'>
                  {t('login.email')}
                </Label>
                <Input
                  type='text'
                  id='email'
                  placeholder='zenbook@gmail.com'
                  {...register('email')}
                />
                {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='password' className='block text-sm'>
                  {t('login.password')}
                </Label>
                <Input type='password' id='password' {...register('password')} />
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
              src='background_login.png'
              alt='Image'
              className='absolute top-1/2 -translate-y-1/2 object-cover'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
