import { DeletePermanentPublisherDialog } from '@/components/admin/data/manage-publisher/delete/DeletePermanentPublisherDialog'
import { RestorePublisherDialog } from '@/components/admin/data/manage-publisher/restore/RestorePublisherDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllPublishersInTrashApi } from '@/services/publisher/publisher.api'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

export function TrashPublisherDialog() {
  const { t } = useTranslation('publisher')
  const { data = [] } = useFetchData('publisher-trash', getAllPublishersInTrashApi)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'
        >
          <Trash2 className='h-4 w-4' /> {t('trash.openButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[800px] w-[95vw] max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>{t('trash.title')}</DialogTitle>
        </DialogHeader>
        <div className='mt-4 border rounded-md overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted'>
              <tr>
                <th className='text-left p-3'>{t('table.columns.name')}</th>
                <th className='text-left p-3'>{t('fields.deletedAt')}</th>
                <th className='text-center p-3'>{t('table.columns.actions')}</th>
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
                data.map((publisher) => (
                  <tr key={publisher.id} className='border-t'>
                    <td className='p-3'>
                      <div className='font-medium'>{publisher.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {publisher.email || publisher.phone}
                      </div>
                    </td>
                    <td className='p-3'>
                      {publisher.deletedAt &&
                        format(new Date(publisher.deletedAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className='p-3 text-center space-x-2'>
                      <RestorePublisherDialog id={publisher.id} name={publisher.name} />
                      <DeletePermanentPublisherDialog id={publisher.id} name={publisher.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
