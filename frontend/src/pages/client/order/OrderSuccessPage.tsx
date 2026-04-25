import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, FileText, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  // Lấy ID đơn hàng từ URL (vd: /orders/success/:id)
  const { id } = useParams()

  useEffect(() => {
    window.scrollTo(0, 0)

    // 👉 ĐÃ SỬA LỖI LẶP VÔ TẬN: Gắn key với id của đơn hàng
    if (id) {
      const reloadKey = `zenbook_reloaded_success_${id}`
      const hasReloaded = sessionStorage.getItem(reloadKey)

      if (!hasReloaded) {
        // Đánh dấu là đã reload cho ĐƠN HÀNG NÀY
        sessionStorage.setItem(reloadKey, 'true')
        // F5 tải lại trang
        window.location.reload()
      }
      // Tuyệt đối KHÔNG gọi removeItem ở đây nữa để tránh React StrictMode chạy lại
    }
  }, [id]) // Thêm id vào dependency array

  return (
    <main className='min-h-screen bg-[#f3f4f6] flex items-center justify-center py-12 px-4'>
      <div className='max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center'>
        {/* ── Icon Success Animation ── */}
        <div className='flex justify-center mb-5'>
          <div className='relative'>
            <div className='absolute inset-0 bg-brand-green/20 rounded-full animate-ping opacity-75'></div>
            <CheckCircle2
              className='w-16 h-16 text-brand-green relative z-10 bg-white rounded-full'
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* ── Lời cảm ơn ── */}
        <h1 className='text-xl md:text-2xl font-bold text-zinc-900 mb-2'>Đặt hàng thành công!</h1>
        <p className='text-sm text-gray-600 mb-6 leading-relaxed'>
          Cảm ơn bạn đã tin tưởng và mua sắm tại{' '}
          <span className='font-semibold text-brand-green'>ZenBook</span>. Đơn hàng của bạn đang
          được chúng tôi xử lý.
        </p>

        {/* ── Thông tin tóm tắt mã đơn ── */}
        <div className='bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100'>
          <p className='text-xs text-gray-500 mb-1'>Mã đơn hàng của bạn</p>
          <p className='text-lg font-bold text-zinc-900 uppercase tracking-wider'>
            #{id || 'ZEN-UNKNOWN'}
          </p>

          <div className='flex items-center justify-center gap-2 mt-3 text-xs text-gray-600'>
            <Mail className='w-3.5 h-3.5 text-gray-400' />
            <span>Xác nhận đơn hàng đã được gửi tới email của bạn.</span>
          </div>
        </div>

        {/* ── Nút điều hướng (Call to Action) ── */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {/* Nút Xem chi tiết đơn hàng */}
          <Button
            type='button'
            variant='outline'
            className='h-11 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-brand-green font-medium'
            onClick={() => navigate(`/customer/orders/${id}`)}
          >
            <FileText className='w-4 h-4 mr-2' />
            Xem chi tiết đơn hàng
          </Button>

          {/* Nút Tiếp tục mua sắm (Khuyến khích Action này) */}
          <Button
            type='button'
            className='h-11 text-sm bg-brand-green hover:bg-brand-green-dark text-white font-medium shadow-sm'
            onClick={() => navigate('/products')}
          >
            <ShoppingBag className='w-4 h-4 mr-2' />
            Tiếp tục mua sắm
          </Button>
        </div>

        {/* ── Link Hỗ trợ ── */}
        <div className='mt-6 pt-5 border-t border-gray-100'>
          <p className='text-xs text-gray-500'>
            Bạn cần hỗ trợ?{' '}
            <Link
              to='/contact'
              className='text-brand-green font-medium hover:underline inline-flex items-center'
            >
              Liên hệ với chúng tôi <ArrowRight className='w-3 h-3 ml-1' />
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
