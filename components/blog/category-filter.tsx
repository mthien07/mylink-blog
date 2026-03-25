'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface CategoryFilterProps {
  categories: Category[]
  currentSlug?: string
}

export function CategoryFilter({ categories, currentSlug }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (slug) params.set('danh-muc', slug)
    else params.delete('danh-muc')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => handleSelect()}>
        <Badge variant={!currentSlug ? 'default' : 'outline'} className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
          Tất cả
        </Badge>
      </button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => handleSelect(cat.slug)}>
          <Badge
            variant={currentSlug === cat.slug ? 'default' : 'outline'}
            className={cn('cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors')}
          >
            {cat.name}
          </Badge>
        </button>
      ))}
    </div>
  )
}
