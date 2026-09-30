'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import {
  Search, MapPin, ChevronDown, ShoppingCart, X, Menu, LogOut, User,
  ShoppingBag, Trees, Info, MessageCircle, Package, SlidersHorizontal,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLocation } from '@/context/LocationContext'
import { LocationPicker } from '@/components/LocationPicker'
import { ACTIVE_CATEGORY_META } from '@/lib/categories'
import { CategoryChip } from '@/components/CategoryChip'
import { Logo } from '@/components/Logo'

// ── Search ─────────────────────────────────────────────────────────────────
function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams?.get('q') ?? '')

  function go() {
    const val = q.trim()
    router.push(val ? `/store?q=${encodeURIComponent(val)}` : '/store')
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center flex-1 min-w-0 bg-grain-dim border border-soil/10 rounded-full px-4 py-2.5 gap-3 focus-within:border-pepper/50 focus-within:bg-white focus-within:shadow-sm transition-all">
        <Search size={16} className="text-stone/50 shrink-0" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder="Search produce — tomatoes, yam, catfish…"
          className="flex-1 min-w-0 text-[14px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
        />
        {q && (
          <button onClick={() => { setQ(''); router.push('/store') }} className="text-stone/40 hover:text-soil transition-colors shrink-0">
            <X size={15} />
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Filter"
        className="shrink-0 w-[42px] h-[42px] rounded-full bg-grain-dim border border-soil/10 flex items-center justify-center text-soil/60 hover:text-soil hover:border-soil/25 transition-colors"
      >
        <SlidersHorizontal size={16} />
      </button>
    </div>
  )
}

// ── Cart button ─────────────────────────────────────────────────────────────
function CartBtn({ onClick }: { onClick: () => void }) {
  const { cartCount } = useCart()
  return (
    <button
      onClick={onClick}
      aria-label={`Cart, ${cartCount} items`}
      className="relative flex items-center justify-center text-soil p-1"
    >
      <ShoppingCart size={24} strokeWidth={2} />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-pepper text-white text-[10px] font-bold leading-none">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  )
}

// ── Category chip row ────────────────────────────────────────────────────────
function CategoryRow() {
  const searchParams = useSearchParams()
  const c = searchParams?.get('c') ?? ''

  return (
    <div className="border-t border-soil/8 py-3">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {ACTIVE_CATEGORY_META.map((cat) => (
          <CategoryChip
            key={cat.slug}
            category={cat}
            active={c === cat.slug}
            href={`/store?c=${cat.slug}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Auth area ───────────────────────────────────────────────────────────────
function AuthArea({
  onCartOpen,
  user,
  onLogout,
}: {
  onCartOpen?: () => void
  user: { email: string; name: string } | null
  onLogout: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex items-center gap-3 shrink-0">
      {user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={`Open account menu for ${user.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-soil/12 bg-white shadow-sm transition-all hover:border-pepper/40 hover:shadow-md"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pepper text-[11px] font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white border border-soil/10 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-soil/8">
                  <p className="text-[13px] font-semibold text-soil truncate">{user.name}</p>
                  <p className="text-[11px] text-stone/50 truncate">{user.email}</p>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-soil/75 hover:bg-grain-dim hover:text-soil transition-colors"
                >
                  <Package size={14} className="text-stone/50" />
                  My orders
                </Link>
                <Link
                  href="/account?tab=profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-soil/75 hover:bg-grain-dim hover:text-soil transition-colors"
                >
                  <User size={14} className="text-stone/50" />
                  Edit profile
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); onLogout() }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 transition-colors border-t border-soil/8"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-pepper text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap"
        >
          Log in
        </Link>
      )}
      <CartBtn onClick={onCartOpen ?? (() => {})} />
    </div>
  )
}

// ── Main StoreNav ──────────────────────────────────────────────────────────
export function StoreNav({ onCartOpen }: { onCartOpen?: () => void }) {
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [user, setUser]                 = useState<{ email: string; name: string } | null>(null)
  const router                          = useRouter()
  const { location }                    = useLocation()
  const locationLabel                   = location?.label ?? 'Set delivery area'

  // ── Load auth session ─────────────────────────────────────────────────────
  useEffect(() => {
    const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return

    let sub: { unsubscribe: () => void } | null = null
    try {
      const { createClient } = require('@/lib/supabase/client') as typeof import('@/lib/supabase/client')
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }: { data: { user: { email?: string; user_metadata?: { full_name?: string } } | null } }) => {
        if (data.user) {
          const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Account'
          setUser({ email: data.user.email ?? '', name })
        }
      })
      const { data } = supabase.auth.onAuthStateChange((_event: string, session: { user: { email?: string; user_metadata?: { full_name?: string } } } | null) => {
        if (session?.user) {
          const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Account'
          setUser({ email: session.user.email ?? '', name })
          try { localStorage.setItem('wen_has_account', '1') } catch {}
        } else {
          setUser(null)
        }
      })
      sub = data.subscription
    } catch { /* no env vars or client error */ }
    return () => sub?.unsubscribe()
  }, [])

  async function handleLogout() {
    try {
      const { createClient } = require('@/lib/supabase/client') as typeof import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* no-op */ }
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-soil/6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Row 1: hamburger | WEN | auth + cart */}
          <div className="flex items-center h-14 gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-soil shrink-0 p-1 -ml-1"
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
            <div className="flex-1 flex justify-center">
              <Logo height={24} />
            </div>
            <AuthArea onCartOpen={onCartOpen} user={user} onLogout={handleLogout} />
          </div>

          {/* Row 2: location */}
          <div className="flex justify-center pb-2">
            <button onClick={() => setLocationOpen(true)} className="flex items-center gap-1.5 group">
              <MapPin size={14} className="text-pepper shrink-0" />
              <span className="text-[14px] font-semibold text-soil group-hover:text-pepper transition-colors truncate max-w-[60vw]">
                {locationLabel}
              </span>
              <ChevronDown size={13} className="text-soil/40 shrink-0" />
            </button>
          </div>

          {/* Row 3: search */}
          <div className="pb-3">
            <Suspense fallback={
              <div className="flex items-center w-full bg-grain-dim border border-soil/10 rounded-full px-4 py-2.5 gap-3">
                <Search size={16} className="text-stone/50" />
                <span className="text-[14px] text-stone/40">Search produce…</span>
              </div>
            }>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        {/* Row 4: category chips */}
        <Suspense fallback={<div className="h-[64px] border-t border-soil/8" />}>
          <CategoryRow />
        </Suspense>
      </header>

      {locationOpen && <LocationPicker onClose={() => setLocationOpen(false)} />}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-soil/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 h-14 border-b border-soil/10">
              <Logo height={24} onClick={() => setDrawerOpen(false)} />
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-soil/50 hover:text-soil">
                <X size={20} />
              </button>
            </div>

            {/* Location */}
            <div className="px-5 py-3.5 border-b border-soil/8">
              <button
                onClick={() => { setDrawerOpen(false); setLocationOpen(true) }}
                className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 hover:text-soil transition-colors"
              >
                <MapPin size={13} className="text-pepper" />
                <span className="truncate max-w-[180px]">{locationLabel}</span>
                <ChevronDown size={13} className="text-soil/35" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
              {[
                { href: '/store',   label: 'Shop',    Icon: ShoppingBag   },
                { href: '/farmers', label: 'Farmers', Icon: Trees        },
                { href: '/about',   label: 'About',   Icon: Info          },
                { href: '/contact', label: 'Contact', Icon: MessageCircle },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-soil/75 hover:bg-soil/4 hover:text-soil font-medium transition-colors group"
                >
                  <Icon size={18} strokeWidth={2} className="text-stone/50 group-hover:text-pepper transition-colors shrink-0" />
                  <span className="text-[15px]">{label}</span>
                </Link>
              ))}

              {/* Auth links inside drawer — shown when logged in */}
              {user && (
                <>
                  <div className="h-px bg-soil/8 mx-3 my-1" />
                  <Link
                    href="/account"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-soil/75 hover:bg-soil/4 hover:text-soil font-medium transition-colors group"
                  >
                    <Package size={18} strokeWidth={2} className="text-stone/50 group-hover:text-pepper transition-colors shrink-0" />
                    <span className="text-[15px]">My orders</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Drawer footer — auth-aware */}
            <div className="px-5 py-6 border-t border-soil/10">
              {user ? (
                <div className="flex flex-col gap-3">
                  {/* User pill */}
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-grain-dim rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-pepper flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-soil truncate">{user.name}</p>
                      <p className="text-[11px] text-stone/45 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setDrawerOpen(false); handleLogout() }}
                    className="w-full flex items-center justify-center gap-2 text-[14px] font-semibold border border-red-200 text-red-500 py-3 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full text-center text-[14px] font-semibold bg-soil text-white py-3 rounded-full"
                  >
                    Log in
                  </Link>
                  {typeof window !== 'undefined' && !localStorage.getItem('wen_has_account') && (
                    <Link
                      href="/signup"
                      onClick={() => setDrawerOpen(false)}
                      className="w-full text-center text-[14px] font-semibold border border-soil/20 text-soil py-3 rounded-full"
                    >
                      Sign up
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
