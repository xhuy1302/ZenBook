import { BookStatus } from '@/defines/book.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const statusColorMap: Record<BookStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  INACTIVE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  OUT_OF_STOCK: 'bg-orange-100 text-orange-700 border-orange-200',
  DELETED: 'bg-red-100 text-red-700 border-red-200'
}

export function BookStatusBadge({ status }: { status: BookStatus }) {
  const { t } = useTranslation('product')
  return (
    <span
      className={cn(
        // Thêm inline-flex, justify-center và min-w-[100px] để các khối bằng nhau
        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium w-fit',
        statusColorMap[status]
      )}
    >
      {t(`fields.status.options.${status}`, status)}
    </span>
  )
}
