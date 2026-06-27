'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, ShoppingCart, ClipboardList, BarChart3, LogOut } from 'lucide-react'

const ADMIN_LINKS = [
  { href: '/admin/farmers', label: 'Farmers', icon: Users },
  { href: '/admin/buyers', label: 'Buyers', icon: ShoppingCart },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-grain-dim">
      <aside className="w-56 bg-soil text-grain flex flex-col shrink-0">
        <div className="px-6 py-6">
          <p className="font-display text-xl">WEN</p>
          <p className="font-data text-[10px] text-grain/40 uppercase tracking-widest mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  active ? 'bg-grain/10 text-grain' : 'text-grain/60 hover:text-grain hover:bg-grain/5'
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            )
          })}
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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
