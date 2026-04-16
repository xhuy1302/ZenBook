import { BookFormat } from '@/defines/book.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// 👉 Đổi Record<BookFormat, string> thành Record<string, string> để TS không bắt bẻ khi map màu
const formatColorMap: Record<string, string> = {
  HARDCOVER: 'bg-purple-100 text-purple-700 border-purple-200',
  PAPERBACK: 'bg-blue-100 text-blue-700 border-blue-200',
  EBOOK: 'bg-cyan-100 text-cyan-700 border-cyan-200'
}

// 👉 Nới lỏng type: cho phép nhận BookFormat, string bình thường, hoặc thậm chí bị undefined/null
export function BookFormatBadge({ format }: { format?: BookFormat | string | null }) {
  const { t } = useTranslation('product') // Nhớ dùng đúng 'product' hoặc 'book' theo JSON của bạn

  // Nếu không có format thì không render gì cả (bảo vệ giao diện khỏi lỗi sập web)
  if (!format) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-1 border rounded-md text-sm font-medium w-fit',
        formatColorMap[format] || 'bg-gray-100 text-gray-700 border-gray-200' // Màu dự phòng
      )}
    >
      {t(`fields.format.options.${format}`, format)}
    </span>
  )
}
