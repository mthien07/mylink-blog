import { createClient } from './server'
import type { Post, Category, Comment, PaginationMeta } from '@/lib/types'

export async function getPosts(options: {
  page?: number
  limit?: number
  categorySlug?: string
  search?: string
  status?: 'published' | 'draft' | 'all'
} = {}): Promise<{ posts: Post[]; meta: PaginationMeta }> {
  const supabase = await createClient()
  const { page = 1, limit = 10, categorySlug, search, status = 'published' } = options
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      author:users(id, display_name, avatar_url, email)
    `, { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to)

  if (status !== 'all') query = query.eq('status', status)
  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (search) query = query.ilike('title', `%${search}%`)

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

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      author:users(id, display_name, avatar_url, email)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) return null
  return data as Post
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return (data || []) as Category[]
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select(`*, user:users(id, display_name, avatar_url, email)`)
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []) as Comment[]
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: totalComments },
    { count: pendingComments },
    { data: viewData },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('posts').select('view_count'),
  ])
  const totalViews = viewData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0
  return {
    totalPosts: totalPosts || 0,
    publishedPosts: publishedPosts || 0,
    totalComments: totalComments || 0,
    pendingComments: pendingComments || 0,
    totalViews,
  }
}
