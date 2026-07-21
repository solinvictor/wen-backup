'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_IMAGES } from '@/lib/category-images'

const CATEGORIES = [
  { label: 'Eggs',    slug: 'eggs',    img: CATEGORY_IMAGES.eggs },
  { label: 'Fish',    slug: 'fish',    img: CATEGORY_IMAGES.fish },
  { label: 'Chicken', slug: 'chicken', img: CATEGORY_IMAGES.chicken },
  { label: 'Rice',    slug: 'rice',    img: CATEGORY_IMAGES.rice },
  { label: 'Beans',   slug: 'beans',   img: CATEGORY_IMAGES.beans },
]

const FALLBACK_PRODUCTS = [
  { id: '1', name: 'Eggs',    category: 'eggs',    unit: 'per crate', image_url: CATEGORY_IMAGES.eggs },
  { id: '2', name: 'Catfish', category: 'fish',    unit: 'per kg',    image_url: CATEGORY_IMAGES.fish },
  { id: '3', name: 'Chicken', category: 'chicken', unit: 'per kg',    image_url: CATEGORY_IMAGES.chicken },
  { id: '4', name: 'Rice',    category: 'rice',    unit: 'per bag',   image_url: CATEGORY_IMAGES.rice },
  { id: '5', name: 'Beans',   category: 'beans',   unit: 'per bag',   image_url: CATEGORY_IMAGES.beans },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Farmers supply to WEN',
    body: 'Local farmers list their available stock. WEN reviews, contacts them, and purchases directly at fair prices.',
    // Real Nigerian farmers harvesting cassava — Victor Chijioke on Pexels
    img: 'https://images.pexels.com/photos/36846173/pexels-photo-36846173.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imgAlt: 'Nigerian farmers harvesting cassava in Anambra',
  },
  {
    step: '02',
    title: 'We inspect & pack it',
    body: 'Every product is quality-checked and packed fresh before it enters our delivery network.',
    // Nigerian market fresh produce — Katsina market
    img: 'https://images.pexels.com/photos/31743758/pexels-photo-31743758.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imgAlt: 'Fresh produce at a local Nigerian market in Katsina',
  },
  {
    step: '03',
    title: 'You order, we deliver',
    body: "Shop from WEN's store and get fresh produce delivered to your door, same day or next morning.",
    // African motorcycle delivery rider — Nairobi
    img: 'https://images.pexels.com/photos/30661401/pexels-photo-30661401.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imgAlt: 'Motorcycle delivery rider delivering fresh produce',
  },
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

function FeaturedProducts() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)

  useEffect(() => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase
        .from('products')
        .select('id, name, category, unit, image_url')
        .eq('is_available', true)
        .limit(8)
        .then(({ data }: { data: typeof FALLBACK_PRODUCTS | null }) => {
          if (data && data.length > 0) setProducts(data)
        })
    } catch {}
  }, [])

  return (
    <section className="bg-grain py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Fresh today</p>
            <h2 className="font-display text-soil text-2xl sm:text-3xl">What WEN has in stock</h2>
          </div>
          <Link href="/store" className="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-pepper hover:text-pepper-deep transition-colors">
            Shop all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {products.map(p => (
            <Link
              key={p.id}
              href={`/store?c=${p.category}`}
              className="group block bg-white rounded-2xl overflow-hidden border border-soil/8 hover:border-pepper/30 hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden bg-grain-dim">
                <img
                  src={(p as any).image_url || FALLBACK_PRODUCTS[0].image_url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 sm:p-4">
                <p className="font-display text-soil font-bold text-[14px] sm:text-[15px] leading-tight truncate">{p.name}</p>
                {p.unit && <p className="text-soil/60 text-[12px] mt-0.5">{p.unit}</p>}
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden">
          <Link href="/store" className="flex items-center justify-center gap-1.5 w-full border-2 border-soil/15 text-soil font-bold py-3.5 rounded-xl hover:bg-grain-dim transition-colors text-[14px]">
            See everything <ArrowRight size={15} />
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
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden min-h-[560px] sm:min-h-[640px] flex items-center">
          <img
            src="https://images.pexels.com/photos/36846177/pexels-photo-36846177.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,41,64,0.90) 0%, rgba(15,41,64,0.75) 60%, rgba(15,41,64,0.55) 100%)' }} />

          <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 w-full">
            <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.25em] mb-5">
              Sourced direct · Delivered fresh
            </p>
            <h1 className="hero-headline text-grain leading-[1.05] mb-6" style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
              Your fresh produce store,<br />
              <span className="text-turmeric">sourced from local farms.</span>
            </h1>
            <p className="text-grain/85 text-[16px] sm:text-[17px] leading-relaxed mb-8 max-w-lg">
              WEN sources fresh produce directly from Nigerian farmers and sells it to you at fair prices — delivered straight to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/store"
                className="inline-flex items-center justify-center gap-2 bg-pepper hover:bg-pepper-deep text-white font-semibold text-[15px] px-7 py-3.5 rounded-full transition-colors"
              >
                Shop now
              </Link>
              <Link
                href="/farmers"
                className="inline-flex items-center justify-center gap-2 border border-grain/25 text-grain/85 hover:border-grain/50 hover:text-grain font-medium text-[15px] px-7 py-3.5 rounded-full transition-colors"
              >
                Supply to WEN
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────── */}
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

        {/* ── Featured products ─────────────────────────────────────── */}
        <FeaturedProducts />

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="bg-grain-dim py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-10">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Simple process</p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl">How WEN works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {HOW_IT_WORKS.map(item => (
                <div key={item.step} className="bg-white rounded-2xl overflow-hidden border border-soil/8">
                  {/* Image — visible on ALL screens now */}
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.imgAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="font-data text-[11px] text-pepper/70 mb-3">{item.step}</p>
                    <h3 className="font-display text-soil text-lg mb-2">{item.title}</h3>
                    <p className="text-soil/75 text-[14px] leading-relaxed">{item.body}</p>
                  </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                List your available stock and WEN will contact you directly to purchase. No agents, no market stress — just a reliable buyer for your produce.
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
