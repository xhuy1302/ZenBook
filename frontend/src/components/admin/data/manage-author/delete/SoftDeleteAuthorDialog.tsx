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
import type { AuthorResponse } from '@/services/author/author.type'
import { deleteSoftAuthorApi } from '@/services/author/author.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface SoftDeleteAuthorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  author: AuthorResponse
}

export function SoftDeleteAuthorDialog({
  open,
  onOpenChange,
  author
}: SoftDeleteAuthorDialogProps) {
  const { t } = useTranslation('author')

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteSoftAuthorApi(author.id),
    onSuccess: () => {
      // Dùng key softDelete mà chúng ta đã định nghĩa trong file JSON
      toast.success(t('message.success.softDelete'))
      onOpenChange(false)

      // Cập nhật lại danh sách tác giả và thùng rác
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      queryClient.invalidateQueries({ queryKey: ['author-trash'] })
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>
      toast.error(err.response?.data?.message || t('message.error.delete'))
    }
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.softDelete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {/* Sử dụng author.name thay vì email và trỏ đúng vào key warning */}
            {t('message.warning.softDeleteConfirm', { name: author.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{i18n.t('common:common.cancel')}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
