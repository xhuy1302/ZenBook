import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBookApi } from '@/services/book/book.api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { BookResponse } from '@/services/book/book.type'
import { useTranslation } from 'react-i18next'

interface DeleteBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: BookResponse
}

export function SoftDeleteBookDialog({ open, onOpenChange, book }: DeleteBookDialogProps) {
  const { t } = useTranslation('product')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteBookApi(book.id),
    onSuccess: () => {
      toast.success(t('book.messages.softDeleteSuccess', { title: book.title }))
      queryClient.invalidateQueries({ queryKey: ['books'] })
      onOpenChange(false)
    },
    onError: () => toast.error(t('book.messages.softDeleteError'))
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('book.dialog.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('book.dialog.deleteConfirm1')}{' '}
            <strong className='text-foreground'>{book?.title}</strong>
            {t('book.dialog.deleteConfirm2')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('book.dialog.btnSoftDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
