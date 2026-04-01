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
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Chưa có bài viết nào.</p>
      </div>
    )
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
    </div>
  )
}

function PostListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
