export type UserRole = 'admin' | 'reader'
export type PostStatus = 'draft' | 'published'
export type PostType = 'blog' | 'status'
export type CommentStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  username: string | null
  bio: string | null
  cover_url: string | null
  website: string | null
  location: string | null
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  post_count?: number
}

export interface Post {
  id: string
  title: string | null
  slug: string
  content: string
  excerpt: string | null
  thumbnail_url: string | null
  category_id: string | null
  author_id: string
  status: PostStatus
  type: PostType
  images: string[]
  view_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  category?: Category
  author?: User
  comment_count?: number
  like_count?: number
  liked_by_user?: boolean
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  status: CommentStatus
  created_at: string
  user?: User
  post?: Pick<Post, 'id' | 'title' | 'slug'>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PostsResponse {
  posts: Post[]
  meta: PaginationMeta
}
