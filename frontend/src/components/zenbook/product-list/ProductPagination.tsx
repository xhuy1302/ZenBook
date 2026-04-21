import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function ProductPagination({
  currentPage,
  totalPages,
  onPageChange
}: ProductPaginationProps) {
  if (totalPages <= 1) return null

  // Tạo dãy page numbers với ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = []
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className='flex items-center justify-center gap-1.5 mt-6'>
      {/* Prev */}
      <Button
        variant='outline'
        size='icon'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='w-9 h-9 rounded-lg border-gray-200 hover:border-brand-green hover:text-brand-green disabled:opacity-40'
      >
        <ChevronLeft className='w-4 h-4' />
      </Button>

      {/* Pages */}
      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className='w-9 h-9 flex items-center justify-center text-gray-400 text-sm'
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
              ${
                currentPage === page
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green'
              }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <Button
        variant='outline'
        size='icon'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='w-9 h-9 rounded-lg border-gray-200 hover:border-brand-green hover:text-brand-green disabled:opacity-40'
      >
        <ChevronRight className='w-4 h-4' />
      </Button>
    </div>
  )
}
