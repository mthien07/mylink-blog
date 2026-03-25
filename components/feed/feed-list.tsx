'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusCard } from './status-card'
import { StatusComposer } from './status-composer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Post, User } from '@/lib/types'

interface FeedListProps {
  initialPosts: Post[]
  currentUser: User | null
}

export function FeedList({ initialPosts, currentUser }: FeedListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 10)
  const [authUser, setAuthUser] = useState<User | null>(currentUser)

  // Sync auth state on client (handles hydration diff)
  useEffect(() => {
    if (!currentUser) {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
          if (data) setAuthUser(data as User)
        }
      })
    }
  }, [currentUser])

  const handlePostCreated = (post: Post) => {
    setPosts(prev => [post, ...prev])
  }

  const handleDelete = async (postId: string) => {
    if (!authUser) return
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', authUser.id)

    if (error) {
      toast.error('Không thể xóa bài viết')
      return
    }
    setPosts(prev => prev.filter(p => p.id !== postId))
    toast.success('Đã xóa bài viết')
  }

  const loadMore = async () => {
    if (posts.length === 0) return
    setLoadingMore(true)
    try {
      const cursor = posts[posts.length - 1].created_at
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select(`*, author:users(id, display_name, avatar_url, email, username), like_count:post_likes(count), comment_count:comments(count)`)
        .eq('type', 'status')
        .eq('status', 'published')
        .lt('created_at', cursor)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const newPosts = (data || []) as Post[]
      setPosts(prev => [...prev, ...newPosts])
      setHasMore(newPosts.length === 10)
    } catch {
      toast.error('Không thể tải thêm bài viết')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="space-y-4">
      {authUser && (
        <StatusComposer currentUser={authUser} onPostCreated={handlePostCreated} />
      )}

      {posts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Chưa có bài viết nào.</p>
          {authUser && <p className="text-sm mt-1">Hãy là người đầu tiên chia sẻ!</p>}
        </div>
      )}

      {posts.map(post => (
        <StatusCard
          key={post.id}
          post={post}
          currentUser={authUser}
          onDelete={handleDelete}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full max-w-xs"
          >
            {loadingMore ? <LoadMoreSkeleton /> : 'Tải thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}

function LoadMoreSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded-full animate-spin" />
      <span>Đang tải...</span>
    </div>
  )
}
