import { Suspense } from 'react'
import { getPosts, getCategories } from '@/lib/supabase/queries'
import { PostCard } from '@/components/blog/post-card'
import { CategoryFilter } from '@/components/blog/category-filter'
import { Pagination } from '@/components/blog/pagination'
import { SearchBar } from '@/components/blog/search-bar'
import { PostList } from '@/components/blog/post-list'
import { HeroSection } from '@/components/layout/hero-section'

interface HomePageProps {
  searchParams: Promise<{ trang?: string; 'danh-muc'?: string; q?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = parseInt(params.trang || '1')
  const categorySlug = params['danh-muc']
  const search = params.q

  const [{ posts, meta }, categories] = await Promise.all([
    getPosts({ page, limit: 9, categorySlug, search }),
    getCategories(),
  ])

  const featuredPost = page === 1 && !categorySlug && !search ? posts[0] : null
  const remainingPosts = featuredPost ? posts.slice(1) : posts

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Hero */}
      {page === 1 && !categorySlug && !search && <HeroSection />}

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8">
        <SearchBar initialValue={search} />
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryFilter categories={categories} currentSlug={categorySlug} />
      </div>

      {/* Featured post */}
      {featuredPost && (
        <div className="mb-8">
          <PostCard post={featuredPost} featured />
        </div>
      )}

      {/* Post grid */}
      <Suspense fallback={<PostList posts={[]} loading />}>
        <PostList posts={remainingPosts} />
      </Suspense>

      {/* Pagination */}
      <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
    </div>
  )
}
