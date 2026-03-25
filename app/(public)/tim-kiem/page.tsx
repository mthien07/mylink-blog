import { getPosts } from '@/lib/supabase/queries'
import { PostList } from '@/components/blog/post-list'
import { SearchBar } from '@/components/blog/search-bar'
import { Pagination } from '@/components/blog/pagination'
import type { Metadata } from 'next'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; trang?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  return {
    title: params.q ? `Tìm kiếm: ${params.q}` : 'Tìm kiếm',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const page = parseInt(params.trang || '1')

  const { posts, meta } = await getPosts({ page, limit: 9, search: query })

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Kết quả tìm kiếm cho "${query}"` : 'Tìm kiếm bài viết'}
      </h1>

      <div className="max-w-xl mb-8">
        <SearchBar initialValue={query} />
      </div>

      {query && (
        <p className="text-muted-foreground text-sm mb-6">
          Tìm thấy {meta.total} bài viết
        </p>
      )}

      <PostList posts={posts} />
      <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
    </div>
  )
}
