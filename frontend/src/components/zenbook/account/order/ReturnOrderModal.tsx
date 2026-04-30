'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, AlertCircle } from 'lucide-react'

// 👉 1. Định nghĩa Data rõ ràng, không dùng any nữa
export interface ReturnOrderData {
  reason: string
  description: string
  images: string[]
}

interface ReturnOrderModalProps {
  open: boolean
  onClose: () => void
  orderCode: string // 👉 2. Đổi từ orderId sang orderCode cho chuẩn xác
  onSubmit: (data: ReturnOrderData) => void // 👉 Đã diệt 'any'
}

const RETURN_REASONS = [
  'Thiếu sản phẩm / Phụ kiện',
  'Sai sản phẩm (Sai màu, size...)',
  'Sản phẩm bị lỗi / Không hoạt động',
  'Sản phẩm bị hư hỏng / Bể vỡ do vận chuyển',
  'Hàng giả / Hàng nhái',
  'Khác'
]

export function ReturnOrderModal({ open, onClose, orderCode, onSubmit }: ReturnOrderModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, 3))
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      onSubmit({ reason, description, images })
      setIsSubmitting(false)
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden'>
        <DialogHeader className='p-6 pb-4 border-b border-slate-100 bg-white'>
          <DialogTitle className='text-xl font-bold text-slate-800'>
            Yêu cầu Trả hàng / Hoàn tiền
          </DialogTitle>
          {/* Hiện mã đơn hàng lên cho khách yên tâm */}
          <p className='text-sm text-slate-500 mt-1'>
            Đơn hàng: <span className='font-mono font-bold'>{orderCode}</span>
          </p>
        </DialogHeader>

        <div className='p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto bg-slate-50/30'>
          {/* Lý do trả hàng */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-bold text-slate-700'>
              1. Lý do trả hàng <span className='text-rose-500'>*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none text-sm font-medium text-slate-600'
            >
              <option value='' disabled>
                Chọn lý do...
              </option>
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Thêm hình ảnh bằng chứng */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-bold text-slate-700'>
              2. Hình ảnh bằng chứng <span className='text-rose-500'>*</span>
            </label>
            <p className='text-[12px] text-slate-500 mb-1'>
              Tải lên tối đa 3 hình ảnh chụp rõ tình trạng sản phẩm.
            </p>

            <div className='flex items-center gap-3 flex-wrap'>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className='relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group'
                >
                  <img src={img} alt='preview' className='w-full h-full object-cover' />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className='absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </div>
              ))}

              {images.length < 3 && (
                <label className='w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-green hover:bg-brand-green/5 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-brand-green'>
                  <ImagePlus className='w-6 h-6 mb-1' />
                  <span className='text-[10px] font-semibold'>Thêm ảnh</span>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    className='hidden'
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-bold text-slate-700'>3. Mô tả chi tiết</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Vui lòng mô tả chi tiết vấn đề bạn gặp phải để ZenBook hỗ trợ nhanh nhất...'
              className='w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none text-sm placeholder:text-slate-400 resize-none'
            />
          </div>

          <div className='bg-blue-50 text-blue-700 p-3.5 rounded-xl text-[13px] flex gap-2 border border-blue-100'>
            <AlertCircle className='w-5 h-5 shrink-0' />
            <p>
              Yêu cầu của bạn sẽ được đội ngũ CSKH xử lý trong vòng <strong>24-48 giờ</strong> làm
              việc. Tiền hoàn sẽ được chuyển về tài khoản thanh toán ban đầu.
            </p>
          </div>
        </div>

        <DialogFooter className='p-4 border-t border-slate-100 bg-white flex sm:justify-end gap-3'>
          <Button variant='outline' onClick={onClose} className='rounded-xl px-6 h-11'>
            Trở lại
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || images.length === 0 || isSubmitting}
            className='rounded-xl px-8 h-11 bg-brand-green hover:bg-brand-green-dark text-white font-bold'
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
