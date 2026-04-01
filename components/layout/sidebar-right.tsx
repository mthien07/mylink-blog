import Link from 'next/link'
import Image from 'next/image'
import { Eye, TrendingUp, Tag } from 'lucide-react'
import { getPopularPosts, getCategories } from '@/lib/supabase/queries'

export async function SidebarRight() {
  const [popularPosts, categories] = await Promise.all([
    getPopularPosts(5),
    getCategories(),
  ])

  return (
    <div className="sticky top-[60px] space-y-4 pb-4">
      {/* Popular posts widget */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Bài viết nổi bật</h3>
        </div>
        <div className="space-y-3">
          {popularPosts.map((post, i) => (
            <Link key={post.id} href={`/bai-viet/${post.slug}`} className="flex gap-3 group">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {post.thumbnail_url ? (
                  <Image
                    src={post.thumbnail_url}
                    alt={post.title || ''}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {i + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {post.view_count.toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories widget */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Danh mục</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/danh-muc/${cat.slug}`}
              className="text-xs px-2.5 py-1 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
