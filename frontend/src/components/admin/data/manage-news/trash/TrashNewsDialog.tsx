'use client'

import { DeletePermanentNewsDialog } from '@/components/admin/data/manage-news/delete/DeletePermanentNewsDialog'
import { RestoreNewsDialog } from '@/components/admin/data/manage-news/restore/RestoreNewsDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
// 1. Đổi sang dùng useQuery chuẩn
import { useQuery } from '@tanstack/react-query'
// 2. Import đúng API lấy bài viết trong thùng rác
import { getNewsInTrashApi } from '@/services/news/news.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { Trash2, Newspaper } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function TrashNewsDialog() {
  const { t } = useTranslation('news')

  // 3. Sử dụng useQuery với queryKey dạng mảng
  const { data } = useQuery({
    queryKey: ['news-trash'],
    queryFn: getNewsInTrashApi
  })

  // 4. Lớp bảo hiểm: Đảm bảo trashData luôn luôn là một mảng
  const trashData = Array.isArray(data) ? data : []

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'
        >
          <Trash2 className='h-4 w-4' />
          <span className='hidden sm:inline'>{t('trash.openButton', 'Thùng rác')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[850px] w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b'>
          <DialogTitle className='flex items-center gap-2'>
            <Trash2 className='w-5 h-5 text-destructive' />
            {t('trash.title', 'Thùng rác Bài viết')}
          </DialogTitle>
        </DialogHeader>

        <div className='p-6 overflow-y-auto'>
          <div className='border rounded-md overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left p-3 font-semibold'>
                    {t('table.columns.title', 'Tiêu đề')}
                  </th>
                  <th className='text-left p-3 font-semibold'>
                    {t('fields.deletedAt', 'Ngày xóa')}
                  </th>
                  <th className='text-center p-3 font-semibold'>
                    {t('table.columns.actions', 'Hành động')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Sử dụng trashData đã được bảo vệ */}
                {trashData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-8 text-muted-foreground'>
                      {t('trash.trashEmpty', 'Thùng rác trống')}
                    </td>
                  </tr>
                ) : (
                  trashData.map((news) => (
                    <tr key={news.id} className='border-t hover:bg-muted/30 transition-colors'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          {news.thumbnail ? (
                            <img
                              src={news.thumbnail}
                              alt={news.title}
                              className='w-10 h-10 rounded object-cover border shadow-sm shrink-0'
                              onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/100x100?text=No+Image'
                              }}
                            />
                          ) : (
                            <div className='w-10 h-10 rounded flex items-center justify-center border shadow-sm bg-muted shrink-0'>
                              <Newspaper className='w-5 h-5 text-muted-foreground' />
                            </div>
                          )}
                          <div className='flex flex-col'>
                            <span className='font-medium text-foreground line-clamp-1'>
                              {news.title}
                            </span>
                            <span className='text-xs text-muted-foreground'>/{news.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3 text-muted-foreground'>
                        {news.deletedAt &&
                          (() => {
                            // Xử lý an toàn cho Date
                            try {
                              // Chú ý: Nếu định dạng backend trả về là "dd-MM-yyyy HH:mm:ss" thì new Date() có thể lỗi trên vài trình duyệt.
                              // Để an toàn tạm thời, code này vẫn giữ nguyên logic cũ của bạn.
                              const deletedDate = new Date(news.deletedAt)
                              const expiredDate = addDays(deletedDate, 30)
                              const remainingDays = differenceInDays(expiredDate, new Date())

                              return (
                                <div className='flex flex-col'>
                                  <span className='text-foreground'>
                                    {format(deletedDate, 'dd/MM/yyyy HH:mm')}
                                  </span>
                                  <span className='text-[11px] text-red-500 font-medium'>
                                    {t('trash.remainingDays', `Còn ${remainingDays} ngày`)}
                                  </span>
                                </div>
                              )
                            } catch {
                              return <span>{news.deletedAt}</span>
                            }
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        <RestoreNewsDialog newsId={news.id} newsTitle={news.title} />
                        <DeletePermanentNewsDialog newsId={news.id} newsTitle={news.title} />
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
