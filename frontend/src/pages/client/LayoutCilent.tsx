import Header from '@/components/zenbook/homepage/Header'
import Footer from '@/components/zenbook/homepage/Footer'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// 👉 IMPORT COMPONENT MỚI THAY CHO ChatWidget
import SupportChat from '@/components/support-chat/SupportChat'

export default function ClientLayout() {
  // Lấy thông tin user hiện tại từ Context
  const { user } = useAuth()

  // Tạo một user fallback nếu khách chưa đăng nhập
  // Nhờ id là chuỗi rỗng (''), hệ thống chat 1-1 sẽ tự chặn việc gọi API/WebSocket
  const chatUser = user || {
    id: '',
    username: 'Khách Vãng Lai',
    roles: []
  }

  return (
    <div className='flex min-h-screen flex-col bg-slate-50'>
      {/* Header luôn nằm trên cùng */}
      <Header />

      {/* Phần main chứa nội dung các trang con (Trang chủ, Chi tiết SP...) */}
      <main className='flex-1 pb-8 pt-4 relative'>
        {/* 👉 ĐẶT SUPPORT CHAT Ở ĐÂY */}
        {/* Do SupportChat dùng class fixed bottom-6 right-6 nên đặt ở đâu trong layout cũng được */}
        <SupportChat currentUser={chatUser} />

        <Outlet />
      </main>

      {/* Footer luôn nằm dưới cùng */}
      <Footer />
    </div>
  )
}
