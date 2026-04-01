'use client'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, ThumbsUp } from 'lucide-react'
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
  const [userAvatar, setUserAvatar] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('display_name, avatar_url')
          .eq('id', data.user.id)
          .maybeSingle()
        if (profile) {
          setUserAvatar(profile.avatar_url || '')
          setUserName(profile.display_name || data.user.email || '')
        }
      }
    })

    const loadComments = async () => {
      const client = createClient()
      const { data } = await client
        .from('comments')
        .select('*, user:users(id, display_name, avatar_url, email)')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })
      setComments((data || []) as Comment[])
      setLoading(false)
    }
    loadComments()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để bình luận')
      setSubmitting(false)
      return
    }
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      content: content.trim(),
    })
    if (error) toast.error('Có lỗi xảy ra, vui lòng thử lại')
    else {
      toast.success('Bình luận đã được gửi và đang chờ duyệt')
      setContent('')
    }
    setSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <section id="comments" className="mt-8 border-t pt-6">
      <h3 className="text-lg font-bold mb-4">Bình luận ({comments.length})</h3>

      {/* Comment input - Facebook style inline */}
      <div className="flex gap-2 mb-6">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(userName || 'U')}
          </AvatarFallback>
        </Avatar>
        {user ? (
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <Input
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Viết bình luận..."
              className="flex-1 rounded-full bg-muted border-0 h-9 text-sm px-4 focus-visible:ring-1"
              disabled={submitting}
            />
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !content.trim()}
              className="rounded-full h-9 w-9 p-0 shrink-0"
              aria-label="Gửi bình luận"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        ) : (
          <div className="flex-1 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
            <a href="/auth/dang-nhap" className="text-primary hover:underline font-medium">Đăng nhập</a>
            {' '}để viết bình luận
          </div>
        )}
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <div className="flex gap-3 ml-3">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Chưa có bình luận. Hãy là người đầu tiên! 💬
            </p>
          )}
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2 group">
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarImage src={comment.user?.avatar_url || ''} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(comment.user?.display_name || comment.user?.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {/* Facebook-style comment bubble */}
                <div className="inline-block bg-muted rounded-2xl px-3.5 py-2.5 max-w-full">
                  <span className="text-xs font-semibold block mb-0.5">
                    {comment.user?.display_name || comment.user?.email}
                  </span>
                  <p className="text-sm leading-relaxed break-words">{comment.content}</p>
                </div>
                {/* Action row */}
                <div className="flex items-center gap-3 mt-1 ml-3.5 text-xs text-muted-foreground">
                  <span>{formatRelativeDate(comment.created_at)}</span>
                  <button className="font-semibold hover:text-primary transition-colors flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    Thích
                  </button>
                  <button className="font-semibold hover:text-primary transition-colors">
                    Trả lời
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
