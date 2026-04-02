import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription, // Thêm cái này
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { CreateAuthorForm } from './CreateAuthorForm'
import { useTranslation } from 'react-i18next'

export function CreateAuthorDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('author')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Thêm title để hỗ trợ trải nghiệm người dùng */}
        <Button
          size='icon'
          className='h-9 w-9 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm'
          title={t('actions.add', 'Thêm tác giả')}
        >
          <Plus className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden shadow-2xl'>
        <DialogHeader className='px-6 pt-6 space-y-1'>
          <DialogTitle className='text-2xl font-bold tracking-tight'>
            {t('dialogTitle.create', 'Tạo tác giả mới')}
          </DialogTitle>
          {/* Thêm mô tả ngắn cho chuyên nghiệp */}
          <DialogDescription>
            {t(
              'dialogDescription.create',
              'Điền các thông tin dưới đây để thêm một tác giả mới vào hệ thống.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 pb-6 mt-4'>
          <CreateAuthorForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
