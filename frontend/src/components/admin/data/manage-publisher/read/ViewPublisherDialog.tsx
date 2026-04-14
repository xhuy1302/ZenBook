import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { PublisherResponse } from '@/services/publisher/publisher.type'
import { useTranslation } from 'react-i18next'
import { PublisherStatusBadge } from '../PublisherStatusBadges'
import { Building2, Mail, Phone, MapPin, Globe, CreditCard } from 'lucide-react'

interface ViewPublisherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publisher: PublisherResponse
}

export function ViewPublisherDialog({ open, onOpenChange, publisher }: ViewPublisherDialogProps) {
  const { t } = useTranslation('publisher')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0 overflow-hidden bg-background'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b'>
          <DialogTitle className='text-xl font-semibold'>{t('dialogTitle.view')}</DialogTitle>
        </DialogHeader>

        <div className='p-6 space-y-6 max-h-[75vh] overflow-y-auto'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-2xl font-bold text-foreground'>{publisher.name}</h2>
              <div className='flex items-center gap-2 mt-2'>
                <PublisherStatusBadge status={publisher.status} />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <InfoField
              label={t('fields.contactName.label')}
              value={publisher.contactName}
              icon={<Building2 className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.taxCode.label')}
              value={publisher.taxCode}
              icon={<CreditCard className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.phone.label')}
              value={publisher.phone}
              icon={<Phone className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.email.label')}
              value={publisher.email}
              icon={<Mail className='w-4 h-4' />}
            />
            <InfoField
              label={t('fields.website.label')}
              value={publisher.website}
              icon={<Globe className='w-4 h-4' />}
            />
            <div className='md:col-span-2'>
              <InfoField
                label={t('fields.address.label')}
                value={publisher.address}
                icon={<MapPin className='w-4 h-4' />}
              />
            </div>
          </div>

          {publisher.description && (
            <div className='space-y-1.5 p-3 rounded-lg bg-muted/10 border'>
              <Label className='text-xs text-muted-foreground font-medium'>
                {t('fields.description.label')}
              </Label>
              <p className='text-sm text-foreground whitespace-pre-wrap'>{publisher.description}</p>
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
