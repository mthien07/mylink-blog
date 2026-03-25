import { notFound } from 'next/navigation'
import { getCategories } from '@/lib/supabase/queries'
import { PostForm } from '@/components/admin/post-form'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { Post } from '@/lib/types'

export const metadata: Metadata = { title: 'Chỉnh sửa bài viết - Admin' }

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:users(*)')
    .eq('id', id)
    .single()

  if (error || !post) notFound()

  const categories = await getCategories()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa bài viết</h1>
      <PostForm post={post as Post} categories={categories} />
    </div>
  )
}
