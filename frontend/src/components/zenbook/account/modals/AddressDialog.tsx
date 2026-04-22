// Đường dẫn: src/components/zenbook/account/modals/AddressDialog.tsx

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import type { Address, AddressPayload } from '@/services/customer/customer.type'

// ── Định nghĩa Kiểu dữ liệu cho API Hành chính ────────────────────────────────
interface ProvinceData {
  code: number
  name: string
  districts?: DistrictData[]
}

interface DistrictData {
  code: number
  name: string
  wards?: WardData[]
}

interface WardData {
  code: number
  name: string
}

// ── Schema Validation ─────────────────────────────────────────────────────────
const schema = z.object({
  recipientName: z.string().min(2, 'Vui lòng nhập tên người nhận'),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  street: z.string().min(5, 'Vui lòng nhập số nhà, tên đường chi tiết'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  city: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố')
})

type FormValues = z.infer<typeof schema>

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Address
  onSave: (data: AddressPayload) => Promise<void>
}

export default function AddressDialog({
  open,
  onOpenChange,
  initialData,
  onSave
}: AddressDialogProps) {
  const { t } = useTranslation('account')

  // 👉 ĐÃ FIX: Thay 'any[]' bằng các interface cụ thể
  const [provinces, setProvinces] = useState<ProvinceData[]>([])
  const [districts, setDistricts] = useState<DistrictData[]>([])
  const [wards, setWards] = useState<WardData[]>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      recipientName: '',
      phone: '',
      street: '',
      ward: '',
      district: '',
      city: ''
    }
  })

  const selectedCity = watch('city')
  const selectedDistrict = watch('district')

  // Lấy Tỉnh/Thành phố khi mở Modal
  useEffect(() => {
    if (open) {
      reset(
        initialData || {
          recipientName: '',
          phone: '',
          street: '',
          ward: '',
          district: '',
          city: ''
        }
      )
      axios
        .get<ProvinceData[]>('https://provinces.open-api.vn/api/p/')
        .then((res) => setProvinces(res.data))
    }
  }, [open, initialData, reset])

  // Lấy Quận/Huyện khi Tỉnh/Thành phố thay đổi
  useEffect(() => {
    if (selectedCity && provinces.length > 0) {
      const province = provinces.find((p) => p.name === selectedCity)
      if (province) {
        axios
          .get<ProvinceData>(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
          .then((res) => setDistricts(res.data.districts || []))
      }
    } else {
      setDistricts([])
    }
  }, [selectedCity, provinces])

  // Lấy Phường/Xã khi Quận/Huyện thay đổi
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      const district = districts.find((d) => d.name === selectedDistrict)
      if (district) {
        axios
          .get<DistrictData>(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
          .then((res) => setWards(res.data.wards || []))
      }
    } else {
      setWards([])
    }
  }, [selectedDistrict, districts])

  const onSubmit = async (data: FormValues) => {
    await onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>{initialData ? t('address.editTitle') : t('address.addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-1'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label>{t('address.recipientName')}</Label>
              <Input
                placeholder={t('address.recipientNamePlaceholder')}
                {...register('recipientName')}
              />
              {errors.recipientName && (
                <p className='text-destructive text-xs'>{errors.recipientName.message}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label>{t('address.phone')}</Label>
              <Input placeholder={t('address.phonePlaceholder')} {...register('phone')} />
              {errors.phone && <p className='text-destructive text-xs'>{errors.phone.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-3 gap-3'>
            <div className='space-y-1.5'>
              <Label>{t('address.city')}</Label>
              <Controller
                name='city'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue('district', '')
                      setValue('ward', '')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn Tỉnh' />
                    </SelectTrigger>
                    <SelectContent className='max-h-56'>
                      {provinces.map((p) => (
                        <SelectItem key={p.code} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.city && <p className='text-destructive text-xs'>{errors.city.message}</p>}
            </div>

            <div className='space-y-1.5'>
              <Label>{t('address.district')}</Label>
              <Controller
                name='district'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue('ward', '')
                    }}
                    disabled={!selectedCity || districts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn Quận' />
                    </SelectTrigger>
                    <SelectContent className='max-h-56'>
                      {districts.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.district && (
                <p className='text-destructive text-xs'>{errors.district.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label>{t('address.ward')}</Label>
              <Controller
                name='ward'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedDistrict || wards.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn Phường' />
                    </SelectTrigger>
                    <SelectContent className='max-h-56'>
                      {wards.map((w) => (
                        <SelectItem key={w.code} value={w.name}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ward && <p className='text-destructive text-xs'>{errors.ward.message}</p>}
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label>{t('address.street')}</Label>
            <Input placeholder='Nhập số nhà, tên đường...' {...register('street')} />
            {errors.street && <p className='text-destructive text-xs'>{errors.street.message}</p>}
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground'
            >
              {isSubmitting
                ? t('common.saving')
                : initialData
                  ? t('common.update')
                  : t('common.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
