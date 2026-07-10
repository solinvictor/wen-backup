'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Search, Menu, X, ShoppingBasket, MapPin, ChevronDown } from 'lucide-react'

// ── Tab config ─────────────────────────────────────────────────────────────
const TABS = [
  { href: '/',         label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/farmers',  label: 'Farmers' },
  { href: '/buyers',   label: 'Buyers' },
  { href: '/contact',  label: 'Contact' },
]

// ── Search bar (needs Suspense because of useSearchParams) ─────────────────
function NavSearchBar({ size }: { size: 'sm' | 'lg' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') ?? '')

  function go() {
    const q = query.trim()
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  if (size === 'lg') {
    // Desktop: inline search in header row
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

  // Mobile: full-width bar below the top row
  return (
    <div className="flex items-center w-full bg-white border border-soil/15 rounded-full px-4 py-3 gap-2.5 shadow-sm focus-within:border-soil/35 transition-all">
      <Search size={17} className="text-stone/45 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="Search products and farmers"
        className="flex-1 text-[15px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
      />
    </div>
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
            className={`shrink-0 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
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

        {/* ── Row 1: hamburger | logo | login + cart ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 gap-3">

          {/* Left: hamburger (mobile) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 text-soil sm:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-soil sm:shrink-0"
          >
            WEN
          </Link>

          {/* Desktop: search takes middle */}
          <div className="hidden sm:flex flex-1 mx-6">
            <Suspense fallback={
              <div className="flex items-center flex-1 max-w-2xl bg-white border border-soil/15 rounded-full px-4 py-2.5 gap-2">
                <Search size={16} className="text-stone/50" />
                <span className="text-[14px] text-stone/40">Search produce…</span>
              </div>
            }>
              <NavSearchBar size="lg" />
            </Suspense>
          </div>

          {/* Right: Log in + cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-[13px] sm:text-[14px] font-semibold bg-pepper text-white px-4 py-2 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <button
              aria-label="Cart"
              className="flex items-center gap-1 p-2 text-soil hover:bg-soil/5 rounded-full transition-colors"
            >
              <ShoppingBasket size={20} />
              <span className="font-data text-[13px] font-semibold">0</span>
            </button>
          </div>
        </div>

        {/* ── Row 2 (mobile): location selector ── */}
        <div className="sm:hidden flex justify-center pb-2 px-4">
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 hover:text-soil transition-colors">
            <MapPin size={13} className="text-pepper" />
            <span>Makurdi, Benue</span>
            <ChevronDown size={13} className="text-soil/40" />
          </button>
        </div>

        {/* ── Row 3 (mobile): search bar ── */}
        <div className="sm:hidden px-4 pb-3">
          <Suspense fallback={
            <div className="flex items-center w-full bg-white border border-soil/15 rounded-full px-4 py-3 gap-2.5 shadow-sm">
              <Search size={17} className="text-stone/45" />
              <span className="text-[15px] text-stone/40">Search products and farmers</span>
            </div>
          }>
            <NavSearchBar size="sm" />
          </Suspense>
        </div>

        {/* ── Row 4: tab bar ── */}
        <TabBar />
      </header>

      {/* ── Mobile slide-in drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-soil/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 h-14 border-b border-soil/10">
              <span className="font-display text-xl font-bold text-soil">Menu</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-soil/60 hover:text-soil transition-colors">
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
