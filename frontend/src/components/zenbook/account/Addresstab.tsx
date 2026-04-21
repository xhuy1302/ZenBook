// ─────────────────────────────────────────────────────────────────────────────
// components/zenbook/account/AddressTab.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, MapPin, Home, Phone, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
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

// 👉 IMPORT CÁC HÀM API MỚI (đã sửa thành các hàm riêng lẻ)
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi
} from '@/services/customer/customer.api'

import type { Address, AddressPayload } from '@/services/customer/customer.type'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  recipientName: z.string().min(2, 'validation.nameMinLength'), // Sẽ dùng t() bên trong component
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'validation.phoneInvalid'),
  street: z.string().min(5, 'validation.streetMinLength'),
  ward: z.string().min(1, 'validation.wardRequired'),
  district: z.string().min(1, 'validation.districtRequired'),
  city: z.string().min(1, 'validation.cityRequired')
})

type FormValues = z.infer<typeof schema>

// ── Address Form Dialog ───────────────────────────────────────────────────────

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Address
  onSave: (data: AddressPayload) => Promise<void>
}

function AddressDialog({ open, onOpenChange, initialData, onSave }: AddressDialogProps) {
  const { t } = useTranslation('account')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          recipientName: initialData.recipientName,
          phone: initialData.phone,
          street: initialData.street,
          ward: initialData.ward,
          district: initialData.district,
          city: initialData.city
        }
      : {
          recipientName: '',
          phone: '',
          street: '',
          ward: '',
          district: '',
          city: ''
        }
  })

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              recipientName: initialData.recipientName,
              phone: initialData.phone,
              street: initialData.street,
              ward: initialData.ward,
              district: initialData.district,
              city: initialData.city
            }
          : {
              recipientName: '',
              phone: '',
              street: '',
              ward: '',
              district: '',
              city: ''
            }
      )
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: FormValues) => {
    await onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>{initialData ? t('address.editTitle') : t('address.addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-1'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label>{t('address.recipientName')}</Label>
              <Input
                placeholder={t('address.recipientNamePlaceholder')}
                {...register('recipientName')}
              />
              {errors.recipientName && (
                <p className='text-destructive text-xs'>
                  {t(errors.recipientName.message as string)}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label>{t('address.phone')}</Label>
              <Input placeholder={t('address.phonePlaceholder')} {...register('phone')} />
              {errors.phone && (
                <p className='text-destructive text-xs'>{t(errors.phone.message as string)}</p>
              )}
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label>{t('address.street')}</Label>
            <Input placeholder={t('address.streetPlaceholder')} {...register('street')} />
            {errors.street && (
              <p className='text-destructive text-xs'>{t(errors.street.message as string)}</p>
            )}
          </div>

          <div className='grid grid-cols-3 gap-3'>
            <div className='space-y-1.5'>
              <Label>{t('address.ward')}</Label>
              <Input placeholder={t('address.wardPlaceholder')} {...register('ward')} />
              {errors.ward && (
                <p className='text-destructive text-xs'>{t(errors.ward.message as string)}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label>{t('address.district')}</Label>
              <Input placeholder={t('address.districtPlaceholder')} {...register('district')} />
              {errors.district && (
                <p className='text-destructive text-xs'>{t(errors.district.message as string)}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label>{t('address.city')}</Label>
              <Input placeholder={t('address.cityPlaceholder')} {...register('city')} />
              {errors.city && (
                <p className='text-destructive text-xs'>{t(errors.city.message as string)}</p>
              )}
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground'
            >
              {isSubmitting
                ? t('common.saving')
                : initialData
                  ? t('common.update')
                  : t('common.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Address Card ──────────────────────────────────────────────────────────────

interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  isDeleting: boolean
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, isDeleting }: AddressCardProps) {
  const { t } = useTranslation('account')
  return (
    <div
      className={`relative rounded-xl border bg-card p-5 transition-all ${
        address.isDefault
          ? 'border-brand-green/50 bg-brand-green/5'
          : 'border-border hover:border-brand-green/30'
      }`}
    >
      {address.isDefault && (
        <span className='absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full border border-brand-green/20'>
          <Star className='w-2.5 h-2.5 fill-brand-green' />
          {t('address.default')}
        </span>
      )}

      <div className='flex items-start gap-3 mb-3'>
        <div className='w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0 mt-0.5'>
          <Home className='w-4 h-4 text-brand-green' />
        </div>
        <div>
          <p className='font-semibold text-sm text-foreground'>{address.recipientName}</p>
          <p className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5'>
            <Phone className='w-3 h-3' />
            {address.phone}
          </p>
        </div>
      </div>

      <p className='text-sm text-muted-foreground leading-relaxed ml-11'>
        {address.street}, {address.ward}, {address.district}, {address.city}
      </p>

      <div className='flex items-center gap-2 mt-4 pt-3 border-t border-border'>
        {!address.isDefault && (
          <button
            onClick={onSetDefault}
            className='text-xs text-muted-foreground hover:text-brand-green transition-colors underline underline-offset-2'
          >
            {t('address.setDefault')}
          </button>
        )}

        <div className='flex items-center gap-1 ml-auto'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onEdit}
            className='h-7 px-2.5 text-xs hover:text-brand-green hover:bg-brand-green/10 gap-1.5'
          >
            <Pencil className='w-3 h-3' />
            {t('common.edit')}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                disabled={isDeleting}
                className='h-7 px-2.5 text-xs hover:text-destructive hover:bg-destructive/10 gap-1.5'
              >
                <Trash2 className='w-3 h-3' />
                {t('common.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('address.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('address.deleteDescription')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                >
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

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

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editTarget}
        onSave={handleSave}
      />
    </div>
  )
}
