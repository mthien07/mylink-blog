import { getCategories } from '@/lib/supabase/queries'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Danh mục' }

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Danh mục</h1>
      <p className="text-muted-foreground mb-8">Khám phá bài viết theo chủ đề</p>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">Chưa có danh mục nào.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map(cat => (
            <Link key={cat.id} href={`/danh-muc/${cat.slug}`} className="group block border rounded-lg p-5 hover:border-primary hover:shadow-sm transition-all">
              <h2 className="font-semibold group-hover:text-primary transition-colors mb-1">{cat.name}</h2>
              {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
