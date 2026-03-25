import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getStatusPosts } from '@/lib/supabase/status-post-queries'
import { FeedList } from '@/components/feed/feed-list'
import type { User } from '@/lib/types'

export const metadata: Metadata = { title: 'Bảng tin' }

export default async function BangTinPage() {
  const supabase = await createClient()

  // Fetch current auth user and their profile in parallel with posts
  const [{ data: { user: authUser } }, initialPosts] = await Promise.all([
    supabase.auth.getUser(),
    getStatusPosts({ limit: 10 }),
  ])

  // Fetch user profile row if logged in
  let currentUser: User | null = null
  if (authUser) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    currentUser = data as User | null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Bảng tin</h1>
      <FeedList
        initialPosts={initialPosts}
        currentUser={currentUser}
      />
    </div>
  )
}
