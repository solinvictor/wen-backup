'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_IMAGES } from '@/lib/category-images'

type PriceRow = {
  key: string
  label: string
  unit: string
  emoji: string
  blurb: string
  price: number | null
  slug: string
}

const DEFAULT_ROWS: PriceRow[] = [
  {
    key: 'chicken',
    label: 'Chicken',
    unit: 'kg',
    emoji: '🍗',
    blurb: 'Reliable supply for your kitchen.',
    price: null,
    slug: 'chicken',
  },
  {
    key: 'fish',
    label: 'Fish',
    unit: 'kg',
    emoji: '🐟',
    blurb: 'Selected fish from our supply network.',
    price: null,
    slug: 'fish',
  },
  {
    key: 'eggs',
    label: 'Eggs',
    unit: 'crate',
    emoji: '🥚',
    blurb: 'Fresh eggs at competitive prices.',
    price: null,
    slug: 'eggs',
  },
  {
    key: 'rice',
    label: 'Rice',
    unit: 'bag',
    emoji: '🍚',
    blurb: 'Bulk rice for businesses that buy regularly.',
    price: null,
    slug: 'rice',
  },
  {
    key: 'beans',
    label: 'Beans',
    unit: 'bag',
    emoji: '🫘',
    blurb: 'Quality beans at a better buying price.',
    price: null,
    slug: 'beans',
  },
]

const HOW = [
  {
    step: '01',
    title: 'We source',
    body: 'We find the best available deals from our selected suppliers.',
  },
  {
    step: '02',
    title: 'We list',
    body: "We show you what's available and the current price.",
  },
  {
    step: '03',
    title: 'You order',
    body: 'Pick what you need.',
  },
  {
    step: '04',
    title: 'We deliver',
    body: 'We coordinate fulfilment and get it to you.',
  },
]

function fmtPrice(n: number | null) {
  if (n == null || Number.isNaN(n)) return 'See store'
  return `₦${n.toLocaleString('en-NG')}`
}

function useWeeklyPrices() {
  const [rows, setRows] = useState(DEFAULT_ROWS)

  useEffect(() => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase
        .from('products')
        .select('name, category, unit, price, is_available')
        .eq('is_available', true)
        .then(({ data }: { data: { name: string; category: string; unit: string | null; price: number | null }[] | null }) => {
          if (!data?.length) return
          setRows((prev) =>
            prev.map((row) => {
              const match =
                data.find((p) => p.category === row.slug && p.price) ||
                data.find((p) => p.name.toLowerCase().includes(row.key) && p.price)
              if (!match?.price) return row
              return {
                ...row,
                price: match.price,
                unit: match.unit?.replace(/^per\s+/i, '') || row.unit,
              }
            })
          )
        })
    } catch {
      /* keep defaults */
    }
  }, [])

  return rows
}

