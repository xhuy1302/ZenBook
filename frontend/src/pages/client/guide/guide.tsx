'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight, BookOpen, ShoppingCart, CreditCard, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const steps = [
  { id: 'step-1', title: '1. Tìm kiếm sách', icon: <BookOpen className='w-5 h-5' /> },
  { id: 'step-2', title: '2. Thêm vào giỏ hàng', icon: <ShoppingCart className='w-5 h-5' /> },
  { id: 'step-3', title: '3. Áp dụng mã giảm giá', icon: <Info className='w-5 h-5' /> },
  { id: 'step-4', title: '4. Thanh toán & Xác nhận', icon: <CreditCard className='w-5 h-5' /> }
]

export default function PurchaseGuide() {
  const [activeTab, setActiveTab] = useState('step-1')

  // Xử lý scroll để highlight mục lục
  useEffect(() => {
    const handleScroll = () => {
      const sections = steps.map((step) => document.getElementById(step.id))
      const scrollPosition = window.scrollY + 200

      sections.forEach((section) => {
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(section.id)
        }
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Breadcrumb */}
      <div className='bg-gray-50 border-b border-gray-200 py-3'>
        <div className='max-w-6xl mx-auto px-4 flex items-center gap-2 text-sm text-gray-500 font-medium'>
          <span>Trang chủ</span> <ChevronRight className='w-4 h-4' />
          <span className='text-brand-green'>Hướng dẫn mua hàng</span>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8'>
        {/* ─── Sidebar Mục lục (Sticky) ─── */}
        <aside className='md:w-1/4'>
          <div className='sticky top-24 bg-gray-50 rounded-2xl p-5 border border-gray-100'>
            <p className='font-black uppercase tracking-widest text-xs text-gray-400 mb-4'>
              Mục lục bài viết
            </p>
            <nav className='space-y-1'>
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => scrollTo(step.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3',
                    activeTab === step.id
                      ? 'bg-brand-green text-white shadow-md shadow-emerald-100'
                      : 'text-gray-600 hover:bg-white hover:text-brand-green'
                  )}
                >
                  {step.icon}
                  {step.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ─── Nội dung chính ─── */}
        <main className='md:w-3/4 space-y-12'>
          <header className='space-y-4'>
            <h1 className='text-3xl md:text-4xl font-black text-gray-900 leading-tight'>
              Cách mua sách trên ZenBook nhanh chóng và nhận ưu đãi Flash Sale
            </h1>
            <p className='text-gray-500 leading-relaxed italic border-l-4 border-brand-green pl-4'>
              Bạn là người mới tại ZenBook? Đừng lo, bài viết này sẽ hướng dẫn bạn từng bước để sở
              hữu những cuốn sách hay với mức giá ưu đãi nhất từ các chương trình khuyến mãi của
              chúng tôi.
            </p>
          </header>

          {/* Bước 1 */}
          <section id='step-1' className='scroll-mt-24 space-y-4'>
            <h2 className='text-2xl font-extrabold text-gray-800 flex items-center gap-2'>
              <span className='bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>
                1
              </span>
              Tìm kiếm cuốn sách bạn yêu thích
            </h2>
            <p className='text-gray-600 leading-relaxed'>
              Bạn có thể sử dụng thanh tìm kiếm ở đầu trang để nhập tên sách, tác giả hoặc ISBN.
              Ngoài ra, hãy khám phá danh mục sách phong phú của ZenBook từ <strong>Văn học</strong>{' '}
              đến <strong>Kỹ năng sống</strong>.
            </p>
            <div className='bg-gray-100 rounded-2xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300'>
              <span className='text-gray-400 font-medium'>
                [Ảnh minh họa: Thanh tìm kiếm & Danh mục]
              </span>
            </div>
          </section>

          {/* Bước 2 */}
          <section id='step-2' className='scroll-mt-24 space-y-4'>
            <h2 className='text-2xl font-extrabold text-gray-800 flex items-center gap-2'>
              <span className='bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>
                2
              </span>
              Kiểm tra thông tin & Thêm vào giỏ hàng
            </h2>
            <p className='text-gray-600 leading-relaxed'>
              Nhấn vào cuốn sách để xem chi tiết. Tại đây, bạn có thể xem{' '}
              <strong>giá đã giảm (Flash Sale)</strong>, đánh giá từ người dùng khác và số lượng tồn
              kho. Nếu đã ưng ý, nhấn{' '}
              <span className='font-bold text-brand-red'>"Thêm vào giỏ hàng"</span>.
            </p>
            <div className='bg-gray-100 rounded-2xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300'>
              <span className='text-gray-400 font-medium'>
                [Ảnh minh họa: Nút Thêm vào giỏ hàng]
              </span>
            </div>
          </section>

          {/* Bước 3 */}
          <section id='step-3' className='scroll-mt-24 space-y-4'>
            <h2 className='text-2xl font-extrabold text-gray-800 flex items-center gap-2'>
              <span className='bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>
                3
              </span>
              Áp dụng mã giảm giá (Nếu có)
            </h2>
            <div className='bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-3'>
              <p className='text-emerald-800 font-bold flex items-center gap-2 italic'>
                <Zap className='w-4 h-4 fill-emerald-500 text-emerald-500' /> Mẹo tiết kiệm cho Huy:
              </p>
              <p className='text-emerald-700 text-sm'>
                Đừng quên kiểm tra các chương trình <strong>Flash Sale</strong> đang diễn ra. Nếu
                cuốn sách của bạn nằm trong khung giờ vàng, hệ thống sẽ tự động áp dụng mức giá tốt
                nhất!
              </p>
            </div>
            <p className='text-gray-600'>
              Tại trang giỏ hàng, hãy nhập mã Voucher của bạn vào ô "Mã giảm giá" để hưởng thêm ưu
              đãi nhé.
            </p>
          </section>

          {/* Bước 4 */}
          <section id='step-4' className='scroll-mt-24 space-y-4'>
            <h2 className='text-2xl font-extrabold text-gray-800 flex items-center gap-2'>
              <span className='bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>
                4
              </span>
              Thanh toán & Xác nhận đơn hàng
            </h2>
            <p className='text-gray-600 leading-relaxed'>
              Điền địa chỉ nhận hàng và chọn phương thức thanh toán (COD, Chuyển khoản, hoặc Ví điện
              tử). Nhấn <strong>"Đặt hàng"</strong> để hoàn tất.
            </p>
            <div className='flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100'>
              <CheckCircle className='w-12 h-12 text-brand-green shrink-0' />
              <div>
                <p className='font-black text-gray-900'>Chúc mừng!</p>
                <p className='text-gray-500 text-sm'>
                  Bạn đã đặt hàng thành công. ZenBook sẽ gửi thông báo qua Email của bạn.
                </p>
              </div>
            </div>
          </section>

          <hr className='border-gray-100' />

          {/* Footer nội dung */}
          <div className='bg-gray-900 text-white p-8 rounded-3xl space-y-4'>
            <h3 className='text-xl font-black'>Cần hỗ trợ thêm?</h3>
            <p className='text-gray-400 text-sm'>
              Đội ngũ hỗ trợ khách hàng của ZenBook luôn sẵn sàng giúp bạn 24/7 qua Hotline hoặc
              Chatbot tích hợp AI.
            </p>
            <Button className='bg-brand-green hover:bg-emerald-600 text-white font-bold rounded-full px-8'>
              Liên hệ ngay
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}

function Zap({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='none' className={className}>
      <path
        d='M13 2L4.09 12.11c-.37.41-.09 1.04.46 1.04H11l-1 8.45c-.07.54.52.86.93.52L20 12.89c.37-.41.09-1.04-.46-1.04H13l1-8.45c.07-.54-.52-.86-.93-.52z'
        fill='currentColor'
      />
    </svg>
  )
}
