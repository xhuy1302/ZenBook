import { DeletePermanentUserDialog } from '@/components/admin/data/manage-user/delete/DeletePermanentUserDialog'
import { RestoreUserDialog } from '@/components/admin/data/manage-user/restore/RestoreUserDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllUserInTrashApi } from '@/services/user/user.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function TrashUserDialog() {
  const { t } = useTranslation('user')

  const { data = [] } = useFetchData('user-trash', getAllUserInTrashApi)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline' className='gap-2'>
            <Trash2 className='h-4 w-4' />
            {t('trash.openButton', 'Thùng rác')}
          </Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-[900px] w-[95vw] max-h-[90vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle>{t('trash.title')}</DialogTitle>
          </DialogHeader>

          <div className='mt-4 border rounded-md overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted'>
                <tr>
                  <th className='text-left p-3 w-1/3'>{t('table.columns.user')}</th>
                  <th className='text-left p-3 w-1/3'>{t('fields.deletedAt')}</th>
                  <th className='text-center p-3 w-1/4'>{t('table.columns.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-4'>
                      {t('trash.trashEmpty')}
                    </td>
                  </tr>
                ) : (
                  data.map((user) => (
                    <tr key={user.id} className='border-t'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={user.avatar ?? 'https://ui.shadcn.com/avatars/02.png'}
                            alt={user.username}
                            className='h-10 w-10 rounded-full border object-cover'
                          />

                          <div className='flex flex-col'>
                            <span className='font-medium'>{user.username}</span>
                            <span className='text-xs text-muted-foreground'>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3'>
                        {user.deletedAt &&
                          (() => {
                            const deletedDate = new Date(user.deletedAt)
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                {
                                  <span className='text-xs text-muted-foreground'>
                                    {t('trash.remainingDays', { days: remainingDays })}
                                  </span>
                                }
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        <RestoreUserDialog userId={user.id} email={user.email} />

                        {/* Đã thay nút Trash2 thành Component DeletePermanentUserDialog */}
                        <DeletePermanentUserDialog userId={user.id} email={user.email} />
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
