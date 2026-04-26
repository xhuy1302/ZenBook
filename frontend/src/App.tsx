import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import LayoutClient from '@/pages/client/LayoutCilent'
import HomePage from '@/pages/client/home/HomePage'
import AccountPage from '@/pages/client/customer/CustomerPage'
import CartPage from '@/pages/client/cart/CartPage'
import ProductListPage from '@/pages/client/product-list/ProductListPage'
import ProductDetailPage from '@/pages/client/product-detail/ProductDetailPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import LayoutAdmin from '@/pages/admin/LayoutAdmin'
import ProtectedRoute from './routes/ProtectedRoute'
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

// 👉 IMPORT THÊM CÁC TAB CỦA ACCOUNT PAGE
import ProfileTab from '@/components/zenbook/account/Profiletab'
import OrdersTab from '@/components/zenbook/account/Orderstab'
import AddressTab from '@/components/zenbook/account/Addresstab'
import MyReview from '@/components/zenbook/account/MyReviews'
import BlogPage from './components/zenbook/blog/Blog'
import BlogDetailPage from './components/zenbook/blog/BlogDetail'
import CheckoutPage from '@/pages/client/checkout/CheckoutPage'
import OrderSuccessPage from './pages/client/order/OrderSuccessPage'
import OrderDetail from './components/zenbook/account/modals/OrderDetail'
import VNPayReturn from './pages/client/payment/VNPayReturn'
import ScrollToTop from './components/common/ScrollToTop'

function App() {
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
        <Routes>
          {/* <Route path='*' element={<NotFound404 />} /> */}

          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />

          {/* =========================================
              LAYOUT CLIENT (Có Header & Footer)
              ========================================= */}
          <Route element={<LayoutClient />}>
            {/* CÁC ROUTE PUBLIC (Ai cũng xem được) */}
            <Route path='/' element={<HomePage />} />
            <Route path='/blog' element={<BlogPage />} />
            <Route path='/blog/:slug' element={<BlogDetailPage />} />
            <Route path='/products' element={<ProductListPage />} />
            <Route path='/search' element={<ProductListPage />} />
            <Route path='/products/:slug' element={<ProductDetailPage />} />

            {/* =========================================
                PROTECTED ROUTES CLIENT (Phải đăng nhập)
                ========================================= */}
            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STAFF']} />}>
              <Route path='/cart' element={<CartPage />} />
              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path='/payment/vnpay-return' element={<VNPayReturn />} />
              <Route path='/orders/success/:id' element={<OrderSuccessPage />} />

              {/* 👉 KHAI BÁO ROUTE CON CHO ACCOUNT PAGE */}
              <Route path='/customer' element={<AccountPage />}>
                {/* Khi vào đúng /customer/profile thì render ProfileTab mặc định */}
                <Route index element={<ProfileTab />} />

                {/* Các URL con: /customer/profile/orders, v.v... */}
                <Route path='orders' element={<OrdersTab />} />
                <Route path='orders/:id' element={<OrderDetail />} />
                <Route path='address' element={<AddressTab />} />
                <Route path='myreviews' element={<MyReview />} />
              </Route>
            </Route>
          </Route>

          {/* =========================================
              PROTECTED ROUTES CHỈ DÀNH CHO ADMIN
              ========================================= */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
            <Route path='/dashboard' element={<LayoutAdmin />}>
              <Route index element={<DashboardHome />} />
              <Route path='users' element={<UserPage />} />
              <Route path='authors' element={<AuthorPage />} />
              <Route path='categories' element={<CategoryPage />} />
              <Route path='publishers' element={<PublisherPage />} />
              <Route path='books' element={<BookPage />} />
              <Route path='receipts' element={<ReceiptPage />} />
              <Route path='orders' element={<OrderPage />} />
              <Route path='promotions' element={<PromotionPage />} />
              <Route path='tags' element={<TagPage />} />
              <Route path='coupons' element={<CouponPage />} />
              <Route path='news' element={<NewsPage />} />
              <Route path='suppliers' element={<SuplierPage />} />
              <Route path='reviews' element={<ReviewPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
