'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight, Plus } from 'lucide-react'
import { CATEGORY_IMAGES } from '@/lib/category-images'

const CATEGORIES = [
  {
    label: 'Chicken',
    slug: 'chicken',
    unit: 'kg',
    img: CATEGORY_IMAGES.chicken,
    body: 'Reliable supply for your kitchen.',
  },
  {
    label: 'Eggs',
    slug: 'eggs',
    unit: 'crate',
    img: CATEGORY_IMAGES.eggs,
    body: 'Fresh eggs at competitive prices.',
  },
  {
    label: 'Fish',
    slug: 'fish',
    unit: 'kg',
    img: CATEGORY_IMAGES.fish,
    body: 'Selected fish from our supply network.',
  },
  {
    label: 'Rice',
    slug: 'rice',
    unit: 'bag',
    img: CATEGORY_IMAGES.rice,
    body: 'Bulk rice for businesses that buy regularly.',
  },
  {
    label: 'Beans',
    slug: 'beans',
    unit: 'bag',
    img: CATEGORY_IMAGES.beans,
    body: 'Quality beans at a better buying price.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'We source',
    body: 'We find the best available deals from our selected suppliers.',
    img: '/landing/steps/01-source.jpg',
    imgAlt: 'Fresh produce sourced in bulk',
  },
  {
    step: '02',
    title: 'We list',
    body: "We show you what's available and the current price.",
    img: '/landing/steps/02-list.jpg',
    imgAlt: 'Produce listed and ready to buy',
  },
  {
    step: '03',
    title: 'You order',
    body: 'Pick what you need from the store.',
    img: '/landing/steps/03-order.jpg',
    imgAlt: 'Choosing what your kitchen needs',
  },
  {
    step: '04',
    title: 'We deliver',
    body: 'We coordinate fulfilment and get it to you.',
    img: '/landing/steps/04-deliver.jpg',
    imgAlt: 'Order packed and on the way',
  },
]


const FAQS = [
  {
    q: 'What areas do you deliver to?',
    a: 'Right now, Abuja. Add your address at checkout and we’ll confirm before anything ships.',
  },
  {
    q: 'How much is delivery, and how long does it take?',
    a: 'Standard delivery is ₦1,500 and arrives within 3 days. Need it sooner, express is ₦3,500 and arrives within 24 hours.',
  },
  {
    q: 'What can I actually order from WEN?',
    a: 'Five things, on purpose: chicken, eggs, fish, rice and beans. We’d rather do a few things reliably than everything badly.',
  },
  {
    q: 'How do I pay?',
    a: 'Card or bank transfer at checkout. Payments are handled securely, and your final price is confirmed before delivery goes out.',
  },
  {
    q: 'Can I set up recurring orders?',
    a: 'Yes. If your kitchen buys the same things every week, set a subscription once and pick how often it repeats — no reordering from scratch.',
  },
  {
    q: 'I farm or supply produce — how do I sell through WEN?',
    a: 'Apply as a supplier. We work with a selected group who can consistently deliver what we list, not everyone who signs up.',
  },
]

function FAQItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string
  a: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-soil/10 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-body text-soil text-[15px] sm:text-[16px] font-semibold pr-2">
          {q}
        </span>
        <Plus
          size={18}
          className={`shrink-0 text-pepper transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-soil/70 text-[14px] leading-relaxed pr-8">{a}</p>
        </div>
      </div>
    </div>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-grain py-14 sm:py-20 scroll-mt-24">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-3">
          Questions?
        </p>
        <h2 className="font-display text-soil text-2xl sm:text-3xl mb-6">Good to know</h2>
        <div className="wen-surface px-5 sm:px-6">
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function fmtPrice(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return null
  return `₦${n.toLocaleString('en-NG')}`
}

type BoardRow = {
  slug: string
  label: string
  unit: string
  price: number | null
  href: string
}

function WeeklyBoard() {
  const [rows, setRows] = useState<BoardRow[]>(
    CATEGORIES.map((c) => ({
      slug: c.slug,
      label: c.label,
      unit: c.unit,
      price: null,
      href: `/store?c=${c.slug}`,
    }))
  )
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { createClient } = require('@/lib/supabase/client')
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('name, category, unit, price, is_available')
          .eq('is_available', true)

        if (cancelled) return

        type Prod = {
          name: string
          category: string
          unit: string | null
          price: number | null
        }
        const products = (data || []) as Prod[]

        setRows(
          CATEGORIES.map((c) => {
            const inCat = products.filter(
              (p) =>
                p.category === c.slug ||
                p.name.toLowerCase().includes(c.slug) ||
                p.name.toLowerCase().includes(c.label.toLowerCase())
            )
            // Prefer a row with a real price; if several, take the lowest
            const withPrice = inCat
              .filter((p) => p.price != null && Number(p.price) > 0)
              .sort((a, b) => Number(a.price) - Number(b.price))
            const pick = withPrice[0] || inCat[0]
            const unitRaw = pick?.unit?.replace(/^per\s+/i, '') || c.unit
            return {
              slug: c.slug,
              label: c.label,
              unit: unitRaw,
              price: pick?.price != null ? Number(pick.price) : null,
              href: `/store?c=${c.slug}`,
            }
          })
        )
      } catch {
        /* keep category fallbacks */
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-xl max-w-md w-full">
      <div className="px-4 sm:px-5 py-3 border-b border-soil/8 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-soil/55 uppercase tracking-wide">
          This week, WEN has
        </p>
        <p className="text-[10px] text-stone/45 font-data shrink-0">
          {loaded ? 'From live stock' : 'Loading…'}
        </p>
      </div>
      <ul className="divide-y divide-soil/6">
        {rows.map((r) => {
          const price = fmtPrice(r.price)
          return (
            <li key={r.slug}>
              <Link
                href={r.href}
                className="px-4 sm:px-5 py-3 flex items-baseline justify-between gap-3 hover:bg-pepper/5 transition-colors group"
              >
                <span className="font-semibold text-soil text-[14px] uppercase tracking-wide group-hover:text-pepper transition-colors">
                  {r.label}
                </span>
                <span className="font-data text-[14px] font-bold tabular-nums text-right shrink-0">
                  {price ? (
                    <>
                      <span className="text-pepper">{price}</span>
                      <span className="text-stone/40 font-medium text-[11px]"> / {r.unit}</span>
                    </>
                  ) : (
                    <span className="text-pepper text-[13px] font-semibold underline-offset-2 group-hover:underline">
                      See store
                    </span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="px-4 sm:px-5 py-2.5 border-t border-soil/8 bg-grain-dim/50">
        <Link
          href="/store"
          className="text-[12px] font-semibold text-pepper hover:text-pepper-deep inline-flex items-center gap-1"
        >
          Browse full store
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

function FeaturedProducts() {
  const [products, setProducts] = useState(
    CATEGORIES.map((c, i) => ({
      id: String(i),
      name: c.label,
      category: c.slug,
      unit: `per ${c.unit}`,
      image_url: c.img,
      price: null as number | null,
    }))
  )

  useEffect(() => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase
        .from('products')
        .select('id, name, category, unit, image_url, price')
        .eq('is_available', true)
        .limit(8)
        .then(({ data }: { data: typeof products | null }) => {
          if (data && data.length > 0) setProducts(data as typeof products)
        })
    } catch {
      /* keep fallbacks */
    }
  }, [])

  return (
    <section className="bg-grain py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">
              Available from WEN
            </p>
            <h2 className="font-display text-soil text-2xl sm:text-3xl">
              That&apos;s our list for now
            </h2>
            <p className="text-soil/60 text-[14px] mt-2 max-w-md">
              We&apos;re starting small so we can get it right.
            </p>
          </div>
          <Link
            href="/store"
            className="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-pepper hover:text-pepper-deep transition-colors shrink-0"
          >
            Order from WEN <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/store?c=${p.category}`}
              className="group block bg-white rounded-2xl overflow-hidden border border-soil/8 hover:border-pepper/30 hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden bg-grain-dim">
                <img
                  src={p.image_url || CATEGORY_IMAGES[p.category] || CATEGORY_IMAGES.other}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 sm:p-4">
                <p className="font-body text-soil font-bold text-[14px] sm:text-[15px] leading-tight truncate">
                  {p.name}
                </p>
                {p.unit && <p className="text-soil/55 text-[12px] mt-0.5">{p.unit}</p>}
                {p.price != null && (
                  <p className="font-data text-pepper font-bold text-[13px] mt-1">
                    ₦{Number(p.price).toLocaleString('en-NG')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden">
          <Link
            href="/store"
            className="flex items-center justify-center gap-1.5 w-full border-2 border-soil/15 text-soil font-bold py-3.5 rounded-xl hover:bg-grain-dim transition-colors text-[14px]"
          >
            Order from WEN <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <>
      <Nav />

      <main>
        {/* ── Hero (photo kept) ── */}
        <section className="relative overflow-hidden min-h-[560px] sm:min-h-[680px] flex items-center">
          <img
            src="https://images.pexels.com/photos/36846177/pexels-photo-36846177.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(15,41,64,0.92) 0%, rgba(15,41,64,0.78) 55%, rgba(15,41,64,0.55) 100%)',
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div>
                <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.25em] mb-5">
                  WEN Food Network
                </p>
                <h1
                  className="hero-headline text-grain leading-[1.05] mb-4"
                  style={{ fontSize: 'clamp(36px, 6vw, 56px)' }}
                >
                  Food. At a better price.
                </h1>
                <p className="text-grain/85 text-[16px] sm:text-[17px] leading-relaxed mb-6 max-w-lg">
                  Want in? Tell us where you are and what you need.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/store"
                    className="inline-flex items-center justify-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-7 py-3.5 rounded-full transition-colors"
                  >
                    Order from WEN
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/farmers"
                    className="inline-flex items-center justify-center gap-2 border border-grain/25 text-grain/85 hover:border-grain/50 hover:text-grain font-medium text-[15px] px-7 py-3.5 rounded-full transition-colors"
                  >
                    Become a supplier
                  </Link>
                </div>
              </div>
              <WeeklyBoard />
            </div>
          </div>
        </section>

        {/* ── Why WEN (copy only) ── */}
        <section className="bg-grain py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-3">
              Why WEN?
            </p>
            <h2 className="font-display text-soil text-2xl sm:text-3xl mb-5 leading-tight">
              You already buy these things.
              <span className="block text-soil/65 mt-1">We just make buying them easier.</span>
            </h2>
            <div className="space-y-4 text-[15px] text-soil/75 leading-relaxed">
              <p>
                We work with selected suppliers, buy in volume and pass the advantage to
                businesses that buy regularly.
              </p>
              <p className="text-soil font-medium">
                No endless searching. No calling five suppliers. No complicated marketplace.
              </p>
              <p>Just what&apos;s available. At a good price.</p>
            </div>
          </div>
        </section>

        {/* ── How it works (photos kept) ── */}
        <section className="bg-grain-dim py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-10">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">
                How it works
              </p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl">Simple.</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {HOW_IT_WORKS.map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl overflow-hidden border border-soil/8"
                >
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.imgAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="font-data text-[11px] text-pepper/70 mb-3">{item.step}</p>
                    <h3 className="font-body text-soil text-lg mb-2 font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-soil/75 text-[14px] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Product photos grid ── */}
        <FeaturedProducts />

        {/* ── Category strip with images ── */}
        <section className="bg-[#eef1f4] py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-6 text-center">
              Chicken · Eggs · Fish · Rice · Beans
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/store?c=${c.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-square"
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-soil/85 via-soil/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <p className="text-white font-semibold text-[14px]">{c.label}</p>
                    <p className="text-white/70 text-[11px] mt-0.5 line-clamp-2">{c.body}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Restaurants ── */}
        <section className="relative overflow-hidden py-14 sm:py-20">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&h=700&fit=crop&q=80"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-soil/88" />
          <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-grain">
            <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.2em] mb-3">
              For restaurants &amp; food businesses
            </p>
            <h2 className="font-display text-2xl sm:text-3xl mb-4 leading-tight">
              Your kitchen has enough to worry about.
            </h2>
            <p className="text-grain/75 text-[15px] leading-relaxed mb-4">
              Let WEN handle five things: chicken, eggs, fish, rice, beans.
            </p>
            <p className="text-grain/65 text-[15px] leading-relaxed mb-8">
              If you regularly buy them, you&apos;re exactly who we&apos;re building for.
            </p>
            <Link
              href="/buyers"
              className="inline-flex items-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-8 py-3.5 rounded-full transition-colors"
            >
              Join WEN
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── Suppliers ── */}
        <section className="market-board py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.2em] mb-3">
                For suppliers
              </p>
              <h2 className="font-display text-grain text-2xl sm:text-3xl mb-3">
                We bring the demand. You bring the supply.
              </h2>
              <p className="text-grain/80 text-[15px] leading-relaxed max-w-md mb-2">
                WEN works with selected suppliers who can consistently provide the products we
                list.
              </p>
              <p className="text-grain/70 text-[14px] leading-relaxed max-w-md">
                We&apos;re not looking for everything — just reliable supply for what we sell.
              </p>
            </div>
            <Link
              href="/farmers"
              className="shrink-0 inline-flex items-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-8 py-3.5 rounded-full transition-colors whitespace-nowrap"
            >
              Become a WEN supplier
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <FAQSection />

        {/* ── Close ── */}
        <section className="bg-grain py-14 sm:py-16 border-t border-soil/8">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <p className="font-display text-soil text-2xl sm:text-3xl mb-2">WEN</p>
            <p className="text-soil/70 text-[16px] mb-1">Start small. Buy better.</p>
            <p className="text-soil font-semibold text-[15px] mb-2">
              Chicken. Eggs. Fish. Rice. Beans.
            </p>
            <p className="text-stone/50 text-[14px] mb-8">That&apos;s WEN. For now.</p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-8 py-3.5 rounded-full transition-colors"
            >
              Order from WEN
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
