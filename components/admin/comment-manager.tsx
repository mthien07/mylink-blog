'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeDate, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Comment } from '@/lib/types'

interface CommentManagerProps {
  initialComments: Comment[]
}

export function CommentManager({ initialComments }: CommentManagerProps) {
  const [comments, setComments] = useState(initialComments)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const supabase = createClient()
    const { error } = await supabase.from('comments').update({ status }).eq('id', id)
    if (error) toast.error('Có lỗi xảy ra')
    else {
      toast.success(status === 'approved' ? 'Đã duyệt bình luận' : 'Đã từ chối bình luận')
      setComments(cs => cs.map(c => c.id === id ? { ...c, status } : c))
    }
  }

  const deleteComment = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) toast.error('Có lỗi khi xóa')
    else {
      toast.success('Đã xóa bình luận')
      setComments(cs => cs.filter(c => c.id !== id))
    }
  }

  const filtered = filter === 'all' ? comments : comments.filter(c => c.status === filter)
  const counts = {
    all: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : f === 'approved' ? 'Đã duyệt' : 'Từ chối'}
            <Badge variant="secondary" className="ml-1.5 text-xs">{counts[f]}</Badge>
          </Button>
        ))}
      </div>

      <div className="border rounded-lg divide-y">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Không có bình luận nào.</div>
        ) : filtered.map(comment => (
          <div key={comment.id} className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.user?.avatar_url || ''} />
                <AvatarFallback className="text-xs">{getInitials(comment.user?.display_name || comment.user?.email || 'U')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{comment.user?.display_name || comment.user?.email}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                  <Badge variant={
                    comment.status === 'approved' ? 'default' :
                    comment.status === 'pending' ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {comment.status === 'approved' ? 'Đã duyệt' : comment.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                  </Badge>
                  {comment.post && (
                    <Link href={`/bai-viet/${comment.post.slug}`} target="_blank" className="text-xs text-primary hover:underline truncate max-w-[200px]">
                      {comment.post.title}
                    </Link>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {comment.status !== 'approved' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => updateStatus(comment.id, 'approved')}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                {comment.status !== 'rejected' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500 hover:text-orange-600" onClick={() => updateStatus(comment.id, 'rejected')}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteComment(comment.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
