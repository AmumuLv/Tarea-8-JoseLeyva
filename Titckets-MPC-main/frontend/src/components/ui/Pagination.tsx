import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  )

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {visiblePages.map((page, i) => (
        <div key={page} className="flex items-center">
          {i > 0 && visiblePages[i - 1] !== page - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <Button
            variant={page === currentPage ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
