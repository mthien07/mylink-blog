import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByUsername } from '@/lib/supabase/profile-queries'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfilePostsTab } from '@/components/profile/profile-posts-tab'
import type { Metadata } from 'next'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  const user = await getUserByUsername(username)
  if (!user) return { title: 'Người dùng không tồn tại' }
  return {
    title: user.display_name || `@${user.username}`,
    description: user.bio || `Trang cá nhân của ${user.display_name || user.username}`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const [user, supabase] = await Promise.all([
    getUserByUsername(username),
    createClient(),
  ])

  if (!user) notFound()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  const isOwner = authUser?.id === user.id

  return (
    <div className="min-h-screen">
      <ProfileHeader user={user} isOwner={isOwner} />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <ProfilePostsTab userId={user.id} />
      </div>
    </div>
  )
}
