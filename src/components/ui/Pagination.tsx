import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

function buildPageNumbers(current: number, pageCount: number): number[] {
  const start = Math.max(1, Math.min(current - 1, pageCount - 2))
  const end = Math.min(pageCount, start + 2)
  const pages: number[] = []
  for (let p = start; p <= end; p += 1) pages.push(p)
  return pages
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
      <p className="text-sm text-muted">
        Showing {from} to {to} of {total.toLocaleString('en-US')} orders
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {buildPageNumbers(page, pageCount).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold transition ${
              p === page
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-primary hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
