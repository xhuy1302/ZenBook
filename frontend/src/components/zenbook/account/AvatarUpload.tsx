import { useRef, useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { uploadCustomerAvatarApi } from '@/services/customer/customer.api'
import type { UserProfile } from '@/services/customer/customer.type'
import CropAvatarModal from './modals/CropAvatarModal'

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

export default function AvatarUpload({ avatarUrl, fullName, size = 88 }: AvatarUploadProps) {
  const { t } = useTranslation('account')
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  const { mutate: upload, isPending } = useMutation({
    mutationFn: uploadCustomerAvatarApi,
    onSuccess: (data: string | { avatarUrl?: string; data?: string }) => {
      const newAvatarUrl = typeof data === 'string' ? data : data?.avatarUrl || data?.data
      toast.success(t('avatar.uploadSuccess', 'Cập nhật ảnh thành công!'))

      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.setQueryData<UserProfile>(['profile'], (old) =>
        old ? { ...old, avatarUrl: newAvatarUrl as string } : old
      )
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['auth'] })

      window.dispatchEvent(new CustomEvent('onAvatarUpdated', { detail: newAvatarUrl }))
    },
    onError: () => {
      toast.error(t('avatar.uploadError', 'Có lỗi xảy ra khi tải ảnh lên!'))
    }
  })

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toast.error(t('avatar.invalidType', 'Định dạng ảnh không hợp lệ!'))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('avatar.maxSize', 'Kích thước ảnh tối đa 5MB!'))
        return
      }

      const reader = new FileReader()
      reader.onload = (ev) => {
        setImageToCrop(ev.target?.result as string)
        setModalOpen(true)
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    [t]
  )

  const handleCropComplete = (croppedFile: File) => {
    upload(croppedFile)
  }

  return (
    <>
      <div className='relative group inline-block' style={{ width: size, height: size }}>
        <div
          className='w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md bg-brand-green/90 flex items-center justify-center cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg'
          onClick={() => !isPending && inputRef.current?.click()}
          style={{ width: size, height: size }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt='Avatar'
              className='w-full h-full object-cover'
              loading='lazy'
            />
          ) : (
            <span
              className='text-white font-bold select-none tracking-wider'
              style={{ fontSize: size * 0.35 }}
            >
              {getInitials(fullName)}
            </span>
          )}
        </div>

        <div
          className='absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer'
          onClick={() => !isPending && inputRef.current?.click()}
        >
          {isPending ? (
            <Loader2
              className='text-white animate-spin'
              style={{ width: size * 0.3, height: size * 0.3 }}
            />
          ) : (
            <Camera
              className='text-white drop-shadow-md'
              style={{ width: size * 0.3, height: size * 0.3 }}
            />
          )}
        </div>

        {!isPending && (
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className='absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 hover:text-brand-green transition-colors text-slate-500 z-10'
          >
            <Camera className='w-4 h-4' />
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

      <CropAvatarModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </>
  )
}
