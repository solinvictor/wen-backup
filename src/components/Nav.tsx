'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Search, Menu, X, MapPin, ChevronDown, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

// ── Tab config ─────────────────────────────────────────────────────────────
const TABS = [
  { href: '/',         label: 'Home' },
  { href: '/store',    label: 'Shop'     },
  { href: '/farmers',  label: 'Farmers' },
  { href: '/contact',  label: 'Contact' },
]

// ── Search bar ─────────────────────────────────────────────────────────────
function NavSearchBar({ size }: { size: 'sm' | 'lg' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') ?? '')

  function go() {
    const q = query.trim()
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  if (size === 'lg') {
    return (
      <div className="flex items-center flex-1 max-w-2xl bg-white border border-soil/15 rounded-full px-4 py-2.5 gap-2 hover:border-soil/30 focus-within:border-soil/40 focus-within:shadow-sm transition-all">
        <Search size={16} className="text-stone/50 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder="Search produce — tomatoes, yam, catfish…"
          className="flex-1 text-[14px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center w-full bg-white border border-soil/15 rounded-full px-4 py-3 gap-2.5 shadow-sm focus-within:border-soil/35 transition-all">
      <Search size={17} className="text-stone/45 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="Search produce…"
        className="flex-1 min-w-0 text-[15px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
      />
    </div>
  )
}

// ── Cart icon with live badge ───────────────────────────────────────────────
function CartButton() {
  const { cartCount } = useCart()

  return (
    <Link
      href="/store"
      aria-label={`Cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
      className="relative flex items-center justify-center w-9 h-9 text-soil hover:bg-soil/6 rounded-full transition-colors"
    >
      <ShoppingCart size={22} strokeWidth={1.8} />
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-pepper text-white font-data text-[10px] font-bold flex items-center justify-center leading-none px-1">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  )
}

// ── Tab bar ────────────────────────────────────────────────────────────────
function TabBar() {
  const pathname = usePathname()

  return (
    <div className="flex overflow-x-auto scrollbar-hide border-t border-soil/8">
      {TABS.map(tab => {
        const active = tab.href === '/'
          ? pathname === '/'
          : pathname?.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 px-4 sm:px-5 py-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              active
                ? 'border-soil text-soil'
                : 'border-transparent text-stone/70 hover:text-soil'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

// ── Main Nav ───────────────────────────────────────────────────────────────
export function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-grain-dim shadow-sm">

        {/* Row 1: hamburger | logo | login + cart */}
        <div className="flex items-center px-4 sm:px-6 h-14 gap-3">

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 text-soil sm:hidden shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-soil shrink-0 ml-1.5 sm:ml-0 sm:mr-6"
          >
            WEN
          </Link>

          {/* Desktop: search fills middle */}
          <div className="hidden sm:flex flex-1 mx-4">
            <Suspense fallback={
              <div className="flex items-center flex-1 max-w-2xl bg-white border border-soil/15 rounded-full px-4 py-2.5 gap-2">
                <Search size={16} className="text-stone/50" />
                <span className="text-[14px] text-stone/40">Search produce…</span>
              </div>
            }>
              <NavSearchBar size="lg" />
            </Suspense>
          </div>

          {/* Spacer on mobile */}
          <div className="flex-1 sm:hidden" />

          {/* Right: Log in + cart */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/login"
              className="text-[13px] sm:text-[14px] font-semibold bg-pepper text-white px-4 py-2 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <CartButton />
          </div>
        </div>

        {/* Row 2 (mobile): location selector */}
        <div className="sm:hidden flex justify-center pb-2 px-4">
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 hover:text-soil transition-colors">
            <MapPin size={13} className="text-pepper" />
            <span>Makurdi, Benue</span>
            <ChevronDown size={13} className="text-soil/40" />
          </button>
        </div>

        {/* Row 3 (mobile): search bar */}
        <div className="sm:hidden px-4 pb-3">
          <Suspense fallback={
            <div className="flex items-center w-full bg-white border border-soil/15 rounded-full px-4 py-3 gap-2.5 shadow-sm">
              <Search size={17} className="text-stone/45" />
              <span className="text-[15px] text-stone/40">Search produce…</span>
            </div>
          }>
            <NavSearchBar size="sm" />
          </Suspense>
        </div>

        {/* Row 4: tab bar */}
        <TabBar />
      </header>

      {/* Mobile slide-in drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-soil/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 h-14 border-b border-soil/10">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="font-display text-2xl font-bold tracking-tight text-soil"
              >
                WEN
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-soil/50 hover:text-soil transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
              {TABS.map(tab => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setDrawerOpen(false)}
                  className="text-[15px] text-soil/80 hover:text-soil py-3 border-b border-soil/6 transition-colors font-medium"
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            <div className="px-5 py-6 border-t border-soil/10 flex flex-col gap-3">
              <Link
                href="/signup"
                onClick={() => setDrawerOpen(false)}
                className="w-full text-center text-[14px] font-semibold bg-soil text-white py-3 rounded-full hover:bg-soil/85 transition-colors"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="w-full text-center text-[14px] font-semibold border border-soil/20 text-soil py-3 rounded-full hover:bg-grain-dim transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
