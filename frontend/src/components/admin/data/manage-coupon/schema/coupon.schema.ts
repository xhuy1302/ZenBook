import { z } from 'zod'
import { DiscountType, CouponStatus, CouponType } from '@/defines/coupon.enum'

// Cập nhật type để hỗ trợ fallback message cho hàm t()
type TValidator = (key: string, fallback?: string) => string

export const getCouponSchema = (t: TValidator) =>
  z
    .object({
      // Bắt buộc nhập, viết hoa, loại bỏ khoảng trắng
      code: z
        .string()
        .trim()
        .min(3, t('validation.codeMin', 'Mã Code phải từ 3 ký tự'))
        .toUpperCase(),

      discountType: z.nativeEnum(DiscountType),

      couponType: z.nativeEnum(CouponType),

      discountValue: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('validation.required', 'Vui lòng nhập giá trị') })
          .min(1, t('validation.min1', 'Giá trị phải lớn hơn 0'))
      ),

      // Optional, nếu để trống thì thành null
      maxDiscountAmount: z.preprocess(
        (val) => (val === '' || val === null || val === 0 ? null : Number(val)),
        z.number().min(1, t('validation.min1', 'Phải lớn hơn 0')).nullable().optional()
      ),

      minOrderValue: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('validation.required', 'Vui lòng nhập đơn tối thiểu') })
          // SỬA Ở ĐÂY: Thay vì .min(0), hãy đổi thành .min(1) nếu bạn không muốn đơn hàng 0 đồng được áp dụng
          .min(1, t('validation.min1', 'Đơn hàng tối thiểu phải lớn hơn 0'))
      ),

      // Optional, nếu không nhập là vô hạn
      usageLimit: z.preprocess(
        (val) => (val === '' || val === null || val === 0 ? null : Number(val)),
        z.number().min(1, t('validation.min1', 'Phải lớn hơn 0')).nullable().optional()
      ),

      maxUsagePerUser: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('validation.required', 'Bắt buộc nhập') })
          .min(1, t('validation.min1', 'Mỗi người dùng ít nhất 1 lần'))
      ),

      status: z.nativeEnum(CouponStatus),
      categoryId: z.string().nullable().optional(),
      userId: z.string().nullable().optional(), // Có thể phát triển cấp riêng cho User sau

      startDate: z.string().min(1, t('validation.required', 'Bắt buộc chọn ngày bắt đầu')),
      endDate: z.string().min(1, t('validation.required', 'Bắt buộc chọn ngày kết thúc'))
    })
    // ======================================================
    // 👉 VALIDATE CHÉO: NẾU LÀ % THÌ KHÔNG ĐƯỢC QUÁ 100
    // ======================================================
    .refine(
      (data) => {
        if (data.discountType === 'PERCENTAGE' && data.discountValue) {
          return data.discountValue <= 100
        }
        return true
      },
      {
        message: t('validation.percentMax', 'Mức giảm % không được vượt quá 100!'),
        path: ['discountValue']
      }
    )
    // ======================================================
    // 👉 VALIDATE CHÉO: NGÀY KẾT THÚC > NGÀY BẮT ĐẦU
    // ======================================================
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return new Date(data.endDate) > new Date(data.startDate)
        }
        return true
      },
      {
        message: t('validation.dateInvalid', 'Ngày kết thúc phải sau ngày bắt đầu!'),
        path: ['endDate']
      }
    )

export type CouponFormValues = z.infer<ReturnType<typeof getCouponSchema>>
