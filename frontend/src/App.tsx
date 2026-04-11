import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import LayoutAdmin from '@/pages/admin/LayoutAdmin'
import ProtectedRoute from './routes/ProtectedRoute' // Đường dẫn của bạn
import DashboardHome from './pages/admin/dashboard/content/DashBoardHome'
import UserPage from './pages/admin/manage-user/page'
import AuthorPage from './pages/admin/manage-author/page'
import CategoryPage from './pages/admin/manage-category/page'
import SupplierPage from './pages/admin/manage-supplier/page'
import BookPage from './pages/admin/manage-book/page'
import ReceiptPage from './pages/admin/manage-receipt/page'
import OrderPage from './pages/admin/manage-order/page'

function App() {
  return (
    <>
      <Toaster
        richColors
        expand={false}
        position='bottom-right'
        duration={5000}
        visibleToasts={5}
        closeButton
      />
      <BrowserRouter>
        <Routes>
          {/* <Route path='*' element={<NotFound404 />} /> */}

          {/* =========================================
              PUBLIC ROUTES (Ai cũng vào được)
              ========================================= */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />

          {/* =========================================
              PROTECTED ROUTES DÀNH CHO USER BÌNH THƯỜNG
              ========================================= */}
          {/* Ví dụ: Admin hay User đều có thể xem Profile */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STAFF']} />}>
            {/* <Route path='/profile' element={<ProfilePage />} /> */}
            {/* <Route path='/cart' element={<CartPage />} /> */}
          </Route>

          {/* =========================================
              PROTECTED ROUTES CHỈ DÀNH CHO ADMIN
              ========================================= */}
          {/* Thêm allowedRoles={['ADMIN']} để gác cổng */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path='/dashboard' element={<LayoutAdmin />}>
              <Route index element={<DashboardHome />} />
              <Route path='users' element={<UserPage />} />
              <Route path='authors' element={<AuthorPage />} />
              <Route path='categories' element={<CategoryPage />} />
              <Route path='suppliers' element={<SupplierPage />} />
              <Route path='books' element={<BookPage />} />
              <Route path='receipts' element={<ReceiptPage />} />
              <Route path='orders' element={<OrderPage />} />
              {/* <Route path='brands' element={<BrandPage />} /> */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
