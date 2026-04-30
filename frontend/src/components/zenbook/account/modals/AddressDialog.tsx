import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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

import type { Address, AddressRequest } from '@/services/customer/customer.type'

// Cấu trúc chuẩn trả về từ Backend (bê nguyên từ GHN sang)
interface ProvinceData {
  ProvinceID: number
  ProvinceName: string
}

interface DistrictData {
  DistrictID: number
  DistrictName: string
}

interface WardData {
  WardCode: string
  WardName: string
}

const schema = z.object({
  recipientName: z.string().min(2, 'Vui lòng nhập tên người nhận'),
  phone: z.string().regex(/^(0|\+84)[0-9]{8,9}$/, 'Số điện thoại không hợp lệ'),
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
  onSave: (data: AddressRequest) => Promise<void>
}

// 📌 THAY ĐỔI URL BACKEND CỦA BẠN TẠI ĐÂY (NẾU CẦN)
const API_BASE_URL = 'http://localhost:8080/api/v1/address'

export default function AddressDialog({
  open,
  onOpenChange,
  initialData,
  onSave
}: AddressDialogProps) {
  const { t } = useTranslation('account')

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

  // 1. Lấy danh sách Tỉnh/Thành từ BACKEND
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
        .get(`${API_BASE_URL}/provinces`)
        .then((res) => setProvinces(res.data.data || []))
        .catch(() => toast.error('Không lấy được danh sách tỉnh'))
    }
  }, [open, initialData, reset])

  // 2. Lấy danh sách Quận/Huyện từ BACKEND khi chọn Tỉnh
  useEffect(() => {
    if (selectedCity && provinces.length > 0) {
      const province = provinces.find((p) => p.ProvinceName === selectedCity)
      if (province) {
        axios
          .get(`${API_BASE_URL}/districts?province_id=${province.ProvinceID}`)
          .then((res) => setDistricts(res.data.data || []))
          .catch(() => toast.error('Không lấy được danh sách quận / huyện'))
      }
    } else {
      setDistricts([])
    }
  }, [selectedCity, provinces])

  // 3. Lấy danh sách Phường/Xã từ BACKEND khi chọn Quận
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      const district = districts.find((d) => d.DistrictName === selectedDistrict)
      if (district) {
        axios
          .get(`${API_BASE_URL}/wards?district_id=${district.DistrictID}`)
          .then((res) => setWards(res.data.data || []))
          .catch(() => toast.error('Không lấy được danh sách phường / xã'))
      }
    } else {
      setWards([])
    }
  }, [selectedDistrict, districts])

  const onSubmit = async (data: FormValues) => {
    // Tìm ra ID để gửi về Backend lưu lại
    const districtObj = districts.find((d) => d.DistrictName === data.district)
    const wardObj = wards.find((w) => w.WardName === data.ward)

    const payload: AddressRequest = {
      ...data,
      districtId: districtObj?.DistrictID,
      wardCode: wardObj?.WardCode,
      isDefault: initialData ? initialData.isDefault : false
    }

    await onSave(payload)
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
                placeholder={t('address.recipientNamePlaceholder', 'Họ và tên')}
                {...register('recipientName')}
              />
              {errors.recipientName && (
                <p className='text-destructive text-xs'>{errors.recipientName.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label>{t('address.phone')}</Label>
              <Input
                placeholder={t('address.phonePlaceholder', 'Số điện thoại')}
                {...register('phone')}
              />
              {errors.phone && <p className='text-destructive text-xs'>{errors.phone.message}</p>}
            </div>
          </div>

          <div className='pt-2'>
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
                      <SelectContent className='max-h-56 z-[10000]'>
                        {provinces.map((p) => (
                          <SelectItem key={p.ProvinceID} value={p.ProvinceName}>
                            {p.ProvinceName}
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
                      <SelectContent className='max-h-56 z-[10000]'>
                        {districts.map((d) => (
                          <SelectItem key={d.DistrictID} value={d.DistrictName}>
                            {d.DistrictName}
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
                      <SelectContent className='max-h-56 z-[10000]'>
                        {wards.map((w) => (
                          <SelectItem key={w.WardCode} value={w.WardName}>
                            {w.WardName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.ward && <p className='text-destructive text-xs'>{errors.ward.message}</p>}
              </div>
            </div>
          </div>

          <div className='space-y-1.5 pt-2'>
            <Label>{t('address.street')}</Label>
            <Input placeholder='Nhập số nhà, tên đường...' {...register('street')} />
            {errors.street && <p className='text-destructive text-xs'>{errors.street.message}</p>}
          </div>

          <DialogFooter className='pt-4'>
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
