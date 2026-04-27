'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface CancelOrderModalProps {
  open: boolean
  onClose: () => void
  orderId: string
  onConfirm: (reason: string) => void
}

const CANCEL_REASONS = [
  'Muốn thay đổi địa chỉ giao hàng',
  'Muốn nhập thêm mã Voucher/Freeship',
  'Muốn thay đổi sản phẩm (Số lượng, phân loại...)',
  'Tìm thấy giá rẻ hơn ở chỗ khác',
  'Đổi ý, không muốn mua nữa',
  'Lý do khác'
]

export function CancelOrderModal({ open, onClose, orderId, onConfirm }: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedReason) return
    setIsSubmitting(true)
    // Giả lập call API
    setTimeout(() => {
      onConfirm(selectedReason)
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden'>
        <DialogHeader className='p-6 pb-4 border-b border-slate-100 bg-slate-50/50'>
          <DialogTitle className='text-lg font-bold text-slate-800'>Lý do hủy đơn hàng</DialogTitle>
          <DialogDescription className='text-[13px] text-amber-600 flex items-start gap-1.5 mt-2 bg-amber-50 p-3 rounded-lg border border-amber-100'>
            <AlertTriangle className='w-4 h-4 shrink-0 mt-0.5' />
            Lưu ý: Việc hủy đơn hàng là không thể hoàn tác. Nếu bạn hủy, các mã giảm giá áp dụng cho
            đơn này có thể sẽ không được hoàn lại.
          </DialogDescription>
        </DialogHeader>

        <div className='p-6 flex flex-col gap-3 max-h-[60vh] overflow-y-auto'>
          <p className='text-sm font-semibold text-slate-700 mb-2'>Vui lòng chọn lý do hủy:</p>
          {CANCEL_REASONS.map((reason, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedReason === reason
                  ? 'border-brand-green bg-brand-green/5'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className='relative flex items-center justify-center shrink-0 w-5 h-5'>
                <input
                  type='radio'
                  name='cancelReason'
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className='peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-brand-green transition-colors cursor-pointer'
                />
                <CheckCircle2 className='absolute w-3.5 h-3.5 text-brand-green opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity' />
              </div>
              <span
                className={`text-[14px] ${selectedReason === reason ? 'font-semibold text-brand-green' : 'text-slate-600'}`}
              >
                {reason}
              </span>
            </label>
          ))}
        </div>

        <DialogFooter className='p-4 border-t border-slate-100 bg-slate-50/50 flex sm:justify-end gap-2'>
          <Button variant='outline' onClick={onClose} className='rounded-xl h-10'>
            Không, Trở lại
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className='rounded-xl h-10 bg-brand-green hover:bg-brand-green-dark text-white font-semibold'
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Hủy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
