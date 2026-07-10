'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import {
  Search, MapPin, ChevronDown, ShoppingCart, X, Menu,
  Home, Wheat, Carrot, Egg, Fish, ShoppingBag, Store,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'

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

// ── Search bar (needs useSearchParams so isolated) ─────────────────────────
function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams?.get('q') ?? '')

  function go() {
    const val = q.trim()
    router.push(val ? `/store?q=${encodeURIComponent(val)}` : '/store')
  }

  return (
    <div className="flex items-center w-full bg-white border border-soil/15 rounded-full px-4 py-3 gap-3 shadow-sm focus-within:border-pepper/50 focus-within:shadow-md transition-all">
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="Search products and farmers"
        className="flex-1 text-[15px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
      />
      {q ? (
        <button
          onClick={() => { setQ(''); router.push('/store') }}
          className="text-stone/40 hover:text-soil transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      ) : (
        <button onClick={go} className="shrink-0 text-stone/50 hover:text-soil transition-colors">
          <Search size={18} />
        </button>
      )}
    </div>
  )
}

// ── Cart button ────────────────────────────────────────────────────────────
function CartBtn({ onClick }: { onClick: () => void }) {
  const { cartCount } = useCart()
  return (
    <button
      onClick={onClick}
      aria-label={`Cart, ${cartCount} items`}
      className="relative flex items-center gap-1.5 text-soil"
    >
      <ShoppingCart size={26} strokeWidth={1.7} />
      <span className="text-[15px] font-semibold">{cartCount}</span>
    </button>
  )
}

// ── Icon tab bar ───────────────────────────────────────────────────────────
function IconTabBar() {
  const pathname  = usePathname()
  const searchParams = useSearchParams()
  const c = searchParams?.get('c') ?? ''

  return (
    <div className="flex overflow-x-auto scrollbar-hide border-t border-soil/8">
      {TABS.map(({ href, label, Icon }) => {
        const isHome   = label === 'Home'
        const active   = isHome
          ? (pathname === '/store' && !c)
          : href.includes(`c=${c}`) && c !== ''
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1.5 shrink-0 px-5 py-3 border-b-2 transition-colors ${
              active
                ? 'border-soil text-soil'
                : 'border-transparent text-stone/55 hover:text-soil'
            }`}
          >
            <Icon
              size={24}
              strokeWidth={active ? 2.2 : 1.6}
              className="transition-all"
            />
            <span className="text-[12px] font-medium whitespace-nowrap">{label}</span>
          </Link>
        )
      })}
    </div>
  )
}

// ── Main StoreNav ──────────────────────────────────────────────────────────
export function StoreNav({ onCartOpen }: { onCartOpen?: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-grain-dim shadow-sm">

        {/* Row 1: hamburger | logo | login | cart */}
        <div className="flex items-center justify-between px-4 h-14 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-soil"
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={1.8} />
            </button>
            <Link href="/store" className="font-display text-2xl font-bold tracking-tight text-soil">
              WEN
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-pepper text-white text-[14px] font-semibold px-5 py-2 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <CartBtn onClick={onCartOpen ?? (() => {})} />
          </div>
        </div>

        {/* Row 2: location/zipcode — centered */}
        <div className="flex justify-center pb-2">
          <button className="flex items-center gap-1.5 text-[14px] font-semibold text-soil hover:text-pepper transition-colors">
            <MapPin size={14} className="text-pepper" />
            <span>Makurdi, Benue</span>
            <ChevronDown size={14} className="text-soil/50" />
          </button>
        </div>

        {/* Row 3: search bar */}
        <div className="px-4 pb-3">
          <Suspense fallback={
            <div className="flex items-center w-full bg-white border border-soil/15 rounded-full px-4 py-3 gap-3 shadow-sm">
              <span className="flex-1 text-[15px] text-stone/40">Search products and farmers</span>
              <Search size={18} className="text-stone/50 shrink-0" />
            </div>
          }>
            <SearchBar />
          </Suspense>
        </div>

        {/* Row 4: icon tab bar */}
        <Suspense fallback={<div className="h-[68px] border-t border-soil/8" />}>
          <IconTabBar />
        </Suspense>

      </header>

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
                { href: '/buyers',  label: 'Buyers'  },
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
