import { BookFormat } from '@/defines/book.enum' // Nhớ kiểm tra lại đường dẫn import enum này nhé
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// Map màu sắc cho từng định dạng sách
const formatColorMap: Record<BookFormat, string> = {
  HARDCOVER: 'bg-purple-100 text-purple-700 border-purple-200', // Tím cho bìa cứng
  PAPERBACK: 'bg-blue-100 text-blue-700 border-blue-200', // Xanh dương cho bìa mềm
  EBOOK: 'bg-cyan-100 text-cyan-700 border-cyan-200' // Xanh lơ cho sách điện tử
}

export function BookFormatBadge({ format }: { format: BookFormat }) {
  const { t } = useTranslation('product')

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
