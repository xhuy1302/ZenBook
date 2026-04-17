'use client'

import { DeletePermanentCategoryDialog } from '@/components/admin/data/manage-category/delete/DeletePermanentCategoryDialog'
import { RestoreCategoryDialog } from '@/components/admin/data/manage-category/restore/RestoreCategoryDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useFetchData } from '@/hooks/useFetchData'
import { getCategoriesInTrashApi } from '@/services/category/category.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function TrashCategoryDialog() {
  const { t } = useTranslation('category')

  // Gọi API lấy danh sách danh mục trong thùng rác
  const { data = [] } = useFetchData('category-trash', getCategoriesInTrashApi)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            className='gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'
          >
            <Trash2 className='h-4 w-4' />
            {t('trash.openButton')}
          </Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-[900px] w-[95vw] max-h-[90vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Trash2 className='h-5 w-5 text-destructive' />
              {t('trash.title')}
            </DialogTitle>
          </DialogHeader>

          <div className='mt-4 border rounded-md overflow-hidden flex-1 overflow-y-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-muted sticky top-0'>
                <tr>
                  <th className='text-left p-3'>{t('table.columns.name')}</th>
                  <th className='text-left p-3'>{t('fields.deletedAt')}</th>
                  <th className='text-center p-3'>{t('table.columns.actions')}</th>
                </tr>
              </thead>

              <tbody className='divide-y'>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-8 text-muted-foreground italic'>
                      {t('trash.trashEmpty')}
                    </td>
                  </tr>
                ) : (
                  data.map((category) => (
                    <tr key={category.id} className='hover:bg-muted/50 transition-colors'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          {/* FIX 1: Dùng || thay vì ?? để bắt trường hợp "" và đổi placeholder */}
                          <img
                            src={category.thumbnailUrl || 'https://placehold.co/150?text=No+Image'}
                            alt={category.categoryName}
                            className='h-10 w-10 rounded border object-cover'
                            onError={(e) => {
                              // FIX 2: Xử lý nếu link ảnh từ DB bị lỗi 404
                              e.currentTarget.src = 'https://placehold.co/150?text=Error'
                            }}
                          />

                          <div className='flex flex-col'>
                            <span className='font-medium'>{category.categoryName}</span>
                            <span className='text-xs text-muted-foreground'>{category.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3'>
                        {category.deletedAt &&
                          (() => {
                            const deletedDate = new Date(category.deletedAt)
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                <span
                                  className={`text-xs ${remainingDays < 7 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
                                >
                                  {t('trash.remainingDays', { days: remainingDays })}
                                </span>
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <RestoreCategoryDialog
                            categoryId={category.id}
                            categoryName={category.categoryName}
                          />

                          <DeletePermanentCategoryDialog
                            categoryId={category.id}
                            categoryName={category.categoryName}
                          />
                        </div>
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
