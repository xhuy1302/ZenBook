import { DeletePermanentSupplierDialog } from '@/components/admin/data/manage-supplier/delete/DeletePermanentSupplierDialog'
import { RestoreSupplierDialog } from '@/components/admin/data/manage-supplier/restore/RestoreSupplierDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllSupplierInTrashApi } from '@/services/supplier/supplier.api'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

export function TrashSupplierDialog() {
  const { t } = useTranslation('supplier')
  const { data = [] } = useFetchData('supplier-trash', getAllSupplierInTrashApi)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
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
                data.map((supplier) => (
                  <tr key={supplier.id} className='border-t'>
                    <td className='p-3'>
                      <div className='font-medium'>{supplier.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {supplier.email || supplier.phone}
                      </div>
                    </td>
                    <td className='p-3'>
                      {supplier.deletedAt &&
                        format(new Date(supplier.deletedAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className='p-3 text-center space-x-2'>
                      <RestoreSupplierDialog id={supplier.id} name={supplier.name} />
                      <DeletePermanentSupplierDialog id={supplier.id} name={supplier.name} />
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
