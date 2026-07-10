'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import { Search, MapPin, ChevronDown, ShoppingCart, X, Menu } from 'lucide-react'
import { useCart } from '@/context/CartContext'

// ── Search bar ─────────────────────────────────────────────────────────────
function StoreSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') ?? '')

  function go() {
    const q = query.trim()
    router.push(q ? `/store?q=${encodeURIComponent(q)}` : '/store')
  }

  return (
    <div className="flex items-center flex-1 bg-white border-2 border-soil/12 rounded-full hover:border-pepper/40 focus-within:border-pepper focus-within:shadow-md transition-all px-4 py-2 gap-2.5">
      <Search size={17} className="text-stone/45 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="Search produce — tomatoes, yam, catfish…"
        className="flex-1 text-[14px] text-soil placeholder:text-stone/35 bg-transparent outline-none"
      />
      {query && (
        <button onClick={() => { setQuery(''); router.push('/store') }} className="text-stone/40 hover:text-soil transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// ── Cart button ─────────────────────────────────────────────────────────────
function CartBtn({ onClick }: { onClick: () => void }) {
  const { cartCount } = useCart()
  return (
    <button
      onClick={onClick}
      aria-label={`Cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
      className="relative flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border border-soil/12 bg-white hover:border-pepper/30 hover:shadow-sm transition-all text-soil"
    >
      <div className="relative">
        <ShoppingCart size={18} strokeWidth={1.8} />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-pepper text-white font-data text-[9px] font-bold flex items-center justify-center px-0.5">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </div>
      {cartCount > 0 && (
        <span className="text-[13px] font-semibold text-soil">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
      )}
    </button>
  )
}

// ── Main StoreNav ───────────────────────────────────────────────────────────
export function StoreNav({ onCartOpen }: { onCartOpen?: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-grain-dim transition-shadow ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 sm:px-6 h-16">

          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="sm:hidden p-1.5 -ml-1 text-soil shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-soil shrink-0 mr-2"
          >
            WEN
          </Link>

          {/* Location pill — desktop only */}
          <button className="hidden sm:flex items-center gap-1.5 shrink-0 text-[13px] font-medium text-soil/80 hover:text-soil bg-white border border-soil/12 rounded-full px-3 py-2 hover:border-soil/25 transition-all whitespace-nowrap">
            <MapPin size={13} className="text-pepper shrink-0" />
            <span>Makurdi, Benue</span>
            <ChevronDown size={12} className="text-soil/40 ml-0.5" />
          </button>

          {/* Search — takes all remaining space */}
          <div className="flex-1 hidden sm:flex min-w-0">
            <Suspense fallback={
              <div className="flex items-center flex-1 bg-white border-2 border-soil/12 rounded-full px-4 py-2 gap-2.5">
                <Search size={17} className="text-stone/45" />
                <span className="text-[14px] text-stone/35">Search produce…</span>
              </div>
            }>
              <StoreSearchBar />
            </Suspense>
          </div>

          {/* Spacer on mobile */}
          <div className="flex-1 sm:hidden" />

          {/* Right: Log in + cart */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="hidden sm:block text-[13px] font-semibold text-soil/75 hover:text-soil transition-colors px-1"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="hidden sm:block text-[13px] font-semibold bg-pepper text-white px-4 py-2 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap"
            >
              Sign up
            </Link>
            <CartBtn onClick={onCartOpen ?? (() => {})} />
          </div>
        </div>

        {/* Mobile: location + search row */}
        <div className="sm:hidden px-4 pb-3 flex flex-col gap-2">
          <button className="flex items-center gap-1.5 text-[12px] font-medium text-soil/70 hover:text-soil transition-colors self-start">
            <MapPin size={12} className="text-pepper" />
            <span>Makurdi, Benue</span>
            <ChevronDown size={11} className="text-soil/40" />
          </button>
          <Suspense fallback={
            <div className="flex items-center w-full bg-white border-2 border-soil/12 rounded-full px-4 py-2.5 gap-2.5">
              <Search size={16} className="text-stone/45" />
              <span className="text-[14px] text-stone/35">Search produce…</span>
            </div>
          }>
            <StoreSearchBar />
          </Suspense>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-soil/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 h-16 border-b border-soil/10">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="font-display text-2xl font-bold text-soil">WEN</Link>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-soil/50 hover:text-soil">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/store', label: 'Shop' },
                { href: '/farmers', label: 'Farmers' },
                { href: '/buyers', label: 'Buyers' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className="text-[15px] text-soil/80 hover:text-soil py-3 border-b border-soil/6 font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="px-5 py-6 border-t border-soil/10 flex flex-col gap-3">
              <Link href="/signup" onClick={() => setDrawerOpen(false)}
                className="w-full text-center text-[14px] font-semibold bg-soil text-white py-3 rounded-full hover:bg-soil/85 transition-colors">
                Sign up
              </Link>
              <Link href="/login" onClick={() => setDrawerOpen(false)}
                className="w-full text-center text-[14px] font-semibold border border-soil/20 text-soil py-3 rounded-full hover:bg-grain-dim transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
