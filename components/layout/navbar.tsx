'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, Search, LogOut, User as UserIcon, LayoutDashboard, Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import type { User as AppUser } from '@/lib/types'
import type { User as AuthUser } from '@supabase/supabase-js'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user)
      if (data.user) fetchProfile(data.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('id, display_name, username, avatar_url, role, email, bio, cover_url, website, location, created_at')
      .eq('id', userId)
      .maybeSingle()
    if (data) setProfile(data as AppUser)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Đã đăng xuất')
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/bai-viet', label: 'Bài viết' },
    { href: '/bang-tin', label: 'Bảng tin' },
    { href: '/danh-muc', label: 'Danh mục' },
  ]

  const displayName = profile?.display_name || authUser?.email || 'U'
  const avatarUrl = profile?.avatar_url || ''

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight hover:text-primary transition-colors">
          mylink-blog
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/tim-kiem">
            <Button variant="ghost" size="icon" aria-label="Tìm kiếm">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Chuyển giao diện">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8 rounded-full p-0" />}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  render={<Link href={profile?.username ? `/nguoi-dung/${profile.username}` : '#'} />}
                  className="flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  Trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/bang-tin" />}
                  className="flex items-center gap-2"
                >
                  <Rss className="h-4 w-4" />
                  Bảng tin
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <DropdownMenuItem
                    render={<Link href="/admin" />}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Quản trị
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/dang-nhap">
              <Button size="sm" className="hidden md:flex">Đăng nhập</Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors">{link.label}</Link>
                ))}
                <hr />
                {authUser ? (
                  <>
                    <Link href={profile?.username ? `/nguoi-dung/${profile.username}` : '#'} className="text-lg font-medium hover:text-primary transition-colors">
                      Trang cá nhân
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link href="/admin" className="text-lg font-medium hover:text-primary transition-colors">Quản trị</Link>
                    )}
                    <button onClick={handleLogout} className="text-lg font-medium text-left hover:text-destructive transition-colors">
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link href="/auth/dang-nhap" className="text-lg font-medium hover:text-primary transition-colors">Đăng nhập</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
