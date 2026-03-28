import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { signUpSchema } from '@/components/auth/schemas/schemas'
import LanguageSelector from '@/components/common/LanguageSelector'
// import { useAuthStore } from '@/store/auth.store'
import { Trans, useTranslation } from 'react-i18next'
import type z from 'zod'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  type SignUpFormValue = z.infer<typeof signUpSchema>
  // const navigate = useNavigate()
  // const { register: registerUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormValue>({
    resolver: zodResolver(signUpSchema)
  })

  const onSubmit = async (data: SignUpFormValue) => {
    // try {
    //   await registerUser({
    //     username: data.username,
    //     email: data.email,
    //     password: data.password
    //   })
    //   toast.success(t('signup.success'))
    //   navigate('/login')
    // } catch (error: unknown) {
    //   if (error instanceof Error) {
    //     toast.error(error.message)
    //   } else {
    //     toast.error(t('signup.errors'))
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
                  <img src='black_on_trans2.png' alt='Logo' />
                </a>
                <h1 className='text-2xl font-bold'>{t('signup.title')}</h1>
                <p className='text-muted-foreground text-balance'>{t('signup.subtitle')}</p>
              </div>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='username' className='block text-sm'>
                  {t('signup.username')}
                </Label>
                <Input type='text' id='username' placeholder='Zbook' {...register('username')} />
                {errors.username && (
                  <p className='text-destructive text-sm'>{errors.username.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-3'>
                <Label htmlFor='email' className='block text-sm'>
                  {t('signup.email')}
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
                  {t('signup.password')}
                </Label>
                <Input type='password' id='password' {...register('password')} />
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
              src='/placeholderSignUp.png'
              alt='Image'
              className='absolute top-1/2 -translate-y-1/2 object-cover'
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
