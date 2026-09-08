'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight } from 'lucide-react'
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
    img: 'https://images.pexels.com/photos/36846173/pexels-photo-36846173.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imgAlt: 'Farmers working in the field',
  },
  {
    step: '02',
    title: 'We list',
    body: "We show you what's available and the current price.",
    img: 'https://images.pexels.com/photos/31743758/pexels-photo-31743758.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imgAlt: 'Fresh produce at a local market',
  },
  {
    step: '03',
    title: 'You order',
    body: 'Pick what you need from the store.',
    img: 'https://images.pexels.com/photos/36846177/pexels-photo-36846177.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imgAlt: 'Fresh food ready to order',
  },
  {
    step: '04',
    title: 'We deliver',
    body: 'We coordinate fulfilment and get it to you.',
    img: 'https://images.pexels.com/photos/30661401/pexels-photo-30661401.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imgAlt: 'Delivery rider on the way',
  },
]

function fmtPrice(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return null
  return `₦${n.toLocaleString('en-NG')}`
}

function WeeklyBoard() {
  const [prices, setPrices] = useState<Record<string, number | null>>({})

  useEffect(() => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase
        .from('products')
        .select('name, category, price, is_available')
        .eq('is_available', true)
        .then(({ data }: { data: { name: string; category: string; price: number | null }[] | null }) => {
          if (!data?.length) return
          const next: Record<string, number | null> = {}
          for (const cat of CATEGORIES) {
            const match =
              data.find((p) => p.category === cat.slug && p.price) ||
              data.find((p) => p.name.toLowerCase().includes(cat.slug) && p.price)
            next[cat.slug] = match?.price ?? null
          }
          setPrices(next)
        })
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-xl max-w-md w-full">
      <div className="px-4 sm:px-5 py-3 border-b border-soil/8 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-soil/55 uppercase tracking-wide">
          This week, WEN has
        </p>
        <p className="text-[10px] text-stone/45 font-data shrink-0">Updated regularly</p>
      </div>
      <ul className="divide-y divide-soil/6">
        {CATEGORIES.map((c) => {
          const price = fmtPrice(prices[c.slug])
          return (
            <li key={c.slug} className="px-4 sm:px-5 py-3 flex items-baseline justify-between gap-3">
              <span className="font-semibold text-soil text-[14px] uppercase tracking-wide">
                {c.label}
              </span>
              <span className="font-data text-[14px] font-bold text-pepper tabular-nums text-right">
                {price ?? 'See store'}
                <span className="text-stone/40 font-medium text-[11px]"> / {c.unit}</span>
              </span>
            </li>
          )
        })}
      </ul>
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
            src="https://images.pexels.com/photos/31743758/pexels-photo-31743758.jpeg?auto=compress&cs=tinysrgb&w=1400&h=700&fit=crop"
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
