import Link from 'next/link'

const COLS = [
  {
    title: 'Shop',
    links: [
      { href: '/store', label: 'Order from WEN' },
      { href: '/store?c=chicken', label: 'Chicken' },
      { href: '/store?c=eggs', label: 'Eggs' },
      { href: '/store?c=fish', label: 'Fish' },
      { href: '/store?c=rice', label: 'Rice' },
      { href: '/store?c=beans', label: 'Beans' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/buyers', label: 'For businesses' },
    ],
  },
  {
    title: 'Partners',
    links: [
      { href: '/farmers', label: 'Become a supplier' },
      { href: '/buyers', label: 'Join as a buyer' },
      { href: '/login', label: 'Log in' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="market-board text-grain/70 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-2xl text-grain mb-3">WEN</p>
            <p className="text-[13px] leading-relaxed text-grain/60 max-w-[16rem]">
              Start small. Buy better. Chicken, eggs, fish, rice, beans — for kitchens that buy regularly.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-grain/40 mb-3">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-grain/65 hover:text-grain transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-grain/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] font-data text-grain/40">
          <span>© {new Date().getFullYear()} WEN. Abuja, Nigeria.</span>
          <span>Mon – Sat · 9:00 AM – 6:00 PM</span>
        </div>
      </div>
    </footer>
  )
}
