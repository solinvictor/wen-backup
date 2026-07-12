'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, Suspense } from 'react'
import {
  Search, MapPin, ChevronDown, ShoppingCart, X, Menu,
  Home, Wheat, Carrot, Egg, Fish, Leaf, Drumstick,
  Store, Sprout, Info, MessageCircle,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLocation } from '@/context/LocationContext'
import { LocationPicker } from '@/components/LocationPicker'

const TABS = [
  { href: '/store',              label: 'Home',       Icon: Home      },
  { href: '/store?c=vegetables', label: 'Vegetables', Icon: Leaf      },
  { href: '/store?c=grains',     label: 'Grains',     Icon: Wheat     },
  { href: '/store?c=tubers',     label: 'Tubers',     Icon: Carrot    },
  { href: '/store?c=poultry',    label: 'Poultry',    Icon: Drumstick },
  { href: '/store?c=fish',       label: 'Fish',       Icon: Fish      },
  { href: '/store?c=eggs',       label: 'Eggs',       Icon: Egg       },
]

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
    <div className="flex items-center w-full bg-grain-dim border border-soil/10 rounded-full px-4 py-2.5 gap-3 focus-within:border-pepper/50 focus-within:bg-white focus-within:shadow-sm transition-all">
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
  )
}

// ── Cart button ────────────────────────────────────────────────────────────
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

// ── Icon tab bar ───────────────────────────────────────────────────────────
function IconTabBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const c = searchParams?.get('c') ?? ''

  return (
    <div className="border-t border-soil/8">
      {/* Constrained + centered */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex overflow-x-auto scrollbar-hide">
        {TABS.map(({ href, label, Icon }) => {
          const isHome = label === 'Home'
          const active = isHome
            ? pathname === '/store' && !c
            : href.includes(`c=${c}`) && c !== ''

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 shrink-0 px-4 pt-2.5 pb-2 border-b-[2.5px] transition-all min-w-[64px] ${
                active
                  ? 'border-soil text-soil'
                  : 'border-transparent text-stone/45 hover:text-soil/70'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'text-soil' : 'text-stone/50'}
              />
              <span className={`text-[11px] font-semibold whitespace-nowrap tracking-tight ${
                active ? 'text-soil' : 'text-stone/50'
              }`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ── Main StoreNav ──────────────────────────────────────────────────────────
export function StoreNav({ onCartOpen }: { onCartOpen?: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const { location } = useLocation()
  const locationLabel = location?.label ?? 'Set delivery area'

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">

        {/* Constrained wrapper for ALL rows */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Row 1: hamburger | WEN (centered) | login + cart */}
          <div className="flex items-center h-14 gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-soil shrink-0 p-1 -ml-1"
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={2} />
            </button>

            {/* Logo centered via flex-1 trick on both sides */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="font-display text-[22px] font-bold tracking-tight text-soil">
                WEN
              </Link>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/login"
                className="bg-pepper text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
              <CartBtn onClick={onCartOpen ?? (() => {})} />
            </div>
          </div>

          {/* Row 2: location centered */}
          <div className="flex justify-center pb-2">
            <button
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-1.5 group"
            >
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

        {/* Row 4: icon tabs — full width but content constrained inside */}
        <Suspense fallback={<div className="h-[56px] border-t border-soil/8" />}>
          <IconTabBar />
        </Suspense>
      </header>

      {/* Location picker */}
      {locationOpen && <LocationPicker onClose={() => setLocationOpen(false)} />}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-soil/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 h-14 border-b border-soil/10">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="font-display text-2xl font-bold text-soil">
                WEN
              </Link>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-soil/50 hover:text-soil">
                <X size={20} />
              </button>
            </div>

            {/* Location in drawer */}
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

            <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
              {[
                { href: '/store',   label: 'Shop',    Icon: Store         },
                { href: '/farmers', label: 'Farmers', Icon: Sprout        },
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
            </nav>

            <div className="px-5 py-6 border-t border-soil/10 flex flex-col gap-3">
              <Link
                href="/signup"
                onClick={() => setDrawerOpen(false)}
                className="w-full text-center text-[14px] font-semibold bg-soil text-white py-3 rounded-full"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="w-full text-center text-[14px] font-semibold border border-soil/20 text-soil py-3 rounded-full"
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
