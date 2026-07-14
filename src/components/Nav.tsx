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

const TABS = [
  { href: '/',        label: 'Home',    icon: Home },
  { href: '/store',   label: 'Shop',    icon: ShoppingBag },
  { href: '/farmers', label: 'Farmers', icon: Sprout },
  { href: '/contact', label: 'Contact', icon: Phone },
]

function NavSearchBar({ size }: { size: 'sm' | 'lg' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') ?? '')

  function go() {
    const q = query.trim()
    router.push(q ? `/store?q=${encodeURIComponent(q)}` : '/store')
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
        placeholder="Search products and farmers"
        className="flex-1 text-[15px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
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
    <div className="flex overflow-x-auto scrollbar-hide border-t border-soil/8">
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
  const pathname = usePathname()

  useEffect(() => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }: any) => setAuthed(!!data?.user))
      const { data } = supabase.auth.onAuthStateChange((_: any, session: any) => {
        setAuthed(!!session?.user)
      })
      return () => data.subscription.unsubscribe()
    } catch {}
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 bg-grain-dim shadow-sm">

        {/* Row 1 */}
        <div className="flex items-center px-4 sm:px-6 h-14 gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 text-soil sm:hidden shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-soil shrink-0 ml-1.5 sm:ml-0 sm:mr-6">
            WEN
          </Link>

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

          <div className="flex-1 sm:hidden" />

          {/* Auth-aware right side */}
          <div className="flex items-center gap-2 shrink-0">
            {authed ? (
              <CartButton />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[13px] font-semibold text-soil/70 hover:text-soil transition-colors whitespace-nowrap hidden sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-[13px] sm:text-[14px] font-semibold bg-pepper text-white px-4 py-2 rounded-full hover:bg-pepper-deep transition-colors whitespace-nowrap"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Row 2 (mobile): location pill */}
        <div className="sm:hidden flex justify-center pb-2 px-4">
          <LocationPill onClick={() => setPickerOpen(true)} />
        </div>

        {/* Row 2 (desktop): location pill */}
        <div className="hidden sm:flex items-center px-6 pb-2 gap-3">
          <LocationPill onClick={() => setPickerOpen(true)} />
        </div>

        {/* Row 3 (mobile): search bar */}
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

        <TabBar />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-soil/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 h-14 border-b border-soil/10">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="font-display text-2xl font-bold tracking-tight text-soil">
                WEN
              </Link>
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
                  <Link href="/signup" onClick={() => setDrawerOpen(false)}
                    className="w-full text-center text-[14px] font-semibold bg-soil text-white py-3 rounded-full hover:bg-soil/85 transition-colors">
                    Sign up
                  </Link>
                  <Link href="/login" onClick={() => setDrawerOpen(false)}
                    className="w-full text-center text-[14px] font-semibold border border-soil/20 text-soil py-3 rounded-full hover:bg-grain-dim transition-colors">
                    Log in
                  </Link>
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
