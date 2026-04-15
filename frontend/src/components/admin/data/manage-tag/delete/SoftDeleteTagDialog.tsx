import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import i18n from '@/i18n/i18n'
import type { TagResponse } from '@/services/tag/tag.type'
import { deleteSoftTagApi } from '@/services/tag/tag.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface DeleteTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: TagResponse
}

export function DeleteTagDialog({ open, onOpenChange, tag }: DeleteTagDialogProps) {
  const { t } = useTranslation('tag')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteSoftTagApi(tag.id),
    onSuccess: () => {
      // Hiển thị thông báo thành công
      toast.success(t('message.success.delete', 'Đã xóa nhãn!'))
      onOpenChange(false)

      // Invalidate để tự động nảy lại cả bảng danh sách và bảng thùng rác
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags-trash'] })
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>
      toast.error(err.response?.data?.message || t('message.error.delete', 'Xóa thất bại!'))
    }
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.delete', 'Chuyển vào thùng rác?')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.deleteConfirm', {
              defaultValue: `Bạn có chắc chắn muốn chuyển nhãn "${tag.name}" vào thùng rác không?`,
              name: tag.name
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/* Lấy chữ "Hủy" từ file common translation giống User */}
          <AlertDialogCancel>{i18n.t('common:common.cancel', 'Hủy')}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {t('actions.confirm', 'Xác nhận')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
