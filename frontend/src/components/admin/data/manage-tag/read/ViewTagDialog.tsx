import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { TagResponse } from '@/services/tag/tag.type'
import { useTranslation } from 'react-i18next'
import { Calendar, Tag as TagIcon, AlignLeft } from 'lucide-react'

interface ViewTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: TagResponse
}

export function ViewTagDialog({ open, onOpenChange, tag }: ViewTagDialogProps) {
  const { t } = useTranslation('tag')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0 overflow-hidden bg-background'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-border/50'>
          <DialogTitle className='text-xl font-semibold'>
            {t('dialogTitle.view', 'Chi tiết Nhãn')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col md:flex-row max-h-[80vh] overflow-y-auto'>
          {/* CỘT TRÁI: Icon Tag, Tên, Slug */}
          <div className='w-full md:w-1/3 bg-muted/30 p-8 flex flex-col items-center border-r border-border/50'>
            <div
              className='h-24 w-24 rounded-2xl border-4 border-background shadow-lg flex items-center justify-center mb-4'
              style={{ backgroundColor: tag.color || '#e5e7eb' }}
            >
              <TagIcon className='w-10 h-10 text-white drop-shadow-md' />
            </div>

            <div className='text-center space-y-2 w-full'>
              <h2 className='text-xl font-bold tracking-tight text-foreground truncate px-2'>
                {tag.name}
              </h2>
              <p className='text-sm text-muted-foreground truncate'>/{tag.slug}</p>
            </div>

            <Separator className='my-6' />

            <div className='flex flex-col items-center gap-4 w-full'>
              <div className='space-y-1.5 text-center w-full'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('table.columns.color', 'Màu sắc')}
                </Label>
                <div className='flex justify-center items-center gap-2'>
                  <span className='font-mono font-medium uppercase'>{tag.color || 'MẶC ĐỊNH'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin chi tiết */}
          <div className='w-full md:w-2/3 p-8 space-y-8 bg-background'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <AlignLeft className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                  {t('sections.general', 'Thông tin chung')}
                </h3>
              </div>

              <div className='grid grid-cols-1 gap-6 pt-2'>
                <InfoCardField
                  label={t('table.columns.description', 'Mô tả')}
                  value={tag.description}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <Calendar className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                  {t('sections.system', 'Thông tin hệ thống')}
                </h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
                <InfoCardField
                  label={t('table.columns.createdAt', 'Ngày tạo')}
                  value={new Date(tag.createdAt).toLocaleString('vi-VN')}
                  icon={<Calendar className='w-4 h-4 text-muted-foreground' />}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end gap-3'>
          <Button variant='default' onClick={() => onOpenChange(false)} className='w-28'>
            {t('actions.close', 'Đóng')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCardField({
  label,
  value,
  icon
}: {
  label: string
  value?: string | null
  icon?: React.ReactNode
}) {
  return (
    <div className='space-y-1.5 p-3 rounded-lg bg-muted/10 border border-border/30 hover:bg-muted/30 transition-colors'>
      <div className='flex items-center gap-1.5'>
        {icon}
        <Label className='text-xs text-muted-foreground font-medium'>{label}</Label>
      </div>
      <p className='text-sm font-semibold text-foreground pl-0 md:pl-0'>{value || '—'}</p>
    </div>
  )
}
