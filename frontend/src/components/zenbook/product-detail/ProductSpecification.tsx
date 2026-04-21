import { useTranslation } from 'react-i18next'
import type { BookResponse } from '@/services/book/book.type'

interface ProductSpecificationProps {
  book: BookResponse
}

export default function ProductSpecification({ book }: ProductSpecificationProps) {
  const { t } = useTranslation('common')

  const specs: { label: string; value: string | number | undefined }[] = [
    { label: t('product.specs.sku'), value: book.isbn ?? book.id },
    { label: t('product.specs.publisher'), value: book.publisher?.name },
    { label: t('product.specs.publicationYear'), value: book.publicationYear },
    {
      label: t('product.specs.author'),
      value: book.authors?.map((a) => a.name).join(', ')
    },
    {
      label: t('product.specs.format'),
      value: book.format === 'HARDCOVER' ? t('product.hardcover') : t('product.paperback')
    },
    {
      label: t('product.specs.pages'),
      value: book.pageCount ? `${book.pageCount} ${t('product.pages')}` : undefined
    },
    { label: t('product.specs.dimensions'), value: book.dimensions },
    { label: t('product.specs.language'), value: book.language ?? t('product.vietnamese') }
  ]

  return (
    <div className='border border-gray-200 rounded overflow-hidden text-sm'>
      {specs.map((spec, i) => (
        <div
          key={spec.label}
          className={`grid grid-cols-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
        >
          <span className='text-gray-500 font-medium'>{spec.label}</span>
          <span className='col-span-2 text-gray-800'>{spec.value ?? t('product.updating')}</span>
        </div>
      ))}
    </div>
  )
}
