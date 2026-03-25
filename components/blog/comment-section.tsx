'use client'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeDate, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import type { Comment } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*, user:users(id, display_name, avatar_url, email)')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
    setComments((data || []) as Comment[])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) { toast.error('Vui lòng đăng nhập để bình luận'); setSubmitting(false); return }
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: currentUser.id, content: content.trim() })
    if (error) toast.error('Có lỗi xảy ra, vui lòng thử lại')
    else {
      toast.success('Bình luận đã được gửi và đang chờ duyệt')
      setContent('')
    }
    setSubmitting(false)
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h3 className="text-xl font-bold mb-6">Bình luận ({comments.length})</h3>

      {loading ? (
        <div className="space-y-4 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.length === 0 && <p className="text-muted-foreground text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>}
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={comment.user?.avatar_url || ''} />
                <AvatarFallback className="text-xs">{getInitials(comment.user?.display_name || comment.user?.email || 'U')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{comment.user?.display_name || comment.user?.email}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                </div>
                <p className="text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Viết bình luận</h4>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !content.trim()} size="sm">
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Vui lòng <a href="/auth/dang-nhap" className="text-primary hover:underline">đăng nhập</a> để bình luận.
          </p>
        )}
      </div>
    </section>
  )
}
