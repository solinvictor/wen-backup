'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { label: 'Eggs',    slug: 'poultry', img: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Fish',    slug: 'fish',    img: 'https://images.pexels.com/photos/1148280/pexels-photo-1148280.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Chicken', slug: 'poultry', img: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Rice',    slug: 'grains',  img: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { label: 'Beans',   slug: 'grains',  img: 'https://images.pexels.com/photos/6157056/pexels-photo-6157056.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
]

const FALLBACK_PRODUCTS = [
  { id: '1', name: 'Eggs',    category: 'poultry', unit: 'per crate', image_url: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { id: '2', name: 'Catfish', category: 'fish',    unit: 'per kg',    image_url: 'https://images.pexels.com/photos/1148280/pexels-photo-1148280.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { id: '3', name: 'Chicken', category: 'poultry', unit: 'per kg',    image_url: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { id: '4', name: 'Rice',    category: 'grains',  unit: 'per bag',   image_url: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { id: '5', name: 'Beans',   category: 'grains',  unit: 'per bag',   image_url: 'https://images.pexels.com/photos/6157056/pexels-photo-6157056.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Farmers supply to WEN', body: 'Local farmers list their available stock. WEN reviews, contacts them, and purchases directly at fair prices.' },
  { step: '02', title: 'We inspect & pack it', body: 'Every product is quality-checked and packed fresh before it enters our delivery network.' },
  { step: '03', title: 'You order, we deliver', body: "Shop from WEN's store and get fresh produce delivered to your door, same day or next morning." },
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
              href={`/store?category=${p.category}`}
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
                {p.unit && <p className="text-stone text-[12px] mt-0.5">{p.unit}</p>}
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
          {/* Full-bleed farm produce background */}
          <img
            src="https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Heavy dark overlay — legibility first */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,41,64,0.88) 0%, rgba(15,41,64,0.72) 60%, rgba(15,41,64,0.55) 100%)' }} />

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

        {/* ── Featured products ─────────────────────────────────────── */}
        <FeaturedProducts />

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





