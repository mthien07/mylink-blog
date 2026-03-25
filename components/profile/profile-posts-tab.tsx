'use client'
import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from '@/components/blog/post-card'
import { StatusPostCard } from './status-post-card'
import type { Post } from '@/lib/types'

interface ProfilePostsTabProps {
  userId: string
}

const LIMIT = 10

function usePosts(userId: string, type: 'blog' | 'status') {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    const supabase = createClient()
    const from = (pageNum - 1) * LIMIT
    const to = from + LIMIT - 1

    const { data, count } = await supabase
      .from('posts')
      .select('*, category:categories(*), author:users(id, display_name, avatar_url, email, username)', { count: 'exact' })
      .eq('author_id', userId)
      .eq('status', 'published')
      .eq('type', type)
      .order('published_at', { ascending: false })
      .range(from, to)

    const fetched = (data || []) as Post[]
    setPosts(prev => append ? [...prev, ...fetched] : fetched)
    setHasMore(((count || 0) > pageNum * LIMIT))
    setLoading(false)
    setLoadingMore(false)
  }, [userId, type])

  useEffect(() => {
    setLoading(true)
    setPosts([])
    setPage(1)
    fetchPosts(1, false)
  }, [fetchPosts])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    fetchPosts(next, true)
  }

  return { posts, loading, hasMore, loadingMore, loadMore }
}

function PostSkeleton() {
  return (
    <div className="space-y-3 border rounded-lg p-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

function BlogPostsPane({ userId }: { userId: string }) {
  const { posts, loading, hasMore, loadingMore, loadMore } = usePosts(userId, 'blog')
  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <PostSkeleton key={i} />)}</div>
  if (posts.length === 0) return <p className="text-muted-foreground text-sm py-6 text-center">Chưa có bài viết nào.</p>
  return (
    <div className="space-y-4">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      {hasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}

function StatusPostsPane({ userId }: { userId: string }) {
  const { posts, loading, hasMore, loadingMore, loadMore } = usePosts(userId, 'status')
  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <PostSkeleton key={i} />)}</div>
  if (posts.length === 0) return <p className="text-muted-foreground text-sm py-6 text-center">Chưa có trạng thái nào.</p>
  return (
    <div className="space-y-4">
      {posts.map(post => <StatusPostCard key={post.id} post={post} />)}
      {hasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}

export function ProfilePostsTab({ userId }: ProfilePostsTabProps) {
  return (
    <Tabs defaultValue="blog">
      <TabsList className="mb-6">
        <TabsTrigger value="blog">Bài viết</TabsTrigger>
        <TabsTrigger value="status">Trạng thái</TabsTrigger>
      </TabsList>
      <TabsContent value="blog">
        <BlogPostsPane userId={userId} />
      </TabsContent>
      <TabsContent value="status">
        <StatusPostsPane userId={userId} />
      </TabsContent>
    </Tabs>
  )
}
