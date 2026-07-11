import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

const CATEGORIES = [
  { label: 'Vegetables', slug: 'vegetables', img: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Grains',     slug: 'grains',     img: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Tubers',     slug: 'tubers',     img: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Poultry',    slug: 'poultry',    img: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Fish',       slug: 'fish',       img: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Fruits',     slug: 'fruits',     img: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Dairy',      slug: 'dairy',      img: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Spices',     slug: 'spices',     img: 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'We source from farmers', body: 'WEN buys directly from verified local farmers at fair prices — cutting out every middleman in between.' },
  { step: '02', title: 'Quality checked & packed', body: 'Every product is inspected and packed fresh before it leaves our distribution network.' },
  { step: '03', title: 'Delivered to your door',  body: 'Order online and get fresh WEN produce delivered same day or next morning.' },
]

const STATS = [
  { value: '200+', label: 'Farmers we work with' },
  { value: '40%',  label: 'Cheaper than markets' },
  { value: '24h',  label: 'Farm to door' },
]

const WHY_WEN = [
  { title: 'Fresher produce',    body: 'No cold storage, no long supply chains. Our produce moves from farm to you in under 24 hours.' },
  { title: 'Consistent quality', body: 'Every item is inspected before it ships. You get what you see, every time.' },
  { title: 'Fairer for farmers', body: 'We pay farmers directly and fairly — which means better produce for you and better income for them.' },
]

export default function LandingPage() {
  return (
    <>
      <Nav />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-soil">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 65% 50%, rgba(61,122,42,0.18) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 flex flex-col sm:flex-row items-center gap-10 sm:gap-16">

            {/* Left: copy */}
            <div className="flex-1 text-center sm:text-left">
              <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.25em] mb-5">
                Sourced direct · Delivered fresh
              </p>
              <h1 className="font-display text-grain leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
                Farm fresh produce,<br />
                <span className="text-turmeric">sold by WEN.</span>
              </h1>
              <p className="text-grain/85 text-[16px] sm:text-[17px] leading-relaxed mb-8 max-w-md mx-auto sm:mx-0">
                WEN buys directly from local farmers across Nigeria and delivers fresh, quality produce straight to your door — no middlemen, no markups.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                <Link
                  href="/store"
                  className="inline-flex items-center justify-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-7 py-3.5 rounded-full transition-colors"
                >
                  Shop now
                </Link>
                <Link
                  href="/farmers"
                  className="inline-flex items-center justify-center gap-2 border border-grain/20 text-grain/85 hover:border-grain/40 hover:text-grain font-medium text-[15px] px-7 py-3.5 rounded-full transition-colors"
                >
                  Supply to WEN
                </Link>
              </div>
            </div>

            {/* Right: produce photo collage */}
            <div className="flex-shrink-0 w-full sm:w-[420px]">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
                  'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
                  'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
                  'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
                ].map((src, i) => (
                  <div key={i} className={`overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        <section className="bg-pepper">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-3 gap-4 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="font-display text-white text-2xl sm:text-3xl font-bold">{s.value}</p>
                <p className="text-white/90 text-[12px] sm:text-[13px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Categories ───────────────────────────────────────────────── */}
        <section className="bg-grain py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Browse by category</p>
                <h2 className="font-display text-soil text-2xl sm:text-3xl">What are you shopping for?</h2>
              </div>
              <Link href="/store" className="text-[13px] font-semibold text-pepper hover:text-pepper-deep transition-colors hidden sm:block">
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/store?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-soil/8 group-hover:ring-pepper/40 group-hover:shadow-md transition-all">
                    <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <span className="text-[11px] sm:text-[12px] font-medium text-soil/85 group-hover:text-soil text-center transition-colors">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="bg-grain-dim py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-12">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Simple process</p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl">How WEN works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map(item => (
                <div key={item.step} className="text-center sm:text-left">
                  <p className="font-data text-[11px] text-pepper/70 mb-3">{item.step}</p>
                  <h3 className="font-display text-soil text-lg mb-2">{item.title}</h3>
                  <p className="text-soil/75 text-[14px] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why WEN ──────────────────────────────────────────────────── */}
        <section className="bg-grain py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-12">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Why choose us</p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl">The WEN difference</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {WHY_WEN.map(item => (
                <div key={item.title} className="bg-grain-dim rounded-2xl p-6">
                  <h3 className="font-display text-soil text-lg mb-2">{item.title}</h3>
                  <p className="text-soil/75 text-[14px] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Farmer supply CTA ────────────────────────────────────────── */}
        <section className="market-board py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.2em] mb-3">For farmers</p>
              <h2 className="font-display text-grain text-2xl sm:text-3xl mb-3">Supply to WEN. Get paid fairly.</h2>
              <p className="text-grain/80 text-[15px] leading-relaxed max-w-md">
                We buy directly from local farmers at consistent, fair prices. No agents, no delays — just a reliable buyer for your produce.
              </p>
            </div>
            <Link
              href="/farmers"
              className="shrink-0 inline-flex items-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-8 py-3.5 rounded-full transition-colors whitespace-nowrap"
            >
              Become a supplier →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
