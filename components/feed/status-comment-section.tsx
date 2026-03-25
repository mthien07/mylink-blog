'use client'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeDate, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import type { Comment } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface StatusCommentSectionProps {
  postId: string
  commentCount?: number
}

const DEFAULT_VISIBLE = 3

export function StatusCommentSection({ postId, commentCount = 0 }: StatusCommentSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [totalCount, setTotalCount] = useState(commentCount)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const fetchComments = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*, user:users(id, display_name, avatar_url, email)')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    const fetched = (data || []) as Comment[]
    setComments(fetched)
    setTotalCount(fetched.length)
    setLoading(false)
  }

  const handleToggle = async () => {
    if (!expanded && comments.length === 0) await fetchComments()
    setExpanded(prev => !prev)
    if (expanded) setShowAll(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để bình luận')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      content: content.trim(),
      status: 'approved',
    })
    if (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } else {
      setContent('')
      await fetchComments()
    }
    setSubmitting(false)
  }

  const visibleComments = showAll ? comments : comments.slice(0, DEFAULT_VISIBLE)

  return (
    <div className="mt-2">
      {/* Toggle link */}
      <button
        onClick={handleToggle}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? 'Ẩn bình luận' : `${totalCount} bình luận`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <p className="text-xs text-muted-foreground">Đang tải...</p>
          ) : (
            <>
              {visibleComments.length === 0 && (
                <p className="text-xs text-muted-foreground">Chưa có bình luận. Hãy là người đầu tiên!</p>
              )}
              {visibleComments.map(comment => (
                <div key={comment.id} className="flex gap-2 items-start">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={comment.user?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.user?.display_name || comment.user?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm">
                    <span className="font-medium text-xs">
                      {comment.user?.display_name || comment.user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatRelativeDate(comment.created_at)}
                    </span>
                    <p className="text-sm mt-0.5 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}

              {!showAll && comments.length > DEFAULT_VISIBLE && (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Xem thêm {comments.length - DEFAULT_VISIBLE} bình luận
                </button>
              )}
            </>
          )}

          {/* Comment input */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs">
                {user ? getInitials(user.email || 'U') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-1">
              <Input
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={user ? 'Viết bình luận...' : 'Đăng nhập để bình luận'}
                disabled={!user || submitting}
                className="h-8 text-sm rounded-full"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e as unknown as React.FormEvent) }}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!user || submitting || !content.trim()}
                className="h-8 w-8 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
