import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import LayoutAdmin from '@/pages/admin/LayoutAdmin'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardHome from './pages/admin/dashboard/content/DashBoardHome'
import UserPage from './pages/admin/manage-user/page'
import AuthorPage from './pages/admin/manage-author/page'

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
          {/* TODO: tạo các public route */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          {/* TODO: tạo protected route */}
          <Route element={<ProtectedRoute />}>
            {/* <Route path='/profile' element={<ProfilePage />} /> */}
            <Route path='/dashboard' element={<LayoutAdmin />}>
              <Route index element={<DashboardHome />} />
              <Route path='users' element={<UserPage />} />
              <Route path='authors' element={<AuthorPage />} />
              {/* <Route path='categories' element={<CategoryPage />} /> */}
              {/* <Route path='brands' element={<BrandPage />} /> */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
