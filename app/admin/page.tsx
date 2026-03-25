import { getDashboardStats } from '@/lib/supabase/queries'
import { StatCard } from '@/components/admin/stat-card'
import { getPosts } from '@/lib/supabase/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Eye, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard - Admin' }

export default async function AdminDashboard() {
  const [stats, { posts: recentPosts }] = await Promise.all([
    getDashboardStats(),
    getPosts({ limit: 5, status: 'all' }),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Tổng quan hoạt động blog</p>
        </div>
        <Link href="/admin/bai-viet/tao-moi">
          <Button>Viết bài mới</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Tổng bài viết" value={stats.totalPosts} icon={FileText} description={`${stats.publishedPosts} đã xuất bản`} />
        <StatCard title="Lượt xem" value={stats.totalViews} icon={Eye} description="Tổng lượt xem" />
        <StatCard title="Bình luận" value={stats.totalComments} icon={MessageCircle} description={`${stats.pendingComments} chờ duyệt`} />
        <StatCard title="Đã xuất bản" value={stats.publishedPosts} icon={FileText} description={`/${stats.totalPosts} bài viết`} />
      </div>

      {/* Recent posts */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Bài viết gần đây</h2>
          <Link href="/admin/bai-viet"><Button variant="ghost" size="sm">Xem tất cả</Button></Link>
        </div>
        <div className="divide-y">
          {recentPosts.map(post => (
            <div key={post.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(post.created_at)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status === 'published' ? 'Công bố' : 'Nháp'}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />{post.view_count}
                </span>
                <Link href={`/admin/bai-viet/${post.id}`}>
                  <Button variant="ghost" size="sm">Sửa</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
