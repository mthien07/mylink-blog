import { getCategories } from '@/lib/supabase/queries'
import { CategoryManager } from '@/components/admin/category-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Danh mục - Admin' }

export default async function CategoriesAdminPage() {
  const categories = await getCategories()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý danh mục</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  )
}
