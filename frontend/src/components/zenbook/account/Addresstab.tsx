// Đường dẫn: src/components/zenbook/account/AddressTab.tsx

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

// 👉 Import Dialog chúng ta vừa tách ra
import AddressDialog from './modals/AddressDialog'

import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi
} from '@/services/customer/customer.api'
import type { Address, AddressPayload } from '@/services/customer/customer.type'

// ── Address Card Component ────────────────────────────────────────────────────
interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  isDeleting: boolean
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, isDeleting }: AddressCardProps) {
  const { t } = useTranslation('account')

  const isDefault = address.default === true || address.isDefault === true

  return (
    <div
      className={`relative rounded-xl border p-5 transition-all bg-card ${isDefault ? 'border-brand-green shadow-sm' : 'border-border'}`}
    >
      {/* ── KHU VỰC TRÊN: THÔNG TIN ── */}
      <div className='flex items-start gap-4'>
        {/* Icon Home nền xám giống ảnh */}
        <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground'>
          <Home className='w-5 h-5' />
        </div>

        {/* Nội dung text */}
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='font-bold text-base text-foreground'>{address.recipientName}</span>
            <span className='text-muted-foreground/40'>|</span>
            <span className='text-sm text-muted-foreground flex items-center gap-1'>
              <Phone className='w-3.5 h-3.5' />
              {address.phone}
            </span>
          </div>

          <p className='text-sm text-foreground mt-1'>{address.street}</p>
          <p className='text-sm text-muted-foreground mt-1'>
            {address.ward}, {address.district}, {address.city}
          </p>
        </div>
      </div>

      {/* ── KHU VỰC DƯỚI: NÚT BẤM (GIỐNG HỆT ẢNH) ── */}
      <div className='flex items-center justify-between mt-5 pt-4 border-t border-border'>
        {/* Trái: Trạng thái Mặc định */}
        <div>
          {isDefault ? (
            // Nếu LÀ mặc định: Hiện icon tích xanh và chữ (Giống ảnh 1)
            <div className='flex items-center gap-1.5 text-brand-green text-sm font-medium'>
              <CheckCircle2 className='w-4 h-4' strokeWidth={2} />
              <span>{t('address.defaultText', 'Địa chỉ mặc định')}</span>
            </div>
          ) : (
            // Nếu KHÔNG LÀ mặc định: Hiện nút bấm (Giống ảnh 2)
            <Button
              variant='outline'
              size='sm'
              onClick={onSetDefault}
              className='h-8 text-xs font-medium border-border hover:border-brand-green hover:text-brand-green transition-colors'
            >
              {t('address.setDefault', 'Đặt mặc định')}
            </Button>
          )}
        </div>

        {/* Phải: Sửa / Xóa */}
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onEdit}
            className='h-8 px-3 text-xs hover:text-brand-green hover:bg-brand-green/10 gap-1.5'
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
                className='h-8 px-3 text-xs text-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5'
              >
                <Trash2 className='w-3.5 h-3.5' />
                {t('common.delete', 'Xoá')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('address.deleteTitle', 'Xóa địa chỉ')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('address.deleteDescription', 'Bạn có chắc chắn muốn xóa địa chỉ này?')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel', 'Hủy')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'
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

// ── Main Tab Component ────────────────────────────────────────────────────────
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

  const handleSave = async (data: AddressPayload) => {
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
    <div>
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>{t('address.title')}</h2>
          <p className='text-sm text-muted-foreground mt-1'>{t('address.subtitle')}</p>
        </div>
        <Button
          onClick={openCreate}
          className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground gap-2 shrink-0'
        >
          <Plus className='w-4 h-4' />
          {t('address.addNew')}
        </Button>
      </div>

      {isLoading ? (
        <div className='grid sm:grid-cols-2 gap-4'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-44 w-full rounded-xl' />
          ))}
        </div>
      ) : !addresses?.length ? (
        <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
          <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center'>
            <MapPin className='w-9 h-9 text-muted-foreground' />
          </div>
          <div>
            <p className='font-semibold text-foreground'>{t('address.emptyTitle')}</p>
            <p className='text-sm text-muted-foreground mt-1'>{t('address.emptyDescription')}</p>
          </div>
          <Button
            onClick={openCreate}
            className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground gap-2'
          >
            <Plus className='w-4 h-4' />
            {t('address.addFirst')}
          </Button>
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 gap-4'>
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

      {/* Gọi file Modal vừa tách */}
      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editTarget}
        onSave={handleSave}
      />
    </div>
  )
}
