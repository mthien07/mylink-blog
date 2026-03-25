import { getPosts } from '@/lib/supabase/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { DeletePostButton } from '@/components/admin/delete-post-button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Quản lý bài viết - Admin' }

interface PostsAdminPageProps {
  searchParams: Promise<{ trang?: string }>
}

export default async function PostsAdminPage({ searchParams }: PostsAdminPageProps) {
  const params = await searchParams
  const page = parseInt(params.trang || '1')

  const { posts, meta } = await getPosts({ page, limit: 20, status: 'all' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bài viết</h1>
          <p className="text-muted-foreground text-sm">{meta.total} bài viết tổng cộng</p>
        </div>
        <Link href="/admin/bai-viet/tao-moi">
          <Button className="gap-2"><Plus className="h-4 w-4" />Viết bài mới</Button>
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tiêu đề</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Trạng thái</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Lượt xem</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Ngày tạo</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{post.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{post.slug}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status === 'published' ? 'Công bố' : 'Nháp'}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" />{post.view_count.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{formatDate(post.created_at)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {post.status === 'published' && (
                      <Link href={`/bai-viet/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                      </Link>
                    )}
                    <Link href={`/admin/bai-viet/${post.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <DeletePostButton postId={post.id} postTitle={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
