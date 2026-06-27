import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight, Leaf, Users, Truck, Scale, Recycle } from 'lucide-react'

const CATEGORIES = [
  { name: 'Tomatoes', unit: 'per basket', price: '₦8,500' },
  { name: 'Yam', unit: 'per tuber', price: '₦1,200' },
  { name: 'Catfish', unit: 'per kg', price: '₦2,800' },
  { name: 'Rice', unit: 'per bag', price: '₦42,000' },
  { name: 'Pepper', unit: 'per basket', price: '₦6,000' },
  { name: 'Eggs', unit: 'per crate', price: '₦3,400' },
]

const STEPS = [
  {
    title: 'Farmers list produce',
    body: 'Farmers upload available farm produce such as vegetables, grains, poultry, and more.',
  },
  {
    title: 'Buyers place orders',
    body: 'Households, restaurants, and businesses browse and order directly.',
  },
  {
    title: 'WEN coordinates delivery',
    body: 'We connect, confirm, and ensure smooth delivery from farm to buyer.',
  },
]

const WHY = [
  { icon: Leaf, text: 'Fresh and affordable farm produce' },
  { icon: Users, text: 'Direct connection to farmers' },
  { icon: Scale, text: 'Fair pricing for both farmers and buyers' },
  { icon: Recycle, text: 'Reduced food waste and middleman exploitation' },
  { icon: Truck, text: 'Reliable sourcing for homes and businesses' },
]

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">

        {/* ── HERO — market board ───────────────────────────────────── */}
        <section className="market-board relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
            <div className="max-w-2xl">
              <p className="font-data text-[12px] text-turmeric uppercase tracking-[0.2em] mb-5">
                Farm to Market, Direct
              </p>
              <h1 className="font-display text-grain leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(38px, 6vw, 64px)' }}>
                Fresh farm produce,<br />
                <span className="italic text-turmeric">direct</span> from trusted farmers.
              </h1>
              <p className="text-grain/70 text-[16px] sm:text-[17px] leading-relaxed max-w-lg mb-9">
                WEN connects farmers directly to buyers to ensure fresh produce, fair pricing, and faster delivery across communities.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="inline-flex items-center gap-2 bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors">
                  Browse Products <ArrowRight size={15} />
                </Link>
                <Link href="/farmers" className="inline-flex items-center gap-2 border border-grain/25 text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-grain/5 transition-colors">
                  Become a Farmer
                </Link>
                <Link href="/buyers" className="inline-flex items-center gap-2 border border-grain/25 text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-grain/5 transition-colors">
                  Become a Buyer
                </Link>
              </div>
            </div>

            {/* Market board — signature element: chalkboard price strip */}
            <div className="mt-16 sm:mt-20 border-t border-grain/10 pt-8">
              <p className="font-data text-[11px] text-grain/40 uppercase tracking-[0.2em] mb-4">Today at the market</p>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {CATEGORIES.map((c) => (
                  <div key={c.name} className="flex items-baseline gap-2">
                    <span className="font-display text-grain text-[16px]">{c.name}</span>
                    <span className="font-data text-[12px] text-turmeric">{c.price}</span>
                    <span className="font-data text-[11px] text-grain/40">{c.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
        <section className="bg-grain py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight mb-12">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
              {STEPS.map((step, i) => (
                <div key={step.title}>
                  <p className="font-data text-pepper text-[13px] mb-3">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-display text-soil text-xl mb-2.5">{step.title}</h3>
                  <p className="text-stone text-[14.5px] leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY WEN ────────────────────────────────────────────────── */}
        <section className="bg-grain-dim py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight mb-3">Why WEN</h2>
            <p className="text-stone text-[15px] mb-12 max-w-md">
              Reduced food waste, fair pricing on both sides, and a direct line between farm and table.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {WHY.map(({ icon: Icon, text }) => (
                <div key={text} className="bg-grain rounded-2xl p-5 sm:p-6 border border-soil/8">
                  <Icon size={20} className="text-okra mb-4" />
                  <p className="text-soil text-[14px] sm:text-[15px] leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSING CTA ────────────────────────────────────────────── */}
        <section className="market-board py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="font-display text-grain text-3xl sm:text-4xl tracking-tight mb-5">
              Join the network.
            </h2>
            <p className="text-grain/60 text-[15px] mb-8 max-w-md mx-auto">
              Whether you grow it or you buy it, WEN gets it there faster.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/farmers" className="bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors">
                Become a Farmer
              </Link>
              <Link href="/buyers" className="border border-grain/25 text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-grain/5 transition-colors">
                Become a Buyer
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

