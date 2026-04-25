import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Mỗi khi đường dẫn (URL) thay đổi, ép trình duyệt cuộn lên tọa độ (0, 0)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Dùng 'smooth' nếu muốn nó cuộn từ từ, nhưng 'instant' hợp lý hơn khi chuyển trang
    })
  }, [pathname])

  return null
}
