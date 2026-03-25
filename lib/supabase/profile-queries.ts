import { createClient } from './server'
import type { User, Post, PaginationMeta } from '@/lib/types'

export interface UserProfile extends User {
  post_count: number
  total_likes: number
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !user) return null

  // Get post count
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('status', 'published')

  // Get total likes on user's posts: first get post IDs, then count likes
  const { data: userPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('author_id', user.id)
    .eq('status', 'published')

  let totalLikes = 0
  if (userPosts && userPosts.length > 0) {
    const postIds = userPosts.map(p => p.id)
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds)
    totalLikes = count || 0
  }

  return {
    ...(user as User),
    post_count: postCount || 0,
    total_likes: totalLikes,
  }
}

export async function getUserPosts(
  userId: string,
  options: { page?: number; limit?: number; type?: 'blog' | 'status' | 'all' }
): Promise<{ posts: Post[]; meta: PaginationMeta }> {
  const supabase = await createClient()
  const { page = 1, limit = 10, type = 'all' } = options
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('posts')
    .select('*, category:categories(*), author:users(id, display_name, avatar_url, email, username)', { count: 'exact' })
    .eq('author_id', userId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (type !== 'all') query = query.eq('type', type)

  const { data: posts, count, error } = await query
  if (error) throw error

  return {
    posts: (posts || []) as Post[],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

export async function updateProfile(
  userId: string,
  data: { display_name?: string; username?: string; bio?: string; website?: string; location?: string }
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)

  return { error: error?.message || null }
}
