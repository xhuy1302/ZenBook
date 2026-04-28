'use client'

import React, { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react'
import { FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Giả lập gửi mail
    setTimeout(() => {
      setLoading(false)
      alert('Cảm ơn Huy! Tin nhắn của bạn đã được gửi đi.')
    }, 1500)
  }

  return (
    <div className='min-h-screen bg-white pb-20'>
      {/* ─── Header Section ─── */}
      <div className='bg-emerald-50 py-16 border-b border-emerald-100'>
        <div className='max-w-6xl mx-auto px-4 text-center space-y-4'>
          <h1 className='text-4xl md:text-5xl font-black text-gray-900 tracking-tight'>
            Liên hệ với <span className='text-brand-green'>ZenBook</span>
          </h1>
          <p className='text-gray-600 max-w-2xl mx-auto font-medium'>
            Chúng mình luôn lắng nghe ý kiến từ bạn. Dù là thắc mắc về đơn hàng hay góp ý về sách,
            đội ngũ ZenBook sẽ phản hồi bạn sớm nhất có thể.
          </p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 -mt-12'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* ─── Cột 1 & 2: Thông tin & Bản đồ ─── */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Contact Cards Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <ContactInfoCard
                icon={<MapPin className='text-emerald-600' />}
                title='Địa chỉ'
                content='298 Cầu Diễn, Bắc Từ Liêm, Hà Nội (HAUI)'
              />
              <ContactInfoCard
                icon={<Phone className='text-emerald-600' />}
                title='Hotline'
                content='1900 1234 - 0987 654 321'
              />
              <ContactInfoCard
                icon={<Mail className='text-emerald-600' />}
                title='Email'
                content='support@zenbook.vn'
              />
              <ContactInfoCard
                icon={<Clock className='text-emerald-600' />}
                title='Giờ làm việc'
                content='08:00 - 21:00 (Thứ 2 - Chủ Nhật)'
              />
            </div>

            {/* Google Map Placeholder */}
            <div className='rounded-3xl overflow-hidden border border-gray-200 h-[400px] shadow-sm relative group'>
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924158145263!2d105.732527275855!3d21.035722180614486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b991d80fd5%3A0x530c00ff25248fc!2zSGFub2kgVW5pdmVyc2l0eSBvZiBJbmR1c3RyeQ!5e0!3m2!1sen!2s!4v1714260000000!5m2!1sen!2s'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
              ></iframe>
            </div>
          </div>

          {/* ─── Cột 3: Form liên hệ ─── */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-emerald-100/50 sticky top-24'>
              <h3 className='text-2xl font-black text-gray-900 mb-6 flex items-center gap-2'>
                Gửi tin nhắn <MessageSquare className='w-6 h-6 text-brand-green' />
              </h3>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase text-gray-400 ml-1'>
                    Họ và tên
                  </label>
                  <Input
                    placeholder='Vũ Xuân Huy'
                    required
                    className='rounded-xl border-gray-200 focus:border-brand-green focus:ring-brand-green'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase text-gray-400 ml-1'>
                    Email liên hệ
                  </label>
                  <Input
                    type='email'
                    placeholder='huy@example.com'
                    required
                    className='rounded-xl border-gray-200 focus:border-brand-green focus:ring-brand-green'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase text-gray-400 ml-1'>
                    Vấn đề cần hỗ trợ
                  </label>
                  <Input
                    placeholder='Hỏi về đơn hàng, góp ý...'
                    required
                    className='rounded-xl border-gray-200 focus:border-brand-green focus:ring-brand-green'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase text-gray-400 ml-1'>
                    Nội dung chi tiết
                  </label>
                  <Textarea
                    placeholder='Nhập nội dung tin nhắn của bạn tại đây...'
                    className='min-h-[120px] rounded-xl border-gray-200 focus:border-brand-green focus:ring-brand-green'
                    required
                  />
                </div>

                <Button
                  disabled={loading}
                  className='w-full bg-brand-green hover:bg-emerald-600 text-white font-black py-6 rounded-xl transition-all shadow-lg shadow-emerald-200'
                >
                  {loading ? (
                    'ĐANG GỬI...'
                  ) : (
                    <>
                      GỬI YÊU CẦU <Send className='w-4 h-4 ml-2' />
                    </>
                  )}
                </Button>
              </form>

              {/* Social Links */}
              <div className='mt-8 pt-8 border-t border-gray-100'>
                <p className='text-center text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest'>
                  Theo dõi ZenBook
                </p>
                <div className='flex justify-center gap-6'>
                  <SocialIcon icon={<FaFacebook />} color='hover:text-blue-600' />
                  <SocialIcon icon={<FaInstagram />} color='hover:text-pink-600' />
                  <SocialIcon icon={<FaYoutube />} color='hover:text-red-600' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── AI Chatbot Call-to-action ─── */}
      <div className='max-w-6xl mx-auto px-4 mt-20'>
        <div className='bg-gray-900 rounded-[2rem] p-8 md:p-12 overflow-hidden relative group'>
          <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity'>
            <MessageSquare size={200} />
          </div>
          <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-8'>
            <div className='space-y-4 text-center md:text-left'>
              <span className='bg-brand-green text-white text-[10px] font-black uppercase px-3 py-1 rounded-full'>
                Tính năng mới
              </span>
              <h2 className='text-3xl font-black text-white'>Bạn muốn được giải đáp tức thì?</h2>
              <p className='text-gray-400 max-w-md'>
                Hãy thử trò chuyện với <strong>ZenBot</strong> - Trợ lý ảo AI của chúng mình để được
                hỗ trợ 24/7 về mọi đầu sách.
              </p>
            </div>
            <Button className='bg-white text-gray-900 hover:bg-emerald-400 hover:text-white font-black px-10 py-7 rounded-2xl text-lg transition-all active:scale-95 shadow-2xl'>
              TRÒ CHUYỆN VỚI AI
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ContactInfoCard({
  icon,
  title,
  content
}: {
  icon: React.ReactNode
  title: string
  content: string
}) {
  return (
    <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transition-all hover:border-emerald-200 hover:shadow-md'>
      <div className='p-3 bg-emerald-50 rounded-xl'>{icon}</div>
      <div>
        <p className='text-sm font-black text-gray-900 uppercase tracking-wide'>{title}</p>
        <p className='text-gray-500 text-sm mt-1 font-medium'>{content}</p>
      </div>
    </div>
  )
}

function SocialIcon({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <a href='#' className={cn('text-gray-400 transition-colors', color)}>
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </a>
  )
}
