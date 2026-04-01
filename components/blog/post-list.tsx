import { PostCard } from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Post } from '@/lib/types'

interface PostListProps {
  posts: Post[]
  loading?: boolean
}

export function PostList({ posts, loading }: PostListProps) {
  if (loading) return <PostListSkeleton />
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border">
        <p className="text-base">Chưa có bài viết nào.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} index={i} />
      ))}
    </div>
  )
}

function PostListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border overflow-hidden">
          {/* Header skeleton */}
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="px-4 pb-3 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Image skeleton */}
          <Skeleton className="h-52 w-full" />
          {/* Stats skeleton */}
          <div className="px-4 py-2 flex gap-3 border-t">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-3 w-12" />
          </div>
          {/* Interaction bar skeleton */}
          <div className="flex gap-1 p-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
