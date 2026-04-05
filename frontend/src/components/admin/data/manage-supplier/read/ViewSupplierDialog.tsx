import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { SupplierResponse } from '@/services/supplier/supplier.type'
import { useTranslation } from 'react-i18next'
import { SupplierStatusBadge } from '../SupplierStatusBadges'
import { Building2, Mail, Phone, MapPin, Globe, CreditCard } from 'lucide-react'

interface ViewSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: SupplierResponse
}

export function ViewSupplierDialog({ open, onOpenChange, supplier }: ViewSupplierDialogProps) {
  // Lấy hàm t ra để sử dụng đa ngôn ngữ
  const { t } = useTranslation('supplier')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0 overflow-hidden bg-background'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b'>
          {/* Đã thay text cứng thành t('...') */}
          <DialogTitle className='text-xl font-semibold'>{t('dialogTitle.view')}</DialogTitle>
        </DialogHeader>

        <div className='p-6 space-y-6 max-h-[75vh] overflow-y-auto'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-2xl font-bold text-foreground'>{supplier.name}</h2>
              <div className='flex items-center gap-2 mt-2'>
                <SupplierStatusBadge status={supplier.status} />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <InfoField
              label={t('fields.contactName.label')}
              value={supplier.contactName}
              icon={<Building2 className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.taxCode.label')}
              value={supplier.taxCode}
              icon={<CreditCard className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.phone.label')}
              value={supplier.phone}
              icon={<Phone className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.email.label')}
              value={supplier.email}
              icon={<Mail className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.website.label')}
              value={supplier.website}
              icon={<Globe className='w-4 h-4' />}
            />
            <div className='md:col-span-2'>
              <InfoField
                label={t('fields.address.label')}
                value={supplier.address}
                icon={<MapPin className='w-4 h-4' />}
              />
            </div>
          </div>

          {supplier.description && (
            <div className='space-y-1.5 p-3 rounded-lg bg-muted/10 border'>
              <Label className='text-xs text-muted-foreground font-medium'>
                {t('fields.description.label')}
              </Label>
              <p className='text-sm text-foreground whitespace-pre-wrap'>{supplier.description}</p>
            </div>
          )}
        </div>

        <div className='px-6 py-4 bg-muted/20 border-t flex justify-end'>
          <Button onClick={() => onOpenChange(false)}>{t('actions.close')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoField({
  label,
  value,
  icon
}: {
  label: string
  value?: string | null
  icon: React.ReactNode
}) {
  return (
    <div className='space-y-1.5 p-3 rounded-lg bg-muted/10 border hover:bg-muted/30 transition-colors'>
      <div className='flex items-center gap-1.5 text-muted-foreground'>
        {icon} <Label className='text-xs font-medium'>{label}</Label>
      </div>
      <p className='text-sm font-semibold text-foreground truncate'>{value || '—'}</p>
    </div>
  )
}
