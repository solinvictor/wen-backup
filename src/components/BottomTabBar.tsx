'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ShoppingBag, Heart, ShoppingCart, Package, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const TABS = [
  { href: '/store',               label: 'Shop',    Icon: ShoppingBag },
  { href: '/saved',               label: 'Saved',   Icon: Heart },
  { href: '/cart',                label: 'Cart',    Icon: ShoppingCart },
  { href: '/account',             label: 'Orders',  Icon: Package },
  { href: '/account?tab=profile', label: 'Account', Icon: User },
]

// Shown on the top-level shop destinations only — mirrors a native app tab
// bar (hidden on pushed/detail screens like product detail or checkout,
// which already have their own sticky action bar).
export function BottomTabBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onProfileTab = pathname === '/account' && searchParams?.get('tab') === 'profile'
  const { cartCount } = useCart()

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-soil/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {TABS.map(({ href, label, Icon }) => {
          const base = href.split('?')[0]
          const isProfileTab = href.includes('tab=profile')
          const active = isProfileTab
            ? onProfileTab
            : pathname === base && !(base === '/account' && onProfileTab)

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative"
            >
              <div className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.3 : 1.8}
                  className={active ? 'text-pepper' : 'text-stone/45'}
                />
                {label === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-pepper text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10.5px] font-semibold ${active ? 'text-pepper' : 'text-stone/45'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
