import { createClient } from './server'
import type { Post } from '@/lib/types'

export interface StatusPostsOptions {
  page?: number
  limit?: number
  authorId?: string
  cursor?: string // created_at of last post for cursor-based pagination
}

export async function getStatusPosts(options: StatusPostsOptions = {}): Promise<Post[]> {
  const supabase = await createClient()
  const { limit = 10, authorId, cursor } = options

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users(id, display_name, avatar_url, email, username),
      like_count:post_likes(count),
      comment_count:comments(count)
    `)
    .eq('type', 'status')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (authorId) query = query.eq('author_id', authorId)
  if (cursor) query = query.lt('created_at', cursor)

  const { data, error } = await query
  if (error) throw error

  // Normalize aggregated count fields returned as array by Supabase
  return ((data || []) as unknown[]).map((post: unknown) => {
    const p = post as Record<string, unknown>
    const likeArr = p.like_count as { count: number }[] | null
    const commentArr = p.comment_count as { count: number }[] | null
    return {
      ...p,
      like_count: likeArr?.[0]?.count ?? 0,
      comment_count: commentArr?.[0]?.count ?? 0,
    } as Post
  })
}

export async function createStatusPost(data: {
  content: string
  images: string[]
  authorId: string
}): Promise<Post> {
  const supabase = await createClient()
  const slug = `status-${crypto.randomUUID().slice(0, 8)}`

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      slug,
      content: data.content,
      images: data.images,
      author_id: data.authorId,
      type: 'status',
      status: 'published',
      published_at: new Date().toISOString(),
      title: null,
      excerpt: null,
      thumbnail_url: null,
      category_id: null,
      view_count: 0,
    })
    .select(`*, author:users(id, display_name, avatar_url, email, username)`)
    .single()

  if (error) throw error
  return { ...(post as Post), like_count: 0, comment_count: 0 }
}

export async function deleteStatusPost(postId: string, userId: string): Promise<void> {
  const supabase = await createClient()

  // Verify ownership before delete
  const { data: existing, error: fetchError } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', postId)
    .single()

  if (fetchError || !existing) throw new Error('Bài viết không tồn tại')
  if ((existing as { author_id: string }).author_id !== userId) {
    throw new Error('Bạn không có quyền xóa bài viết này')
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}
