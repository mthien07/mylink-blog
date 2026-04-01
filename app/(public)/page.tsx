import { Suspense } from 'react'
import { getPosts, getCategories } from '@/lib/supabase/queries'
import { CategoryFilter } from '@/components/blog/category-filter'
import { Pagination } from '@/components/blog/pagination'
import { PostList } from '@/components/blog/post-list'
import { FeaturedPosts } from '@/components/blog/featured-posts'
import { CreatePostCTA } from '@/components/blog/create-post-cta'

interface HomePageProps {
  searchParams: Promise<{ trang?: string; 'danh-muc'?: string; q?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = parseInt(params.trang || '1')
  const categorySlug = params['danh-muc']
  const search = params.q

  const [{ posts, meta }, categories] = await Promise.all([
    getPosts({ page, limit: 10, categorySlug, search }),
    getCategories(),
  ])

  return (
    <div className="space-y-3">
      {/* Featured Posts horizontal carousel - first page, no filters */}
      {page === 1 && !categorySlug && !search && <FeaturedPosts />}

      {/* Create Post CTA */}
      <CreatePostCTA />

      {/* Category filter */}
      <div className="bg-card rounded-xl border px-4 py-3">
        <CategoryFilter categories={categories} currentSlug={categorySlug} />
      </div>

      {/* Post Feed */}
      <Suspense fallback={<PostList posts={[]} loading />}>
        <PostList posts={posts} />
      </Suspense>

      {/* Pagination */}
      <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
    </div>
  )
}
