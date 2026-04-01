import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SidebarLeft } from '@/components/layout/sidebar-left'
import { SidebarRight } from '@/components/layout/sidebar-right'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-2 sm:px-4 py-4">
        <div className="flex gap-3 items-start">
          {/* Left sidebar: desktop only (lg+) */}
          <aside className="hidden lg:block w-[240px] xl:w-[260px] shrink-0">
            <SidebarLeft />
          </aside>

          {/* Main content: center column, max-width like Facebook feed */}
          <main className="flex-1 min-w-0 max-w-[680px] lg:max-w-full xl:max-w-[680px] mx-auto lg:mx-0">
            {children}
          </main>

          {/* Right sidebar: xl only */}
          <aside className="hidden xl:block w-[280px] shrink-0">
            <SidebarRight />
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}
