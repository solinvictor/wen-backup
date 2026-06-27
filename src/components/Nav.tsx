'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/farmers', label: 'Become a Farmer' },
  { href: '/buyers', label: 'Become a Buyer' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-grain/95 backdrop-blur-sm border-b border-soil/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-soil">
          WEN
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] text-soil/70 hover:text-soil transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/products"
            className="text-[13px] font-medium bg-pepper text-grain px-4 py-2 rounded-full hover:bg-pepper-deep transition-colors"
          >
            Browse Products
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-soil"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-soil/10 px-5 py-4 flex flex-col gap-3.5 bg-grain">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-[15px] text-soil/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
