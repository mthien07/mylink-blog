import { getCategories } from '@/lib/supabase/queries'
import { PostForm } from '@/components/admin/post-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Viết bài mới - Admin' }

export default async function CreatePostPage() {
  const categories = await getCategories()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Viết bài mới</h1>
      <PostForm categories={categories} />
    </div>
  )
}
