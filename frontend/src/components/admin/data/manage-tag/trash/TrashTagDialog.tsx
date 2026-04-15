'use client'

import { DeletePermanentTagDialog } from '@/components/admin/data/manage-tag/delete/HardDeleteTagDialog'
import { RestoreTagDialog } from '@/components/admin/data/manage-tag/restore/RestoreTagDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllTagInTrashApi } from '@/services/tag/tag.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { Trash2, Tag as TagIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Sửa lỗi: Đảm bảo có chữ "export" ở đây và không dùng "default"
export function TrashTagDialog() {
  const { t } = useTranslation('tag')

  const { data = [] } = useFetchData('tags-trash', getAllTagInTrashApi)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2 h-8'>
          <Trash2 className='h-4 w-4' />
          <span className='hidden sm:inline'>{t('trash.openButton', 'Thùng rác')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[850px] w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b'>
          <DialogTitle className='flex items-center gap-2'>
            <Trash2 className='w-5 h-5 text-destructive' />
            {t('trash.title', 'Thùng rác Nhãn')}
          </DialogTitle>
        </DialogHeader>

        <div className='p-6 overflow-y-auto'>
          <div className='border rounded-md overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left p-3 font-semibold'>{t('table.columns.name')}</th>
                  <th className='text-left p-3 font-semibold'>
                    {t('fields.deletedAt', 'Ngày xóa')}
                  </th>
                  <th className='text-center p-3 font-semibold'>{t('table.columns.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-8 text-muted-foreground'>
                      {t('trash.trashEmpty')}
                    </td>
                  </tr>
                ) : (
                  data.map((tag) => (
                    <tr key={tag.id} className='border-t hover:bg-muted/30 transition-colors'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-8 h-8 rounded flex items-center justify-center border shadow-sm'
                            style={{ backgroundColor: tag.color || '#e5e7eb' }}
                          >
                            <TagIcon className='w-4 h-4 text-white drop-shadow-sm' />
                          </div>
                          <div className='flex flex-col'>
                            <span className='font-medium text-foreground'>{tag.name}</span>
                            <span className='text-xs text-muted-foreground'>/{tag.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3 text-muted-foreground'>
                        {tag.deletedAt &&
                          (() => {
                            const deletedDate = new Date(tag.deletedAt)
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span className='text-foreground'>
                                  {format(deletedDate, 'dd/MM/yyyy HH:mm')}
                                </span>
                                <span className='text-[11px] text-red-500 font-medium'>
                                  {t('trash.remainingDays', { days: remainingDays })}
                                </span>
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        <RestoreTagDialog tagId={tag.id} tagName={tag.name} />
                        <DeletePermanentTagDialog tagId={tag.id} tagName={tag.name} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
