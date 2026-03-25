import { createClient } from '@/lib/supabase/client'

// Toggle like for a post - returns new liked state and count
export async function toggleLike(postId: string): Promise<{ liked: boolean; count: number }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
  }

  const count = await getLikeCount(postId)
  return { liked: !existing, count }
}

// Check if current user liked a post
export async function getLikeStatus(postId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

// Get total like count for a post
export async function getLikeCount(postId: string): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  return count ?? 0
}
