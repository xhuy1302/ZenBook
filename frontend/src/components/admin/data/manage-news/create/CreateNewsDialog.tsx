// CreateNewsButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CreateNewsButtonProps {
  onClick: () => void // Thêm prop onClick
}

export function CreateNewsButton({ onClick }: CreateNewsButtonProps) {
  const { t } = useTranslation('news')

  return (
    <Button
      onClick={onClick} // Gọi prop onClick khi nhấn nút
      className='gap-2 rounded-xl font-semibold shadow-md shadow-indigo-200 border-0 text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]'
      style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
    >
      <Plus className='h-4 w-4' />
      {t('actions.create')}
    </Button>
  )
}
