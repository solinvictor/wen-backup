'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Search, Menu, X } from 'lucide-react'

function NavSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') ?? '')

  function handleSearch() {
    const q = query.trim()
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  return (
    <div className="flex items-center w-full max-w-xl bg-white border border-soil/14 rounded-full px-4 py-2 gap-2 hover:border-soil/30 focus-within:border-soil/40 focus-within:shadow-sm transition-all">
      <Search size={16} className="text-stone/50 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Search produce — tomatoes, yam, catfish…"
        className="flex-1 text-[14px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
      />
    </div>
  )
}

const NAV_LINKS = [
  { href: '/about',    label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/farmers',  label: 'Farmers' },
  { href: '/buyers',   label: 'Buyers' },
  { href: '/contact',  label: 'Contact' },
]

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-soil/10">
      {/* Main bar */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-soil shrink-0 mr-2">
          WEN
        </Link>

        {/* Search — center, takes remaining space */}
        <div className="flex-1 hidden sm:flex">
          <Suspense fallback={
            <div className="flex items-center w-full max-w-xl bg-grain-dim border border-soil/14 rounded-full px-4 py-2 gap-2">
              <Search size={16} className="text-stone/50 shrink-0" />
              <span className="text-[14px] text-stone/40">Search produce…</span>
            </div>
          }>
            <NavSearch />
          </Suspense>
        </div>

        {/* Right — auth buttons */}
        <div className="hidden sm:flex items-center gap-3 ml-2 shrink-0">
          <Link
            href="/login"
            className="text-[13px] font-medium text-soil/70 hover:text-soil transition-colors px-1"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-[13px] font-medium bg-soil text-white px-4 py-2 rounded-full hover:bg-soil/85 transition-colors"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden ml-auto p-2 text-soil"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-5 pb-3">
        <Suspense fallback={null}>
          <NavSearch />
        </Suspense>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden border-t border-soil/10 px-5 py-4 flex flex-col gap-3.5 bg-white">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-[15px] text-soil/80 hover:text-soil transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-soil/10">
            <Link href="/login" className="flex-1 text-center text-[14px] font-medium border border-soil/20 text-soil py-2.5 rounded-full hover:bg-grain-dim transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="flex-1 text-center text-[14px] font-medium bg-soil text-white py-2.5 rounded-full hover:bg-soil/85 transition-colors">
              Sign up
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
