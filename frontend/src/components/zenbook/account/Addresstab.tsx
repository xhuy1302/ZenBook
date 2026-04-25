import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, MapPin, Home, Phone, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import AddressDialog from './modals/AddressDialog'
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi
} from '@/services/customer/customer.api'
import type { Address, AddressRequest } from '@/services/customer/customer.type'

interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  isDeleting: boolean
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, isDeleting }: AddressCardProps) {
  const { t } = useTranslation('account')
  const isDefault = address.isDefault === true

  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all duration-200 bg-white hover:shadow-md ${
        isDefault
          ? 'border-brand-green/40 shadow-sm ring-1 ring-brand-green/10'
          : 'border-slate-200'
      }`}
    >
      <div className='flex items-start gap-4'>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDefault ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 text-slate-500'}`}
        >
          <Home className='w-5 h-5' />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2.5 mb-1.5'>
            <span className='font-bold text-[15px] text-slate-900 truncate'>
              {address.recipientName}
            </span>
            <span className='w-1 h-1 rounded-full bg-slate-300 shrink-0' />
            <span className='text-[13px] text-slate-600 flex items-center gap-1.5 font-medium'>
              <Phone className='w-3.5 h-3.5' />
              {address.phone}
            </span>
          </div>

          <p className='text-[13px] text-slate-700 leading-relaxed'>{address.street}</p>
          <p className='text-[13px] text-slate-500 mt-0.5 leading-relaxed'>
            {address.ward}, {address.district}, {address.city}
          </p>
        </div>
      </div>

      <div className='flex items-center justify-between mt-5 pt-4 border-t border-slate-100'>
        <div>
          {isDefault ? (
            <div className='flex items-center gap-1.5 text-brand-green text-[13px] font-bold bg-brand-green/5 px-3 py-1.5 rounded-lg'>
              <CheckCircle2 className='w-4 h-4' strokeWidth={2.5} />
              <span>{t('address.defaultText', 'Mặc định')}</span>
            </div>
          ) : (
            <Button
              variant='outline'
              size='sm'
              onClick={onSetDefault}
              className='h-8 px-4 text-[12.5px] font-bold border-slate-200 hover:border-brand-green hover:text-brand-green hover:bg-brand-green/5 transition-all rounded-lg'
            >
              {t('address.setDefault', 'Đặt mặc định')}
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onEdit}
            className='h-8 px-3 text-[13px] font-semibold hover:text-brand-green hover:bg-brand-green/10 gap-1.5 rounded-lg'
          >
            <Pencil className='w-3.5 h-3.5' />
            {t('common.edit', 'Sửa')}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                disabled={isDeleting}
                className='h-8 px-3 text-[13px] font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 gap-1.5 rounded-lg'
              >
                <Trash2 className='w-3.5 h-3.5' />
                {t('common.delete', 'Xoá')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='rounded-2xl'>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-red-600'>
                  {t('address.deleteTitle', 'Xóa địa chỉ')}
                </AlertDialogTitle>
                <AlertDialogDescription className='text-[13px]'>
                  {t(
                    'address.deleteDescription',
                    'Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.'
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className='rounded-xl text-[13px] font-semibold h-10'>
                  {t('common.cancel', 'Hủy')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className='bg-red-600 hover:bg-red-700 text-white rounded-xl text-[13px] font-semibold h-10'
                >
                  {t('common.delete', 'Xóa')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

export default function AddressTab() {
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Address | undefined>()

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesApi
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAddressApi,
    onSuccess: () => {
      toast.success(t('address.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error(t('address.deleteError'))
  })

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddressApi,
    onSuccess: () => {
      toast.success(t('address.defaultSuccess'))
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
    onError: () => toast.error(t('address.defaultError'))
  })

  const handleSave = async (data: AddressRequest) => {
    try {
      if (editTarget) {
        await updateAddressApi(editTarget.id, data)
        toast.success(t('address.updateSuccess'))
      } else {
        await createAddressApi(data)
        toast.success(t('address.createSuccess'))
      }
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    } catch {
      toast.error(t('address.saveError'))
    }
  }

  const openCreate = () => {
    setEditTarget(undefined)
    setDialogOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditTarget(address)
    setDialogOpen(true)
  }

  return (
    <div className='animate-in fade-in duration-300'>
      <div className='mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-xl font-bold text-slate-900'>{t('address.title')}</h2>
          <p className='text-[13px] text-slate-500 mt-1 font-medium'>{t('address.subtitle')}</p>
        </div>
        <Button
          onClick={openCreate}
          className='bg-brand-green hover:bg-brand-green-dark text-white gap-2 shrink-0 h-10 px-5 rounded-xl font-bold shadow-md shadow-brand-green/20 transition-all hover:-translate-y-0.5'
        >
          <Plus className='w-4 h-4' strokeWidth={2.5} />
          {t('address.addNew')}
        </Button>
      </div>

      {isLoading ? (
        <div className='grid xl:grid-cols-2 gap-5'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-48 w-full rounded-2xl bg-slate-100' />
          ))}
        </div>
      ) : !addresses?.length ? (
        <div className='flex flex-col items-center justify-center py-24 gap-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50'>
          <div className='w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100'>
            <MapPin className='w-8 h-8 text-slate-400' />
          </div>
          <div>
            <p className='font-bold text-[15px] text-slate-800'>{t('address.emptyTitle')}</p>
            <p className='text-[13px] text-slate-500 mt-1.5 max-w-[250px] mx-auto'>
              {t('address.emptyDescription')}
            </p>
          </div>
          <Button
            onClick={openCreate}
            className='mt-2 bg-white text-brand-green border border-brand-green hover:bg-brand-green/5 gap-2 h-10 px-6 rounded-xl font-bold transition-all'
          >
            <Plus className='w-4 h-4' strokeWidth={2.5} />
            {t('address.addFirst')}
          </Button>
        </div>
      ) : (
        <div className='grid xl:grid-cols-2 gap-5'>
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openEdit(address)}
              onDelete={() => deleteMutation.mutate(address.id)}
              onSetDefault={() => defaultMutation.mutate(address.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editTarget}
        onSave={handleSave}
      />
    </div>
  )
}
