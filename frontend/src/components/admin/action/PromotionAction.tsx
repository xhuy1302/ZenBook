'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, StopCircle, Trash2, Eye, Edit, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stopPromotionApi, resumePromotionApi } from '@/services/promotion/promotion.api'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { toast } from 'sonner'

// Import các Dialog (Bạn nhớ điều chỉnh lại đường dẫn import cho khớp với project của bạn nhé)
import { ViewPromotionDialog } from '../data/manage-promotion/read/ViewPromotionDialog'
import { EditPromotionDialog } from '../data/manage-promotion/update/EditPromotionDialog'
import { SoftDeletePromotionDialog } from '../data/manage-promotion/delete/SoftDeletePromotionDialog'

interface PromotionActionsCellProps {
  promotion: PromotionResponse
}

export function PromotionActionsCell({ promotion }: PromotionActionsCellProps) {
  const { t } = useTranslation('promotion')
  const queryClient = useQueryClient()

  // Quản lý trạng thái đóng/mở của các Dialog
  const [openView, setOpenView] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openSoftDelete, setOpenSoftDelete] = useState(false)

  // ==========================
  // Xử lý Dừng Khẩn Cấp
  // ==========================
  const stopMutation = useMutation({
    mutationFn: () => stopPromotionApi(promotion.id),
    onSuccess: () => {
      toast.success(
        t('message.success.stop', 'Đã dừng khẩn cấp đợt khuyến mãi! Giá sách đã quay về ban đầu.')
      )
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
    onError: () => {
      toast.error(t('message.error.stop', 'Lỗi khi dừng khuyến mãi.'))
    }
  })

  const handleStop = () => {
    if (
      window.confirm(
        t('message.warning.stopConfirm', 'Bạn có chắc muốn dừng khẩn cấp đợt sale này?')
      )
    ) {
      stopMutation.mutate()
    }
  }

  // ==========================
  // Xử lý Bật Lại (Resume)
  // ==========================
  const resumeMutation = useMutation({
    mutationFn: () => resumePromotionApi(promotion.id),
    onSuccess: () => {
      toast.success(t('message.success.resume', 'Đã bật lại chương trình khuyến mãi thành công!'))
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('message.error.resume', 'Lỗi khi bật lại khuyến mãi.')
      toast.error(msg)
    }
  })

  const handleResume = () => {
    if (
      window.confirm(
        t(
          'message.warning.resumeConfirm',
          'Bạn có chắc muốn bật lại chương trình này? Các sản phẩm sẽ được áp dụng lại giá khuyến mãi.'
        )
      )
    ) {
      resumeMutation.mutate()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0 hover:bg-muted'>
            <span className='sr-only'>Mở menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[200px]'>
          <DropdownMenuLabel>{t('actions.title', 'Thao tác')}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Nút Xem chi tiết */}
          <DropdownMenuItem onClick={() => setOpenView(true)} className='cursor-pointer'>
            <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
            {t('actions.view', 'Xem chi tiết')}
          </DropdownMenuItem>

          {/* Nút Cập nhật */}
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className='cursor-pointer'>
            <Edit className='mr-2 h-4 w-4 text-blue-600' />
            {t('actions.edit', 'Cập nhật')}
          </DropdownMenuItem>

          {/* CHỈ hiện nút Dừng khẩn cấp nếu đợt sale đang chạy (ACTIVE) hoặc sắp chạy (SCHEDULED) */}
          {(promotion.status === 'ACTIVE' || promotion.status === 'SCHEDULED') && (
            <DropdownMenuItem
              onClick={handleStop}
              disabled={stopMutation.isPending}
              className='cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950'
            >
              <StopCircle className='mr-2 h-4 w-4' />
              {t('actions.stop', 'Dừng khẩn cấp')}
            </DropdownMenuItem>
          )}

          {/* CHỈ hiện nút Bật lại nếu đợt sale đang Tạm dừng (PAUSED) */}
          {promotion.status === 'PAUSED' && (
            <DropdownMenuItem
              onClick={handleResume}
              disabled={resumeMutation.isPending}
              className='cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950'
            >
              <Play className='mr-2 h-4 w-4' />
              {t('actions.resume', 'Bật lại chương trình')}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Nút Xóa Mềm - Thay vì gọi API trực tiếp, mở Dialog Xóa */}
          <DropdownMenuItem
            onClick={() => setOpenSoftDelete(true)}
            className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {t('actions.delete', 'Xóa chương trình')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tích hợp các Dialogs */}
      <ViewPromotionDialog open={openView} onOpenChange={setOpenView} promotion={promotion} />
      <EditPromotionDialog open={openEdit} onOpenChange={setOpenEdit} promotion={promotion} />

      {/* Dialog Xóa Mềm (Sẽ lo phần gọi API deletePromotionApi bên trong nó) */}
      <SoftDeletePromotionDialog
        open={openSoftDelete}
        onOpenChange={setOpenSoftDelete}
        promotion={promotion}
      />
    </>
  )
}
