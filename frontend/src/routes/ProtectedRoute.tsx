import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext)
  const location = useLocation()

  // 1. CHECK CHƯA ĐĂNG NHẬP: Đá về trang login
  // (Lưu lại biến state để đăng nhập xong nó chuyển lại đúng trang đang định vào)
  if (!authContext || !authContext.user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  const { user } = authContext

  // 2. CHECK QUYỀN: Nếu trang yêu cầu quyền đặc biệt (VD: ADMIN)
  if (allowedRoles && allowedRoles.length > 0) {
    // Xem user có sở hữu quyền nào trong danh sách cho phép không
    const hasRequiredRole = user.roles.some((role: string) => allowedRoles.includes(role))

    if (!hasRequiredRole) {
      // Có đăng nhập nhưng KHÔNG ĐỦ QUYỀN -> Đá về trang báo lỗi 403
      return <Navigate to='/unauthorized' replace />
    }
  }

  // 3. HỢP LỆ -> Cho phép render nội dung trang con (Outlet)
  return <Outlet />
}

export default ProtectedRoute
