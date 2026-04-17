import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type SignUpFormValue = z.infer<typeof signUpSchema>

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
                <h1 className='text-2xl font-bold'>{t('signup.title')}</h1>
                <p className='text-muted-foreground text-balance'>{t('signup.subtitle')}</p>
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='username'>{t('signup.username')}</Label>
                <Input
                  type='text'
                  id='username'
                  placeholder='Zbook'
                  autoComplete='off'
                  {...register('username')}
                />
                {errors.username && (
                  <p className='text-destructive text-sm'>{errors.username.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='email'>{t('signup.email')}</Label>
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
                <Label htmlFor='password'>{t('signup.password')}</Label>
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
                {t('signup.button')}
              </Button>
              <div className='text-center text-sm'>
                {t('signup.hasAccount')}{' '}
                <a href='/login' className='underline underline-offset-4'>
                  {t('signup.login')}
                </a>
              </div>
            </div>
          </form>
          <div className='bg-muted relative hidden md:block'>
            <img
              src='https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/auth/2.png'
              alt='Image'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </CardContent>
      </Card>
      <div className='text-sm text-balance px-6 text-center text-muted-foreground'>
        <Trans
          ns='auth'
          i18nKey='signup.term-privacy'
          components={{
            terms: <a href='#' className='underline underline-offset-4 hover:text-primary' />,
            privacy: <a href='#' className='underline underline-offset-4 hover:text-primary' />
          }}
        />
      </div>
    </div>
  )
}
