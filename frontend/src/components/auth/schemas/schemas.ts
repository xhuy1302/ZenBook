import { z } from 'zod'
import {
  NAME_MIN_LENGTH,
  USERNAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_LOWERCASE_REGEX,
  PASSWORD_UPPERCASE_REGEX,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_REGEX
} from '@/defines/auth-constants'
import i18n from '@/i18n/i18n'

export const logInSchema = z.object({
  email: z
    .string()
    .min(1, i18n.t('auth:errors.email.required'))
    .email(i18n.t('auth:errors.email.invalid')),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, i18n.t('auth:errors.password.min'))
    .refine((val) => PASSWORD_UPPERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.uppercase')
    })
    .refine((val) => PASSWORD_LOWERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.lowercase')
    })
    .refine((val) => PASSWORD_NUMBER_REGEX.test(val), {
      message: i18n.t('auth:errors.password.number')
    })
    .refine((val) => PASSWORD_SPECIAL_REGEX.test(val), {
      message: i18n.t('auth:errors.password.special')
    })
})

export const signUpSchema = z.object({
  username: z.string().min(USERNAME_MIN_LENGTH, i18n.t('auth:errors.username.min')),
  email: z
    .string()
    .min(NAME_MIN_LENGTH, i18n.t('auth:errors.email.required'))
    .email(i18n.t('auth:errors.email.invalid')),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, i18n.t('auth:errors.password.min'))
    .refine((val) => PASSWORD_UPPERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.uppercase')
    })
    .refine((val) => PASSWORD_LOWERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.lowercase')
    })
    .refine((val) => PASSWORD_NUMBER_REGEX.test(val), {
      message: i18n.t('auth:errors.password.number')
    })
    .refine((val) => PASSWORD_SPECIAL_REGEX.test(val), {
      message: i18n.t('auth:errors.password.special')
    })
})

// 👉 THÊM SCHEMA CHO FORM OTP VÀO ĐÂY
export const verifyOtpSchema = z.object({
  email: z.string().email(i18n.t('auth:errors.email.invalid')),
  otp: z
    .string()
    .length(6, i18n.t('auth:errors.otp.length') || 'Mã OTP phải bao gồm đúng 6 ký tự')
    .regex(/^\d+$/, i18n.t('auth:errors.otp.numeric') || 'Mã OTP chỉ được chứa chữ số')
})
