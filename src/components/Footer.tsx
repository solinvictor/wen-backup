import Link from 'next/link'

export function Footer() {
  return (
    <footer className="market-board text-grain/70 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <p className="font-display text-2xl text-grain mb-2">WEN</p>
            <p className="text-[14px] max-w-xs leading-relaxed">
              Connecting farmers directly to buyers — fresher produce, fairer pricing.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
            <div className="flex flex-col gap-2">
              <Link href="/farmers" className="hover:text-grain transition-colors">Become a Farmer</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/products" className="hover:text-grain transition-colors">Products</Link>
              <Link href="/contact" className="hover:text-grain transition-colors">Contact</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-grain/10 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-[12px] font-data text-grain/40">
          <span>© {new Date().getFullYear()} WEN. Abuja, Nigeria.</span>
          <span>Mon – Sat, 9:00 AM – 6:00 PM</span>
        </div>
      </div>
    </footer>
  )
}
