'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EditPromotionForm } from './EditPromotionForm'
import type { PromotionResponse } from '@/services/promotion/promotion.type'

interface EditPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse | null
}

export function EditPromotionDialog({ open, onOpenChange, promotion }: EditPromotionDialogProps) {
  const { t } = useTranslation('promotion')

  // Nếu không có promotion truyền vào (chưa render xong hoặc lỗi), không hiển thị Dialog
  if (!promotion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* max-w-3xl để form có không gian thoải mái hiển thị danh sách sách */}
      <DialogContent className='sm:max-w-3xl p-0 bg-background overflow-hidden border-none shadow-2xl'>
        <DialogHeader className='px-6 py-5 bg-muted/30 border-b'>
          <DialogTitle className='text-xl font-bold flex items-center gap-2 text-foreground'>
            <Edit className='w-5 h-5 text-primary' />
            {t('dialogTitle.update', 'Cập nhật chương trình khuyến mãi')}
          </DialogTitle>
        </DialogHeader>

        {/* Bọc form trong 1 div có max-height và scroll để form không bị tràn màn hình */}
        <div className='p-6 max-h-[80vh] overflow-y-auto custom-scrollbar'>
          <EditPromotionForm promotion={promotion} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
