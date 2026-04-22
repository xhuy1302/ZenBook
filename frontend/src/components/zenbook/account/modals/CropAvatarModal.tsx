// Đường dẫn: src/components/zenbook/account/modals/CropAvatarModal.tsx

import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop' // 👉 1. Import type Area từ thư viện
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
import { toast } from 'sonner' // 👉 Thêm toast để báo lỗi mượt hơn thay vì chỉ console.error

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

  // 👉 2. Thay <any> bằng <Area | null>
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  // 👉 3. Khai báo kiểu Area cho 2 tham số
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
      // Trong TS, lỗi ở catch mặc định là unknown
      // 👉 4. Xử lý lỗi chuẩn TypeScript thay vì console.error(e) trực tiếp
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
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa ảnh đại diện</DialogTitle>
        </DialogHeader>

        {imageSrc ? (
          <div className='relative w-full h-[300px] bg-black/5 rounded-md overflow-hidden my-4'>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // Ép tỉ lệ 1:1 (hình vuông)
              cropShape='round' // Hiện vùng cắt hình tròn cho trực quan
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
            />
          </div>
        ) : (
          <div className='h-[300px] flex items-center justify-center'>Chưa có ảnh</div>
        )}

        {/* Thanh điều khiển Zoom */}
        <div className='flex items-center gap-3 px-4'>
          <ZoomOut className='w-4 h-4 text-muted-foreground' />
          <input
            type='range'
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-green'
          />
          <ZoomIn className='w-4 h-4 text-muted-foreground' />
        </div>

        <DialogFooter className='mt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isCropping}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCropping}
            className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground'
          >
            {isCropping ? 'Đang xử lý...' : 'Xác nhận & Tải lên'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
