import { DeletePermanentAuthorDialog } from '@/components/admin/data/manage-author/delete/DeletePermanentAuthorDialog'
import { RestoreAuthorDialog } from '@/components/admin/data/manage-author/restore/RestoreAuthorDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllAuthorInTrashApi } from '@/services/author/author.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function TrashAuthorDialog() {
  const { t } = useTranslation('author')

  // Sử dụng key 'author-trash' và gọi API lấy rác của tác giả
  const { data = [] } = useFetchData('author-trash', getAllAuthorInTrashApi)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            className='gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'
          >
            <Trash2 className='h-4 w-4' />
            {t('trash.openButton', 'Thùng rác')}
          </Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-[900px] w-[95vw] max-h-[90vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle>{t('dialogTitle.trash', 'Thùng rác tác giả')}</DialogTitle>
          </DialogHeader>

          <div className='mt-4 border rounded-md overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted'>
                <tr>
                  <th className='text-left p-3 w-1/3'>{t('table.columns.name', 'Tác giả')}</th>
                  <th className='text-left p-3 w-1/3'>
                    {t('table.columns.deletedAt', 'Ngày xóa')}
                  </th>
                  <th className='text-center p-3 w-1/4'>
                    {t('table.columns.actions', 'Thao tác')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-4'>
                      {t('trash.empty', 'Thùng rác trống')}
                    </td>
                  </tr>
                ) : (
                  data.map((author) => (
                    <tr key={author.id} className='border-t'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={author.avatar ?? 'https://ui.shadcn.com/avatars/02.png'}
                            alt={author.name}
                            className='h-10 w-10 rounded-full border object-cover'
                          />

                          <div className='flex flex-col'>
                            {/* Author chỉ có name */}
                            <span className='font-medium'>{author.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3'>
                        {author.deletedAt &&
                          (() => {
                            const deletedDate = new Date(author.deletedAt!) // Dùng ! vì đã check if ở trên
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                {
                                  <span className='text-xs text-muted-foreground'>
                                    {t('trash.remainingDays', {
                                      days: remainingDays,
                                      defaultValue: `Còn ${remainingDays} ngày`
                                    })}
                                  </span>
                                }
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        <RestoreAuthorDialog authorId={author.id} name={author.name} />
                        <DeletePermanentAuthorDialog authorId={author.id} name={author.name} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
