import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getCroppedImg } from '@/utils/cropImage'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { toast } from 'sonner'

interface CropAvatarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  onCropComplete: (croppedFile: File) => void
}

export default function CropAvatarModal({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete
}: CropAvatarModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setIsCropping(true)
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 'avatar.jpg')
      onCropComplete(croppedFile)
      onOpenChange(false)
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(`Lỗi cắt ảnh: ${e.message}`)
      } else {
        toast.error('Đã xảy ra lỗi không xác định khi cắt ảnh')
      }
    } finally {
      setIsCropping(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Đã thêm z-[70] vào DialogContent để đè lên Header (z-[60]) */}
      <DialogContent className='sm:max-w-[500px] z-[70] rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-[18px]'>Chỉnh sửa ảnh đại diện</DialogTitle>
        </DialogHeader>

        {imageSrc ? (
          <div className='relative w-full h-[300px] bg-slate-50 rounded-xl overflow-hidden my-2 border border-slate-100'>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape='round'
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
            />
          </div>
        ) : (
          <div className='h-[300px] flex items-center justify-center text-slate-400 text-[13px]'>
            Chưa có ảnh
          </div>
        )}

        {/* Thanh điều khiển Zoom */}
        <div className='flex items-center gap-3 px-4 py-2'>
          <ZoomOut className='w-4 h-4 text-slate-500' />
          <input
            type='range'
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className='flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-green'
          />
          <ZoomIn className='w-4 h-4 text-slate-500' />
        </div>

        <DialogFooter className='mt-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isCropping}
            className='h-10 rounded-xl px-6 text-[13px] font-bold border-slate-200'
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCropping}
            className='bg-brand-green hover:bg-brand-green-dark text-white h-10 rounded-xl px-6 text-[13px] font-bold shadow-md shadow-brand-green/20'
          >
            {isCropping ? 'Đang xử lý...' : 'Xác nhận & Tải lên'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
