import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ShieldCheck, Copy, Loader2 } from 'lucide-react'

interface TwoFactorSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
}

export default function TwoFactorSetupModal({
  open,
  onOpenChange,
  userEmail = 'zenbook@gmail.com'
}: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Demo Secret Key (Sau này Backend sẽ sinh ra chuỗi này thật)
  const secretKey = 'JBSWY3DPEHPK3PXP'
  // API tạo ảnh QR Demo từ Google Chart
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/ZenBook:${userEmail}?secret=${secretKey}&issuer=ZenBook`

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey)
    toast.success('Đã sao chép mã bảo mật!')
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số')
      return
    }

    setIsVerifying(true)
    try {
      // TODO: Thay bằng API xác thực 2FA thật (ví dụ: verify2FaApi(code))
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success('Đã bật Xác thực 2 lớp thành công!')
      setStep(1)
      setCode('')
      onOpenChange(false)
    } catch {
      toast.error('Mã xác thực không chính xác!')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) setStep(1)
        setCode('')
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green'>
              <ShieldCheck className='w-5 h-5' />
            </div>
            <DialogTitle className='text-xl'>Bật Xác thực 2 lớp (2FA)</DialogTitle>
          </div>
          <DialogDescription>
            {step === 1
              ? 'Sử dụng ứng dụng Google Authenticator hoặc Authy để quét mã QR dưới đây.'
              : 'Nhập mã gồm 6 chữ số từ ứng dụng xác thực của bạn để hoàn tất.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className='flex flex-col items-center space-y-6 py-4'>
            <div className='p-3 bg-white border border-border rounded-xl shadow-sm'>
              <img src={qrUrl} alt='QR Code 2FA' className='w-40 h-40' />
            </div>

            <div className='w-full space-y-2 text-center'>
              <p className='text-sm text-muted-foreground'>Hoặc nhập mã này thủ công:</p>
              <div className='flex items-center justify-center gap-2'>
                <code className='px-3 py-1.5 bg-muted rounded-md font-mono text-sm font-bold tracking-widest'>
                  {secretKey}
                </code>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleCopy}
                  className='h-8 w-8 text-muted-foreground hover:text-brand-green'
                >
                  <Copy className='w-4 h-4' />
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              className='w-full bg-brand-green hover:bg-brand-green-dark'
            >
              Tiếp tục
            </Button>
          </div>
        ) : (
          <div className='space-y-6 py-4'>
            <div className='space-y-2'>
              <Label>Mã xác thực (6 số)</Label>
              <Input
                type='text'
                maxLength={6}
                placeholder='000000'
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className='text-center text-2xl tracking-[0.5em] h-12 focus-visible:ring-brand-green/40 font-mono'
              />
            </div>
            <div className='flex gap-3'>
              <Button type='button' variant='outline' onClick={() => setStep(1)} className='w-full'>
                Quay lại
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isVerifying || code.length !== 6}
                className='w-full bg-brand-green hover:bg-brand-green-dark'
              >
                {isVerifying ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' /> Đang kiểm tra...
                  </>
                ) : (
                  'Xác nhận'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
