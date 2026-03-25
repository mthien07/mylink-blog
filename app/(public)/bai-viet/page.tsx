import { getPosts, getCategories } from '@/lib/supabase/queries'
import { PostList } from '@/components/blog/post-list'
import { CategoryFilter } from '@/components/blog/category-filter'
import { Pagination } from '@/components/blog/pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tất cả bài viết' }

interface PostListPageProps {
  searchParams: Promise<{ trang?: string; 'danh-muc'?: string }>
}

export default async function PostListPage({ searchParams }: PostListPageProps) {
  const params = await searchParams
  const page = parseInt(params.trang || '1')
  const categorySlug = params['danh-muc']

  const [{ posts, meta }, categories] = await Promise.all([
    getPosts({ page, limit: 9, categorySlug }),
    getCategories(),
  ])

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Bài viết</h1>
      <p className="text-muted-foreground mb-8">Khám phá tất cả bài viết</p>

      <div className="mb-6">
        <CategoryFilter categories={categories} currentSlug={categorySlug} />
      </div>

      <PostList posts={posts} />
      <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
    </div>
  )
}
