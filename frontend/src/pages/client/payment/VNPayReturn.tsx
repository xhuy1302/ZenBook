import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function VNPayReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode')
    const txnRef = searchParams.get('vnp_TxnRef') // Đây chính là Mã đơn hàng (VD: ZB-25042026-020)

    if (responseCode === '00') {
      // ✅ Thành công: Đẩy thẳng vào trang Success có sẵn của bạn cùng với Mã đơn hàng
      navigate(`/orders/success/${txnRef}`, { replace: true })
    } else {
      // ❌ Thất bại: Báo lỗi và đẩy về giỏ hàng
      toast.error('Thanh toán thất bại hoặc đã bị hủy.')
      navigate('/cart', { replace: true })
    }
  }, [navigate, searchParams])

  // Giao diện trạm trung chuyển (Chỉ hiện chớp nhoáng 0.1s nên làm đơn giản)
  return (
    <div className='flex items-center justify-center min-h-screen bg-[#f3f4f6]'>
      <div className='w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin'></div>
    </div>
  )
}
