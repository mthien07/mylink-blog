import Link from 'next/link'
import Image from 'next/image'
import { getPopularPosts } from '@/lib/supabase/queries'

export async function FeaturedPosts() {
  const posts = await getPopularPosts(8)
  if (posts.length === 0) return null

  return (
    <div className="bg-card rounded-xl border p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        ⭐ Nổi bật
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/bai-viet/${post.slug}`}
            className="flex-none w-[130px] group snap-start"
          >
            <div className="relative w-[130px] h-[130px] rounded-xl overflow-hidden bg-muted ring-2 ring-transparent group-hover:ring-primary/40 transition-all duration-200">
              {post.thumbnail_url ? (
                <Image
                  src={post.thumbnail_url}
                  alt={post.title || ''}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="130px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl">
                  📝
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Category badge */}
              {post.category && (
                <span className="absolute top-1.5 left-1.5 text-[10px] font-medium bg-primary text-white px-1.5 py-0.5 rounded-full">
                  {post.category.name}
                </span>
              )}
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-[11px] font-medium leading-tight line-clamp-2">
                  {post.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
