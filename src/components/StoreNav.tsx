'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import {
  Search, MapPin, ChevronDown, ShoppingCart, X, Menu,
  Home, Wheat, Carrot, Egg, Fish, ShoppingBag, Store,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLocation } from '@/context/LocationContext'
import { LocationPicker } from '@/components/LocationPicker'

// ── Icon tab config ────────────────────────────────────────────────────────
const TABS = [
  { href: '/store',          label: 'Home',    Icon: Home       },
  { href: '/store?c=grains', label: 'Grains',  Icon: Wheat      },
  { href: '/store?c=tubers', label: 'Tubers',  Icon: Carrot     },
  { href: '/store?c=eggs',   label: 'Eggs',    Icon: Egg        },
  { href: '/store?c=fish',   label: 'Fish',    Icon: Fish       },
  { href: '/store?c=pickup', label: 'Pickup',  Icon: ShoppingBag},
  { href: '/store?c=retail', label: 'Retail',  Icon: Store      },
]

// ── Location pill (shared mobile + desktop) ────────────────────────────────
function LocationPill({
  onOpen, size = 'sm',
}: { onOpen: () => void; size?: 'sm' | 'lg' }) {
  const { location } = useLocation()
  const label = location?.label ?? 'Set delivery area'

  if (size === 'lg') {
    return (
      <button
        onClick={onOpen}
        className="flex flex-col items-start leading-tight shrink-0 max-w-[220px] group"
      >
        <span className="text-[11px] text-stone/55 font-medium">Deliver to</span>
        <span className="flex items-center gap-1 text-[14px] font-semibold text-soil group-hover:text-pepper transition-colors">
          <MapPin size={13} className="text-pepper shrink-0" />
          <span className="truncate">{label}</span>
          <ChevronDown size={14} className="text-soil/50 shrink-0" />
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1 min-w-0 leading-tight group"
    >
      <MapPin size={15} className="text-pepper shrink-0" />
      <span className="flex flex-col items-start min-w-0">
        <span className="text-[10px] text-stone/50 font-medium leading-none">Deliver to</span>
        <span className="flex items-center gap-1 text-[13px] font-semibold text-soil leading-tight">
          <span className="truncate max-w-[46vw]">{label}</span>
          <ChevronDown size={13} className="text-soil/45 shrink-0" />
        </span>
      </span>
    </button>
  )
}

// ── Search bar (needs useSearchParams so isolated) ─────────────────────────
function SearchBar({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams?.get('q') ?? '')

  function go() {
    const val = q.trim()
    router.push(val ? `/store?q=${encodeURIComponent(val)}` : '/store')
  }

  if (size === 'lg') {
    return (
      <div className="flex items-center flex-1 max-w-xl bg-grain-dim border border-soil/12 rounded-full px-4 py-2.5 gap-2.5 hover:border-soil/25 focus-within:border-pepper/50 focus-within:bg-white focus-within:shadow-sm transition-all">
        <Search size={16} className="text-stone/50 shrink-0" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder="Search products and farmers"
          className="flex-1 text-[14px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
        />
        {q && (
          <button onClick={() => { setQ(''); router.push('/store') }} className="text-stone/40 hover:text-soil transition-colors shrink-0">
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center w-full bg-grain border border-soil/10 rounded-full px-4 py-2.5 gap-3 focus-within:border-pepper/50 focus-within:bg-white focus-within:shadow-sm transition-all">
      <Search size={17} className="text-stone/45 shrink-0" />
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="Search products and farmers"
        className="flex-1 text-[14px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
      />
      {q && (
        <button
          onClick={() => { setQ(''); router.push('/store') }}
          className="text-stone/40 hover:text-soil transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

// ── Cart button ────────────────────────────────────────────────────────────
function CartBtn({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  const { cartCount } = useCart()
  return (
    <button
      onClick={onClick}
      aria-label={`Cart, ${cartCount} items`}
      className={`relative flex items-center justify-center text-soil rounded-full hover:bg-soil/6 active:bg-soil/10 transition-colors ${compact ? 'w-10 h-10' : 'w-11 h-11'}`}
    >
      <ShoppingCart size={compact ? 21 : 23} strokeWidth={1.8} />
      {cartCount > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-pepper text-white text-[10px] font-bold leading-none">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  )
}

// ── Icon tab bar (mobile only — desktop uses the store sidebar) ────────────
function IconTabBar() {
  const pathname  = usePathname()
  const searchParams = useSearchParams()
  const c = searchParams?.get('c') ?? ''

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-1 px-3 py-2.5 snap-x snap-mandatory">
      {TABS.map(({ href, label, Icon }) => {
        const isHome   = label === 'Home'
        const active   = isHome
          ? (pathname === '/store' && !c)
          : href.includes(`c=${c}`) && c !== ''
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1.5 shrink-0 w-16 snap-start"
          >
            <span
              className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all ${
                active
                  ? 'bg-pepper/10 border-pepper text-pepper'
                  : 'bg-grain border-soil/10 text-soil/60'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
            </span>
            <span className={`text-[11px] font-medium whitespace-nowrap ${active ? 'text-soil' : 'text-stone/60'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

// ── Main StoreNav ──────────────────────────────────────────────────────────
export function StoreNav({ onCartOpen }: { onCartOpen?: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-grain-dim shadow-sm">

        {/* ── Desktop: single-row Instacart-style nav (lg and up) ── */}
        <div className="hidden lg:flex items-center h-16 px-6 xl:px-10 gap-5 max-w-7xl mx-auto w-full">
          <Link href="/store" className="font-display text-2xl font-bold tracking-tight text-soil shrink-0">
            WEN
          </Link>

          <div className="w-px h-8 bg-soil/10 shrink-0" />

          <LocationPill onOpen={() => setLocationOpen(true)} size="lg" />

          <Suspense fallback={
            <div className="flex-1 max-w-xl bg-grain-dim border border-soil/12 rounded-full px-4 py-2.5 flex items-center gap-2.5">
              <Search size={16} className="text-stone/50" />
              <span className="text-[14px] text-stone/40">Search products and farmers</span>
            </div>
          }>
            <SearchBar size="lg" />
          </Suspense>

          <div className="flex-1" />

          <nav className="flex items-center gap-1 shrink-0">
            {[
              { href: '/farmers', label: 'Farmers' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-medium text-soil/70 hover:text-soil px-3 py-2 rounded-full hover:bg-soil/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/login"
            className="bg-pepper text-white text-[14px] font-semibold px-5 py-2.5 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap shrink-0"
          >
            Log in
          </Link>

          <CartBtn onClick={onCartOpen ?? (() => {})} compact />
        </div>

        {/* ── Mobile / tablet: compact 3-row nav (below lg) ── */}
        <div className="lg:hidden">
          {/* Row 1: hamburger + logo/location | cart */}
          <div className="flex items-center justify-between pl-3 pr-2 h-14 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 -ml-1 flex items-center justify-center text-soil shrink-0 rounded-full hover:bg-soil/6 active:bg-soil/10 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.8} />
              </button>
              <div className="w-px h-6 bg-soil/10 shrink-0" />
              <LocationPill onOpen={() => setLocationOpen(true)} />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/login"
                className="text-soil text-[13px] font-semibold px-3 py-2 rounded-full hover:bg-soil/6 transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
              <CartBtn onClick={onCartOpen ?? (() => {})} compact />
            </div>
          </div>

          {/* Row 2: search bar */}
          <div className="px-3 pb-2.5">
            <Suspense fallback={
              <div className="flex items-center w-full bg-white border border-soil/15 rounded-full px-4 py-2.5 gap-3 shadow-sm">
                <span className="flex-1 text-[14px] text-stone/40">Search products and farmers</span>
                <Search size={17} className="text-stone/50 shrink-0" />
              </div>
            }>
              <SearchBar />
            </Suspense>
          </div>

          {/* Row 3: icon tab bar */}
          <Suspense fallback={<div className="h-[84px]" />}>
            <IconTabBar />
          </Suspense>
        </div>

      </header>

      {/* Location picker sheet */}
      {locationOpen && <LocationPicker onClose={() => setLocationOpen(false)} />}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-soil/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 h-14 border-b border-soil/10">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="font-display text-2xl font-bold text-soil">WEN</Link>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-soil/50 hover:text-soil">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
              {[
                { href: '/',        label: 'Home'    },
                { href: '/store',   label: 'Shop'    },
                { href: '/farmers', label: 'Farmers' },
                  { href: '/about',   label: 'About'   },
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
                className="w-full text-center text-[14px] font-semibold bg-soil text-white py-3 rounded-full">
                Sign up
              </Link>
              <Link href="/login" onClick={() => setDrawerOpen(false)}
                className="w-full text-center text-[14px] font-semibold border border-soil/20 text-soil py-3 rounded-full">
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