export default function LandingPage() {
  const rows = useWeeklyPrices()

  return (
    <>
      <Nav />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-soil text-grain">
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="absolute -right-24 top-0 w-[28rem] h-[28rem] bg-pepper/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20">
            <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.22em] mb-4">
              WEN Food Network
            </p>
            <h1 className="hero-headline text-grain text-4xl sm:text-5xl lg:text-6xl max-w-xl leading-[1.05] mb-3">
              Food. At a better price.
            </h1>
            <p className="text-grain/70 text-[15px] sm:text-[16px] max-w-md leading-relaxed mb-10">
              Start small. Buy better. Chicken, eggs, fish, rice, beans — that&apos;s
              WEN. For now.
            </p>

            <div className="wen-surface !bg-white/95 !border-white/20 max-w-lg overflow-hidden mb-8">
              <div className="px-5 py-3 border-b border-soil/8 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-soil/50 uppercase tracking-wide">
                  This week, WEN has
                </p>
                <p className="text-[11px] text-stone/50 font-data">Updated regularly</p>
              </div>
              <ul className="divide-y divide-soil/6">
                {rows.map((r) => (
                  <li
                    key={r.key}
                    className="px-5 py-3.5 flex items-baseline justify-between gap-4"
                  >
                    <span className="font-semibold text-soil text-[15px] tracking-wide uppercase">
                      {r.label}
                    </span>
                    <span className="font-data text-[15px] font-bold text-pepper tabular-nums text-right">
                      {fmtPrice(r.price)}
                      <span className="text-stone/45 font-medium text-[12px]">
                        {' '}
                        / {r.unit}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-grain/65 text-[14px] mb-6 max-w-sm leading-relaxed">
              Want in? Tell us where you are and what you need.
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-8 py-3.5 rounded-full transition-colors"
            >
              Order from WEN
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── Why WEN ── */}
        <section className="bg-grain py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-3">
              Why WEN?
            </p>
            <h2 className="font-display text-soil text-2xl sm:text-3xl mb-5 leading-tight">
              You already buy these things.
              <br />
              <span className="text-soil/70">We just make buying them easier.</span>
            </h2>
            <div className="space-y-4 text-[15px] text-soil/75 leading-relaxed">
              <p>
                We work with selected suppliers, buy in volume and pass the advantage to
                businesses that buy regularly.
              </p>
              <p className="text-soil font-medium">
                No endless searching. No calling five suppliers. No complicated
                marketplace.
              </p>
              <p>Just what&apos;s available. At a good price.</p>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-[#eef1f4] py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="mb-10">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">
                How it works
              </p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl">Simple.</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {HOW.map((item) => (
                <div key={item.step} className="wen-surface p-5 sm:p-6">
                  <p className="font-data text-[12px] text-pepper font-bold mb-3">
                    {item.step}
                  </p>
                  <h3 className="font-body text-soil text-lg font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-soil/70 text-[14px] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Available from WEN ── */}
        <section className="bg-grain py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="mb-8 sm:mb-10 max-w-xl">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">
                Available from WEN
              </p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl mb-3">
                That&apos;s our list for now.
              </h2>
              <p className="text-soil/65 text-[15px] leading-relaxed">
                We&apos;re starting small so we can get it right.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {rows.map((r) => (
                <Link
                  key={r.key}
                  href={`/store?c=${r.slug}`}
                  className="wen-surface p-5 flex gap-4 items-start hover:ring-pepper/25 transition-shadow group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-grain-dim shrink-0">
                    <img
                      src={CATEGORY_IMAGES[r.slug] || CATEGORY_IMAGES.other}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-soil text-[16px] mb-1">
                      <span className="mr-1.5" aria-hidden>
                        {r.emoji}
                      </span>
                      {r.label}
                    </p>
                    <p className="text-[13px] text-soil/60 leading-relaxed">{r.blurb}</p>
                    <p className="mt-2 font-data text-[13px] font-bold text-pepper">
                      {fmtPrice(r.price)}
                      <span className="text-stone/40 font-medium"> / {r.unit}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 text-pepper font-semibold text-[14px] hover:text-pepper-deep"
              >
                Order from WEN <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Restaurants ── */}
        <section className="bg-soil text-grain py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.2em] mb-3">
              For restaurants &amp; food businesses
            </p>
            <h2 className="font-display text-2xl sm:text-3xl mb-4 leading-tight">
              Your kitchen has enough to worry about.
            </h2>
            <p className="text-grain/70 text-[15px] leading-relaxed mb-6">
              Let WEN handle five things:
            </p>
            <p className="text-grain text-[17px] font-semibold mb-4 tracking-tight">
              Chicken. Eggs. Fish. Rice. Beans.
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
        <section className="bg-[#eef1f4] py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-3">
              For suppliers
            </p>
            <h2 className="font-display text-soil text-2xl sm:text-3xl mb-4 leading-tight">
              We bring the demand. You bring the supply.
            </h2>
            <p className="text-soil/70 text-[15px] leading-relaxed mb-4">
              WEN works with selected suppliers who can consistently provide the products
              we list.
            </p>
            <p className="text-soil font-medium text-[15px] mb-2">
              We&apos;re not looking for everything.
            </p>
            <p className="text-soil/70 text-[15px] leading-relaxed mb-8">
              We&apos;re looking for reliable supply for what we sell.
            </p>
            <Link
              href="/farmers"
              className="inline-flex items-center gap-2 bg-soil hover:bg-soil/90 text-white font-semibold text-[15px] px-8 py-3.5 rounded-full transition-colors"
            >
              Become a WEN supplier
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── Closing ── */}
        <section className="bg-grain border-t border-soil/8 py-14 sm:py-16">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <p className="font-display text-soil text-2xl sm:text-3xl mb-3">WEN</p>
            <p className="text-soil/70 text-[16px] mb-2">Start small. Buy better.</p>
            <p className="text-soil font-semibold text-[15px] mb-8">
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
