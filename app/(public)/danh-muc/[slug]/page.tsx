import { notFound } from 'next/navigation'
import { getPosts } from '@/lib/supabase/queries'
import { PostList } from '@/components/blog/post-list'
import { Pagination } from '@/components/blog/pagination'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ trang?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: cat } = await supabase.from('categories').select('name, description').eq('slug', slug).single()
  if (!cat) return { title: 'Danh mục không tồn tại' }
  return { title: cat.name, description: cat.description || undefined }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const sp = await searchParams
  const page = parseInt(sp.trang || '1')

  const supabase = await createClient()
  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (!category) notFound()

  const { posts, meta } = await getPosts({ page, limit: 9, categorySlug: slug })

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && <p className="text-muted-foreground">{category.description}</p>}
        <p className="text-sm text-muted-foreground mt-2">{meta.total} bài viết</p>
      </div>

      <PostList posts={posts} />
      <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
    </div>
  )
}
