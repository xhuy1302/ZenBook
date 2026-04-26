import { useState } from 'react'
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { StarRating } from './StarRating'
import ReviewImageUploader from './ReviewImageUploader'

import { useCreateReview, useUpdateReview } from '@/services/review/Usereview'
import type { ReviewResponse } from '@/services/review/review.type'

interface ReviewFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  productId: string
  orderId?: string
  orderDetailId: string
  existing?: ReviewResponse
  book?: {
    id: string
    title: string
    image?: string
  }
}

export function ReviewFormModal({
  open,
  onClose,
  onSuccess,
  productId,
  orderDetailId,
  existing,
  book
}: ReviewFormModalProps) {
  const isEdit = !!existing

  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [content, setContent] = useState(existing?.content ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(
    existing?.images?.map((i) => i.imageUrl) ?? []
  )
  const [submitted, setSubmitted] = useState(false)

  const { mutateAsync: create, isPending: creating } = useCreateReview(productId)
  const { mutateAsync: update, isPending: updating } = useUpdateReview(productId)

  const isPending = creating || updating

  const canSubmit = rating > 0 && content.trim().length >= 10 && !isPending

  const handleSubmit = async () => {
    if (!canSubmit) return

    try {
      if (isEdit && existing) {
        await update({
          reviewId: existing.id,
          payload: {
            rating,
            content
          }
        })
      } else {
        await create({
          rating,
          content,
          imageUrls,
          orderDetailId
        })
      }

      setSubmitted(true)

      // 👉 THÊM VÀO ĐÂY: Báo cho Component cha (OrderDetail) biết để gọi lại API ngầm
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(onClose, 1800)
    } catch {
      //
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/* 👉 ĐÃ THÊM CLASS [&>button]:hidden VÀO ĐÂY ĐỂ ẨN DẤU X MẶC ĐỊNH CỦA SHADCN */}
      <DialogContent className='sm:max-w-lg rounded-2xl p-0 overflow-hidden border border-slate-100 shadow-xl gap-0 [&>button]:hidden'>
        <DialogHeader className='px-5 pt-5 pb-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3'>
              {book?.image && (
                <div className='w-12 h-14 shrink-0 rounded-lg border border-slate-200 overflow-hidden bg-white p-1'>
                  <img
                    src={book.image}
                    alt={book.title}
                    className='w-full h-full object-contain mix-blend-multiply'
                  />
                </div>
              )}

              <div>
                <DialogTitle className='text-[14px] font-black text-slate-900 leading-tight'>
                  {isEdit ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
                </DialogTitle>

                {book?.title && (
                  <p className='text-[11.5px] text-slate-500 font-medium mt-0.5 line-clamp-2'>
                    {book.title}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className='p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 mt-0.5'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </DialogHeader>

        {submitted ? (
          <div className='flex flex-col items-center justify-center py-14 gap-3 animate-in fade-in zoom-in-95'>
            <div className='w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center'>
              <CheckCircle2 className='w-7 h-7 text-emerald-600' />
            </div>

            <div className='text-center'>
              <p className='text-[14px] font-black text-slate-900'>
                {isEdit ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã đánh giá!'}
              </p>
              <p className='text-[12px] text-slate-500 mt-1'>Đánh giá của bạn rất có giá trị.</p>
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-4 p-5'>
            <div>
              <p className='text-[12px] font-bold text-slate-700 mb-2 uppercase tracking-wide'>
                Chất lượng sản phẩm <span className='text-rose-500'>*</span>
              </p>

              <StarRating value={rating} onChange={setRating} size='lg' />

              {rating === 0 && (
                <p className='text-[11px] text-rose-500 mt-1.5'>Vui lòng chọn số sao</p>
              )}
            </div>

            <div>
              <p className='text-[12px] font-bold text-slate-700 mb-2 uppercase tracking-wide'>
                Nội dung <span className='text-rose-500'>*</span>
              </p>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='Chia sẻ trải nghiệm của bạn về cuốn sách này...'
                rows={4}
                className={cn(
                  'resize-none text-[13px] rounded-xl border-slate-200 focus:border-brand-green focus:ring-brand-green/20 transition-colors',
                  content.length > 0 && content.trim().length < 10 && 'border-rose-300'
                )}
              />

              <div className='flex justify-between items-center mt-1'>
                {content.trim().length < 10 && content.length > 0 ? (
                  <p className='text-[11px] text-rose-500'>Tối thiểu 10 ký tự</p>
                ) : (
                  <span />
                )}

                <p
                  className={cn(
                    'text-[11px] ml-auto',
                    content.length > 480 ? 'text-rose-500 font-bold' : 'text-slate-400'
                  )}
                >
                  {content.length}/500
                </p>
              </div>
            </div>

            <div>
              <p className='text-[12px] font-bold text-slate-700 mb-2 uppercase tracking-wide'>
                Ảnh đính kèm{' '}
                <span className='text-slate-400 font-normal normal-case'>(tuỳ chọn)</span>
              </p>

              <ReviewImageUploader urls={imageUrls} onChange={setImageUrls} />
            </div>

            <div className='flex gap-2 pt-1'>
              <Button
                variant='outline'
                className='flex-1 rounded-xl h-10 font-bold text-[13px] border-slate-200 text-slate-600 hover:bg-slate-50'
                onClick={onClose}
                disabled={isPending}
              >
                Huỷ
              </Button>

              <Button
                className={cn(
                  'flex-[2] rounded-xl h-10 font-bold text-[13px] shadow-sm transition-all active:scale-95',
                  canSubmit
                    ? 'bg-brand-green hover:bg-brand-green-dark text-white shadow-brand-green/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <>
                    <Send className='w-3.5 h-3.5 mr-1.5' />
                    {isEdit ? 'Cập nhật' : 'Gửi đánh giá'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
