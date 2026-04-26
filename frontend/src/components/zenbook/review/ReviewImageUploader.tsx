// ============================================================
// ReviewImageUploader.tsx
// ============================================================
import { useRef, useState } from 'react'
import { Upload, X, ImagePlus, Loader2, AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useUploadReviewMedia } from '@/services/review/Usereview'

const MAX_FILES = 5
const MAX_SIZE_MB = 5

interface ReviewImageUploaderProps {
  urls: string[]
  onChange: (urls: string[]) => void
}

export default function ReviewImageUploader({ urls, onChange }: ReviewImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const { mutateAsync: upload, isPending } = useUploadReviewMedia()

  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    setErrors([])

    const remain = MAX_FILES - urls.length
    if (remain <= 0) return

    const fileArr = Array.from(files).slice(0, remain)

    const newErrors: string[] = []

    const validated = fileArr.filter((file) => {
      if (!file.type.startsWith('image/')) {
        newErrors.push(`${file.name}: Chỉ hỗ trợ file ảnh`)
        return false
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        newErrors.push(`${file.name}: Vượt quá ${MAX_SIZE_MB}MB`)
        return false
      }

      return true
    })

    if (newErrors.length) {
      setErrors(newErrors)
    }

    if (!validated.length) return

    try {
      /**
       * uploadReviewMediaApi trả về string URL
       */
      const uploadedUrls = await Promise.all(validated.map((file) => upload(file)))

      onChange([...urls, ...uploadedUrls])
    } catch {
      setErrors(['Upload thất bại. Vui lòng thử lại'])
    }
  }

  const removeUrl = (index: number) => {
    onChange(urls.filter((_, i) => i !== index))
  }

  return (
    <div className='flex flex-col gap-2'>
      {/* Preview */}
      {urls.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {urls.map((url, index) => (
            <div
              key={url}
              className='relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50'
            >
              <img src={url} alt='review' className='w-full h-full object-cover' />

              <button
                type='button'
                onClick={() => removeUrl(index)}
                className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl'
              >
                <X className='w-4 h-4 text-white' />
              </button>
            </div>
          ))}

          {urls.length < MAX_FILES && (
            <button
              type='button'
              disabled={isPending}
              onClick={() => inputRef.current?.click()}
              className='w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-brand-green hover:bg-brand-green/5 flex items-center justify-center transition'
            >
              {isPending ? (
                <Loader2 className='w-4 h-4 animate-spin text-slate-400' />
              ) : (
                <ImagePlus className='w-4 h-4 text-slate-400' />
              )}
            </button>
          )}
        </div>
      )}

      {/* Dropzone */}
      {urls.length === 0 && (
        <div
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200',
            dragging
              ? 'border-brand-green bg-brand-green/5 scale-[1.01]'
              : 'border-slate-200 bg-slate-50 hover:border-brand-green hover:bg-brand-green/5'
          )}
        >
          {isPending ? (
            <Loader2 className='w-6 h-6 animate-spin text-brand-green' />
          ) : (
            <Upload
              className={cn(
                'w-6 h-6 transition-colors',
                dragging ? 'text-brand-green' : 'text-slate-400'
              )}
            />
          )}

          <div className='text-center'>
            <p className='text-[13px] font-semibold text-slate-700'>
              {isPending ? 'Đang tải ảnh...' : 'Kéo & thả hoặc nhấn để chọn ảnh'}
            </p>

            <p className='text-[11px] text-slate-400 mt-1'>
              PNG, JPG, WEBP • tối đa {MAX_SIZE_MB}MB • {MAX_FILES} ảnh
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {errors.length > 0 && (
        <div className='space-y-1'>
          {errors.map((error, index) => (
            <div key={index} className='flex items-center gap-1.5 text-xs text-rose-600'>
              <AlertCircle className='w-3.5 h-3.5 shrink-0' />
              {error}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type='file'
        multiple
        accept='image/*'
        className='hidden'
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
