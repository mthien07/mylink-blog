import { createClient } from '@/lib/supabase/server'
import { CommentManager } from '@/components/admin/comment-manager'
import type { Metadata } from 'next'
import type { Comment } from '@/lib/types'

export const metadata: Metadata = { title: 'Bình luận - Admin' }

export default async function CommentsAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('*, user:users(id, display_name, avatar_url, email), post:posts(id, title, slug)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý bình luận</h1>
      <CommentManager initialComments={(data || []) as Comment[]} />
    </div>
  )
}
