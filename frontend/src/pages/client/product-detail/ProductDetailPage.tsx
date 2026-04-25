import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCart } from '@/context/CartContext'

import { SidebarProvider } from '@/components/ui/sidebar'
import BreadcrumbHeader from '@/components/zenbook/breadcrumb/BreadCrumbHeader'
import { getBookBySlugApi, incrementBookViewApi } from '@/services/book/book.api'

import ProductGallery from '@/components/zenbook/product-detail/ProductGallery'
import ProductInfo from '@/components/zenbook/product-detail/ProductInfo'
import ProductDescription from '@/components/zenbook/product-detail/ProductDescription'
import ProductSpecification from '@/components/zenbook/product-detail/ProductSpecification'
import ProductReviews from '@/components/zenbook/product-detail/ProductReviews'
import RelatedBooks from '@/components/zenbook/product-detail/RelatedBooks'

function LoadingSkeleton() {
  return (
    <div className='max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4 animate-pulse'>
      <div className='bg-white rounded border border-gray-100 aspect-[3/4]' />
      <div className='flex flex-col gap-3 bg-white rounded border border-gray-100 p-5'>
        <div className='h-5 bg-gray-100 rounded w-4/5' />
        <div className='h-4 bg-gray-100 rounded w-2/5' />
        <div className='h-8 bg-gray-100 rounded w-1/3' />
        <div className='h-4 bg-gray-100 rounded w-full mt-2' />
        <div className='h-4 bg-gray-100 rounded w-4/5' />
      </div>
    </div>
  )
}

function NotFound() {
  const { t } = useTranslation('common')
  return (
    <div className='flex flex-col items-center justify-center gap-4 py-24 text-center'>
      <p className='text-6xl font-bold text-gray-100'>404</p>
      <h2 className='text-xl font-semibold text-gray-700'>{t('product.notFound')}</h2>
      <p className='text-sm text-gray-400'>{t('product.notFoundDesc')}</p>
      <a
        href='/'
        className='text-sm text-[#c92127] border border-[#c92127] px-6 py-2 rounded font-semibold hover:bg-[#c92127]/5 transition-colors'
      >
        {t('common.backToHome')}
      </a>
    </div>
  )
}

export default function ProductDetailPage() {
  const { t } = useTranslation('common')
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const {
    data: bookData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['bookDetail', slug],
    queryFn: () => getBookBySlugApi(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (bookData?.id) {
      const viewedKey = `viewed_book_${bookData.id}`
      if (!sessionStorage.getItem(viewedKey)) {
        incrementBookViewApi(bookData.id).catch(() => {})
        sessionStorage.setItem(viewedKey, 'true')
      }
    }
  }, [bookData?.id])

  const handleAddToCart = () => {
    if (!bookData) return

    addItem(
      {
        id: bookData.id || '',
        title: bookData.title || '',
        thumbnail: bookData.thumbnail || '/images/placeholder-book.jpg',
        price: bookData.salePrice || 0,
        stock: bookData.stockQuantity || 0,
        originalPrice: bookData.originalPrice,
        author: bookData.authors?.[0]?.name
      },
      quantity
    )

    toast.success(t('cart.addSuccess'))
  }

  const handleBuyNow = () => {
    if (!bookData) return

    addItem(
      {
        id: bookData.id || '',
        title: bookData.title || '',
        thumbnail: bookData.thumbnail || '/images/placeholder-book.jpg',
        price: bookData.salePrice || 0,
        stock: bookData.stockQuantity || 0,
        originalPrice: bookData.originalPrice,
        author: bookData.authors?.[0]?.name
      },
      quantity
    )

    navigate('/cart', { state: { buyNowId: bookData.id } })
  }

  return (
    <SidebarProvider>
      <div className='flex flex-col w-full min-h-screen bg-[#f5f5f5]'>
        <BreadcrumbHeader />

        {isLoading && (
          <main>
            <LoadingSkeleton />
          </main>
        )}

        {(isError || (!isLoading && !bookData)) && (
          <main>
            <NotFound />
          </main>
        )}

        {bookData && (
          <main className='w-full py-4'>
            <div className='max-w-7xl mx-auto px-4 flex flex-col gap-4'>
              <div className='flex flex-col md:flex-row gap-4 items-start relative'>
                <aside className='w-full md:w-[340px] shrink-0 bg-white rounded border border-gray-100 p-4 sticky top-4'>
                  <ProductGallery
                    images={bookData.images}
                    thumbnail={bookData.thumbnail}
                    title={bookData.title}
                    isOutOfStock={(bookData.stockQuantity ?? 0) === 0}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                </aside>

                <div className='flex-1 min-w-0 flex flex-col gap-4'>
                  <section className='bg-white rounded border border-gray-100 p-5'>
                    <ProductInfo
                      book={bookData}
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                    />
                  </section>

                  <section className='bg-white rounded border border-gray-100 p-5'>
                    <h2 className='text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider'>
                      {t('product.tabs.specification')}
                    </h2>
                    <ProductSpecification book={bookData} />
                  </section>

                  <section className='bg-white rounded border border-gray-100 p-5'>
                    <h2 className='text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider'>
                      {t('product.tabs.description')}
                    </h2>
                    <ProductDescription description={bookData.description ?? ''} />
                  </section>
                </div>
              </div>

              <section className='bg-white rounded border border-gray-100 p-5'>
                <ProductReviews
                  bookId={bookData.id}
                  rating={bookData.rating}
                  reviewsCount={bookData.reviews}
                  items={[]}
                />
              </section>

              <section className='bg-white rounded border border-gray-100 p-5'>
                <RelatedBooks categories={bookData.categories} currentBookId={bookData.id} />
              </section>
            </div>
          </main>
        )}
      </div>
    </SidebarProvider>
  )
}
