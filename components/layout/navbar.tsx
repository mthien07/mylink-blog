'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Moon, Sun, Menu, Search, LogOut, User as UserIcon,
  LayoutDashboard, Rss, Home, BookOpen, Grid3X3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import type { User as AppUser } from '@/lib/types'
import type { User as AuthUser } from '@supabase/supabase-js'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/tim-kiem')
    }
  }

  const navLinks = [
    { href: '/', icon: Home, label: 'Trang chủ' },
    { href: '/bai-viet', icon: BookOpen, label: 'Bài viết' },
    { href: '/bang-tin', icon: Rss, label: 'Bảng tin' },
    { href: '/danh-muc', icon: Grid3X3, label: 'Danh mục' },
  ]

  const displayName = profile?.display_name || authUser?.email || 'U'
  const avatarUrl = profile?.avatar_url || ''

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 flex h-14 items-center gap-2">

        {/* Left: Logo + Search */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
            mylink
          </Link>

          {/* Compact search input - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="pl-8 pr-3 h-8 text-sm bg-muted rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 w-44 lg:w-52 transition-all"
            />
          </form>
        </div>

        {/* Center: Nav tabs - desktop */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xl:inline">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile search icon */}
          <Link href="/tim-kiem" className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Tìm kiếm">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Chuyển giao diện"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8 rounded-full p-0" />}>
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(displayName)}</AvatarFallback>
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
              <Button size="sm" className="hidden md:flex h-8 rounded-full px-4">Đăng nhập</Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full" />}>
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-3 mt-8">
                {navLinks.map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-accent">
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
                <hr />
                {authUser ? (
                  <>
                    <Link href={profile?.username ? `/nguoi-dung/${profile.username}` : '#'} className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-accent">
                      <UserIcon className="h-5 w-5" />
                      Trang cá nhân
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-accent">
                        <LayoutDashboard className="h-5 w-5" />
                        Quản trị
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 text-base font-medium text-left hover:text-destructive transition-colors px-2 py-1.5 rounded-lg hover:bg-accent">
                      <LogOut className="h-5 w-5" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link href="/auth/dang-nhap" className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-accent">
                    Đăng nhập
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
