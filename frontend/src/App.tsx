import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from '@/context/AuthContext'

// LAYOUTS & ROUTES
import LayoutClient from '@/pages/client/LayoutCilent'
import LayoutAdmin from '@/pages/admin/LayoutAdmin'
import ProtectedRoute from './routes/ProtectedRoute'

// ERROR PAGES
import UnauthorizedPage from '@/pages/error/UnauthorizedPage'

// AUTH PAGES
import LoginPage from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'

// CLIENT PAGES
import HomePage from '@/pages/client/home/HomePage'
import AccountPage from '@/pages/client/customer/CustomerPage'
import CartPage from '@/pages/client/cart/CartPage'
import ProductListPage from '@/pages/client/product-list/ProductListPage'
import ProductDetailPage from '@/pages/client/product-detail/ProductDetailPage'
import ContactPage from './pages/client/contact/Contact'
import FlashSalePage from './pages/client/flashsale/FlashSalePage'
import WishListPage from './pages/client/wishlist/WishListPage'
import ZenBookVipPage from './pages/client/ZPoint/Zenbookmembership'
import BlogPage from './components/zenbook/blog/Blog'
import BlogDetailPage from './components/zenbook/blog/BlogDetail'
import CheckoutPage from '@/pages/client/checkout/CheckoutPage'
import OrderSuccessPage from './pages/client/order/OrderSuccessPage'
import GuidePage from './pages/client/guide/guide'
import VNPayReturn from './pages/client/payment/VNPayReturn'

// ADMIN PAGES
import DashboardHome from './pages/admin/dashboard/content/DashBoardHome'
import UserPage from './pages/admin/manage-user/page'
import AuthorPage from './pages/admin/manage-author/page'
import CategoryPage from './pages/admin/manage-category/page'
import PublisherPage from './pages/admin/manage-publisher/page'
import BookPage from './pages/admin/manage-book/page'
import ReceiptPage from './pages/admin/manage-receipt/page'
import OrderPage from './pages/admin/manage-order/page'
import PromotionPage from './pages/admin/manage-promotion/page'
import TagPage from './pages/admin/manage-tag/page'
import CouponPage from './pages/admin/manage-coupon/page'
import NewsPage from './pages/admin/manage-news/page'
import SuplierPage from './pages/admin/manage-supplier/page'
import ReviewPage from './pages/admin/manage-review/page'
import DemoPage from './pages/admin/dashboard/doanhthu/demo'
import AdminChatPage from '@/pages/admin/manage-chat/page'

// CHAT & COMPONENTS
import SupportChat from '@/components/support-chat/SupportChat'
import ProfileTab from '@/components/zenbook/account/Profiletab'
import OrdersTab from '@/components/zenbook/account/Orderstab'
import AddressTab from '@/components/zenbook/account/Addresstab'
import MyReview from '@/components/zenbook/account/MyReviews'
import OrderDetail from './components/zenbook/account/modals/OrderDetail'
import ScrollToTop from './components/common/ScrollToTop'

function App() {
  const { user, isAuthenticated } = useAuth()

  return (
    <>
      <Toaster
        richColors
        expand={true}
        position='bottom-right'
        duration={1500}
        visibleToasts={5}
        closeButton
      />
      <BrowserRouter>
        <ScrollToTop />

        {/* ==========================================================
            CHAT WIDGET (Chỉ hiện ở phía Client khi đã đăng nhập)
            ========================================================== */}
        {isAuthenticated && user && !window.location.pathname.startsWith('/dashboard') && (
          <SupportChat currentUser={user} />
        )}

        <Routes>
          {/* ==========================================================
              PUBLIC ROUTES (Không yêu cầu đăng nhập)
              ========================================================== */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/unauthorized' element={<UnauthorizedPage />} />

          {/* ==========================================================
              CLIENT LAYOUT (Giao diện Khách hàng)
              ========================================================== */}
          <Route element={<LayoutClient />}>
            {/* PUBLIC API: Ai cũng xem được */}
            <Route path='/' element={<HomePage />} />
            <Route path='/blog' element={<BlogPage />} />
            <Route path='/blog/:slug' element={<BlogDetailPage />} />
            <Route path='/flash-sale' element={<FlashSalePage />} />
            <Route path='/guide' element={<GuidePage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/products' element={<ProductListPage />} />
            <Route path='/search' element={<ProductListPage />} />
            <Route path='/products/:slug' element={<ProductDetailPage />} />
            <Route path='/zenbokvip' element={<ZenBookVipPage />} />

            {/* CUSTOMER API (Mua hàng & Thanh toán): CHỈ USER / ADMIN */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ROLE_USER', 'ROLE_ADMIN']} />
              }
            >
              <Route path='/cart' element={<CartPage />} />
              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path='/payment/vnpay-return' element={<VNPayReturn />} />
              <Route path='/orders/success/:orderCode' element={<OrderSuccessPage />} />
            </Route>

            {/* CUSTOMER API (Quản lý cá nhân & Yêu thích): USER / ADMIN / STAFF ĐỀU ĐƯỢC */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['USER', 'ADMIN', 'STAFF', 'ROLE_USER', 'ROLE_ADMIN', 'ROLE_STAFF']}
                />
              }
            >
              {/* Trang Wishlist được bảo vệ ở đây */}
              <Route path='/wishlist' element={<WishListPage />} />
              <Route path='/wish-list' element={<WishListPage />} />

              <Route path='/customer' element={<AccountPage />}>
                <Route index element={<ProfileTab />} />
                <Route path='orders' element={<OrdersTab />} />
                <Route path='orders/:orderCode' element={<OrderDetail />} />
                <Route path='address' element={<AddressTab />} />
                <Route path='myreviews' element={<MyReview />} />
              </Route>
            </Route>
          </Route>

          {/* ==========================================================
              ADMIN & STAFF DASHBOARD (Giao diện Quản trị)
              ========================================================== */}
          <Route
            path='/dashboard'
            element={
              // 👉 Khóa layout tổng: Chỉ ADMIN hoặc STAFF mới được vào khu vực này
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'ROLE_ADMIN', 'ROLE_STAFF']}>
                <LayoutAdmin />
              </ProtectedRoute>
            }
          >
            {/* GROUP 1: ADMIN ONLY (STAFF vào sẽ bị đá sang trang 403) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']} />}>
              <Route index element={<DashboardHome />} />
              <Route path='suppliers' element={<SuplierPage />} />
              <Route path='promotions' element={<PromotionPage />} />
              <Route path='coupons' element={<CouponPage />} />
              <Route path='demo' element={<DemoPage />} />
            </Route>

            {/* GROUP 2: SHARED STAFF & ADMIN (Nghiệp vụ vận hành lõi) */}
            <Route path='users' element={<UserPage />} />
            <Route path='authors' element={<AuthorPage />} />
            <Route path='categories' element={<CategoryPage />} />
            <Route path='publishers' element={<PublisherPage />} />
            <Route path='books' element={<BookPage />} />
            <Route path='receipts' element={<ReceiptPage />} />
            <Route path='orders' element={<OrderPage />} />
            <Route path='tags' element={<TagPage />} />
            <Route path='news' element={<NewsPage />} />
            <Route path='reviews' element={<ReviewPage />} />
            <Route path='support-chat' element={<AdminChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
