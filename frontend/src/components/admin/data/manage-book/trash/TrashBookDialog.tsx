import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ArchiveRestore, Trash, Trash2, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBooksInTrashApi, restoreBookApi, hardDeleteBookApi } from '@/services/book/book.api'
import { toast } from 'sonner'
import type { BookResponse } from '@/services/book/book.type'

export function TrashBookDialog() {
  const { t } = useTranslation('product')
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['books-trash'],
    queryFn: () => getBooksInTrashApi(0, 100),
    enabled: open
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreBookApi(id),
    onSuccess: () => {
      toast.success(t('book.messages.restoreSuccess'))
      queryClient.invalidateQueries({ queryKey: ['books-trash'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => hardDeleteBookApi(id),
    onSuccess: () => {
      toast.success(t('book.messages.hardDeleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['books-trash'] })
    }
  })

  const booksInTrash = data?.content || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='h-9'>
          <Trash2 className='mr-2 h-4 w-4' />
          {t('book.trash.btnTrash')}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>{t('book.trash.title')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[60vh] overflow-auto rounded-md border'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead>{t('book.form.title')}</TableHead>
                <TableHead>{t('book.form.isbn')}</TableHead>
                <TableHead className='text-right'>{t('common.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center py-8'>
                    <Loader2 className='animate-spin mx-auto' />
                  </TableCell>
                </TableRow>
              ) : booksInTrash.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center py-8 text-muted-foreground'>
                    {t('book.trash.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                booksInTrash.map((book: BookResponse) => (
                  <TableRow key={book.id}>
                    <TableCell className='font-medium'>{book.title}</TableCell>
                    <TableCell>{book.isbn || t('common.na')}</TableCell>
                    <TableCell className='text-right space-x-2'>
                      <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => restoreMutation.mutate(book.id)}
                        disabled={restoreMutation.isPending}
                      >
                        <ArchiveRestore className='w-4 h-4 mr-1' /> {t('common.restore')}
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => {
                          if (
                            confirm(t('book.messages.confirmHardDelete', { title: book.title }))
                          ) {
                            hardDeleteMutation.mutate(book.id)
                          }
                        }}
                        disabled={hardDeleteMutation.isPending}
                      >
                        <Trash className='w-4 h-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
