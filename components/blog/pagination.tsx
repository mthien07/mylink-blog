'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('trang', String(page))
    router.push(`?${params.toString()}`)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, idx) => {
        const prevPage = pages[idx - 1]
        return (
          <div key={page} className="flex items-center gap-2">
            {prevPage && page - prevPage > 1 && <span className="text-muted-foreground px-1">...</span>}
            <Button
              variant={page === currentPage ? 'default' : 'outline'}
              size="icon"
              onClick={() => goToPage(page)}
            >
              {page}
            </Button>
          </div>
        )
      })}

      <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
