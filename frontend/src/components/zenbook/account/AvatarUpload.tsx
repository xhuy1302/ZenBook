// ─────────────────────────────────────────────────────────────────────────────
// components/account/AvatarUpload.tsx
// Clickable avatar with hover-edit overlay + lazy preview + upload mutation
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { uploadCustomerAvatarApi } from '@/services/customer/customer.api'

interface AvatarUploadProps {
  avatarUrl?: string
  fullName?: string
  size?: number
}

function getInitials(name?: string) {
  if (!name) return '?'
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AvatarUpload({ avatarUrl, fullName, size = 80 }: AvatarUploadProps) {
  const { t } = useTranslation('account')
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState<string | null>(null)

  const { mutate: upload, isPending } = useMutation({
    mutationFn: uploadCustomerAvatarApi,
    onSuccess: (data) => {
      toast.success(t('avatar.uploadSuccess'))
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setPreview(null)
      queryClient.setQueryData<{ avatarUrl?: string }>(['profile'], (old) =>
        old ? { ...old, avatarUrl: data.avatarUrl } : old
      )
    },
    onError: () => {
      toast.error(t('avatar.uploadError'))
      setPreview(null)
    }
  })

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toast.error(t('avatar.invalidType'))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('avatar.maxSize'))
        return
      }

      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      upload(file)
      e.target.value = ''
    },
    [upload, t]
  )

  const currentSrc = preview ?? avatarUrl

  return (
    <div className='relative group inline-block' style={{ width: size, height: size }}>
      <div
        className='w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md bg-brand-green flex items-center justify-center cursor-pointer transition-all duration-200 group-hover:brightness-75'
        onClick={() => !isPending && inputRef.current?.click()}
        style={{ width: size, height: size }}
      >
        {currentSrc ? (
          <img
            src={currentSrc}
            alt='Avatar'
            className='w-full h-full object-cover'
            loading='lazy'
          />
        ) : (
          <span
            className='text-primary-foreground font-bold select-none'
            style={{ fontSize: size * 0.3 }}
          >
            {getInitials(fullName)}
          </span>
        )}
      </div>

      <div
        className='absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer'
        onClick={() => !isPending && inputRef.current?.click()}
      >
        {isPending ? (
          <Loader2
            className='text-white animate-spin'
            style={{ width: size * 0.3, height: size * 0.3 }}
          />
        ) : (
          <Camera
            className='text-white drop-shadow'
            style={{ width: size * 0.28, height: size * 0.28 }}
          />
        )}
      </div>

      {!isPending && (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors'
          aria-label={t('avatar.change')}
        >
          <Camera className='w-3.5 h-3.5 text-muted-foreground' />
        </button>
      )}

      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  )
}
