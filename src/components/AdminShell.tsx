'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, ShoppingCart, ClipboardList, BarChart3, LogOut, Menu, X, Package } from 'lucide-react'

const ADMIN_LINKS = [
  { href: '/admin/farmers', label: 'Farmers', icon: Users },
  { href: '/admin/buyers', label: 'Buyers', icon: ShoppingCart },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const NavLinks = () => (
    <>
      {ADMIN_LINKS.map((link) => {
        const Icon = link.icon
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
              active ? 'bg-grain/10 text-grain' : 'text-grain/60 hover:text-grain hover:bg-grain/5'
            }`}
          >
            <Icon size={16} />
            {link.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen flex bg-grain-dim">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 bg-soil text-grain flex-col shrink-0">
        <div className="px-6 py-6">
          <p className="font-display text-xl">WEN</p>
          <p className="font-data text-[10px] text-grain/40 uppercase tracking-widest mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <NavLinks />
        </nav>
        <div className="px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-grain/60 hover:text-grain hover:bg-grain/5 transition-colors w-full"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden bg-soil text-grain px-4 h-14 flex items-center justify-between shrink-0">
          <div>
            <p className="font-display text-lg leading-none">WEN</p>
            <p className="font-data text-[9px] text-grain/40 uppercase tracking-widest">Admin</p>
          </div>
          <button onClick={() => setOpen(!open)} className="p-1.5 text-grain/70 hover:text-grain transition-colors">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Mobile drawer */}
        {open && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
            <div className="fixed top-14 left-0 right-0 z-50 bg-soil text-grain px-3 py-4 space-y-1 md:hidden shadow-xl">
              <NavLinks />
              <div className="pt-2 border-t border-grain/10 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-grain/60 hover:text-grain hover:bg-grain/5 transition-colors w-full"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
