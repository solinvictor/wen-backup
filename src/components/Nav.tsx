'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import {
  Search, Menu, X, MapPin, ChevronDown, ShoppingCart,
  Home, ShoppingBag, Sprout, Phone
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLocation } from '@/context/LocationContext'
import { LocationPicker } from '@/components/LocationPicker'
import { Logo } from '@/components/Logo'

const TABS = [
  { href: '/',        label: 'Home',    icon: Home },
  { href: '/store',   label: 'Shop',    icon: ShoppingBag },
  { href: '/farmers', label: 'Farmers', icon: Sprout },
  { href: '/contact', label: 'Contact', icon: Phone },
]

function NavSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') ?? '')

  function go() {
    const q = query.trim()
    router.push(q ? `/store?q=${encodeURIComponent(q)}` : '/store')
  }

  return (
    <div className="flex items-center w-full bg-transparent border border-soil/25 rounded-full px-4 py-2 sm:py-2.5 gap-2 hover:border-soil/40 focus-within:border-soil/60 focus-within:bg-white/60 transition-all">
      <Search size={16} className="text-stone/50 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="Search produce - Chicken, Eggs, Tomatoes, Catfish..."
        aria-label="Search produce"
        className="flex-1 min-w-0 text-[13px] sm:text-[14px] text-soil placeholder:text-stone/50 placeholder:italic bg-transparent outline-none"
      />
    </div>
  )
}

// Auth-aware cart — only shown when user is logged in
function CartButton() {
  const { cartCount } = useCart()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }: any) => {
        setAuthed(!!data?.user)
      })
      const { data } = supabase.auth.onAuthStateChange((_: any, session: any) => {
        setAuthed(!!session?.user)
      })
      return () => data.subscription.unsubscribe()
    } catch {}
  }, [])

  if (!authed) return null

  return (
    <Link
      href="/cart"
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

function LocationPill({ onClick }: { onClick: () => void }) {
  const { location } = useLocation()
  const label = location?.label ?? 'Set location'
  const isSet = !!location

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-soil"
      style={{ color: isSet ? 'var(--color-soil)' : 'var(--color-stone)' }}
    >
      <MapPin size={13} className={isSet ? 'text-pepper' : 'text-stone/50'} />
      <span className="max-w-[160px] truncate">{label}</span>
      <ChevronDown size={13} className="text-soil/35 shrink-0" />
    </button>
  )
}

function TabBar() {
  const pathname = usePathname()
  if (pathname === '/') return null

  return (
    <div className="flex overflow-x-auto scrollbar-hide border-t border-soil/8 bg-mint sm:px-4">
      {TABS.map(tab => {
        const active = tab.href === '/' ? pathname === '/' : pathname?.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              active ? 'border-soil text-soil' : 'border-transparent text-stone/70 hover:text-soil'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

export function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [hasAccount, setHasAccount] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    try { setHasAccount(!!localStorage.getItem('wen_has_account')) } catch {}
  }, [])

  useEffect(() => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }: any) => {
        setAuthed(!!data?.user)
        if (data?.user) { try { localStorage.setItem('wen_has_account', '1') } catch {} }
      })
      const { data } = supabase.auth.onAuthStateChange((_: any, session: any) => {
        setAuthed(!!session?.user)
        if (session?.user) { try { localStorage.setItem('wen_has_account', '1') } catch {} }
      })
      return () => data.subscription.unsubscribe()
    } catch {}
  }, [])

  return (
    <>
      {/* Scrolls away with the page before the header below takes over — gives the very
          top of the page a little breathing room instead of the nav sitting flush at y=0. */}
      <div className="h-3 sm:h-5 bg-mint" aria-hidden="true" />

      <header className="sticky top-0 z-50 bg-mint">
        <div className="max-w-6xl mx-auto px-3 min-[360px]:px-4 sm:px-8">

          {/* Row 1: logo + auth actions */}
          <div className="flex items-center h-16 sm:h-[72px] gap-1 min-[360px]:gap-2 sm:gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="sm:hidden -ml-2 p-1.5 text-soil shrink-0"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Compact on phones so the row fits at 360px, larger from sm up */}
            <Logo height={20} smHeight={26} className="shrink-0 -ml-1 sm:ml-0" />

            <div className="flex-1" />

            {/* Location: desktop only (mobile has it in the drawer) */}
            <div className="hidden md:block mr-2">
              <LocationPill onClick={() => setPickerOpen(true)} />
            </div>

            <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-2 shrink-0">
              {authed ? (
                <>
                  <Link
                    href="/store"
                    className="hidden sm:inline-flex text-[13px] font-semibold text-soil/75 hover:text-soil transition-colors px-2"
                  >
                    Shop
                  </Link>
                  <CartButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[11px] sm:text-[13px] font-medium text-soil border border-soil/40 hover:border-soil hover:bg-white/60 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors whitespace-nowrap"
                  >
                    Welcome Back
                  </Link>
                  {!hasAccount && (
                    <Link
                      href="/signup"
                      className="text-[11px] sm:text-[13px] font-semibold bg-leaf text-soil hover:bg-leaf-deep px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors whitespace-nowrap"
                    >
                      Get Started
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Row 2: search */}
          <div className="pb-4 sm:pb-5">
            <Suspense fallback={
              <div className="flex items-center w-full border border-soil/25 rounded-full px-4 py-2 gap-2">
                <Search size={16} className="text-stone/50" />
                <span className="text-[13px] italic text-stone/50">Search produce - Chicken, Eggs, Tomatoes, Catfish...</span>
              </div>
            }>
              <NavSearchBar />
            </Suspense>
          </div>
        </div>

        <TabBar />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-soil/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 h-14 border-b border-soil/10">
              <Logo height={24} onClick={() => setDrawerOpen(false)} />
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-soil/50 hover:text-soil transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-3.5 border-b border-soil/8">
              <LocationPill onClick={() => { setDrawerOpen(false); setPickerOpen(true) }} />
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
              {TABS.map(tab => {
                const Icon = tab.icon
                const active = tab.href === '/' ? pathname === '/' : pathname?.startsWith(tab.href)
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                      active ? 'bg-soil/6 text-soil font-semibold' : 'text-soil/70 hover:bg-soil/4 hover:text-soil font-medium'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-pepper' : 'text-stone/60'} strokeWidth={1.8} />
                    <span className="text-[15px]">{tab.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="px-5 py-6 border-t border-soil/10 flex flex-col gap-3">
              {authed ? (
                <Link href="/store" onClick={() => setDrawerOpen(false)}
                  className="w-full text-center text-[14px] font-semibold bg-pepper text-white py-3 rounded-full">
                  Go to shop
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setDrawerOpen(false)}
                    className="w-full text-center text-[14px] font-semibold bg-soil text-white py-3 rounded-full hover:bg-soil/85 transition-colors">
                    Log in
                  </Link>
                  {!hasAccount && (
                    <Link href="/signup" onClick={() => setDrawerOpen(false)}
                      className="w-full text-center text-[14px] font-semibold border border-soil/20 text-soil py-3 rounded-full hover:bg-grain-dim transition-colors">
                      Sign up
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {pickerOpen && <LocationPicker onClose={() => setPickerOpen(false)} />}
    </>
  )
}
