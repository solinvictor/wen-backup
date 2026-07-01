'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight, MapPin, Plus, Leaf, Users, Truck, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Types ─────────────────────────────────────────────────────────────────
interface Product {
  id: string
  name: string
  category: string
  unit: string | null
  is_available: boolean
}

// ── Data ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'vegetables', label: 'Vegetables',  image: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'tubers',     label: 'Tubers',      image: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'grains',     label: 'Grains',      image: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'fish',       label: 'Fish',        image: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'poultry',    label: 'Poultry',     image: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
]

const FALLBACK: Product[] = [
  { id: 'f1', name: 'Tomatoes',    category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f2', name: 'Yam',         category: 'tubers',     unit: 'per tuber',  is_available: true },
  { id: 'f3', name: 'Catfish',     category: 'fish',       unit: 'per kg',     is_available: true },
  { id: 'f4', name: 'Rice',        category: 'grains',     unit: 'per bag',    is_available: true },
  { id: 'f5', name: 'Chicken',     category: 'poultry',    unit: 'per bird',   is_available: true },
  { id: 'f6', name: 'Spinach',     category: 'vegetables', unit: 'per bunch',  is_available: true },
  { id: 'f7', name: 'Cassava',     category: 'tubers',     unit: 'per bag',    is_available: true },
  { id: 'f8', name: 'Tilapia',     category: 'fish',       unit: 'per kg',     is_available: true },
]

const HOW = [
  {
    title: 'Farmers list what\'s available',
    body:  'Verified farmers upload their stock — vegetables, grains, tubers, poultry, fish.',
    image: 'https://images.pexels.com/photos/7728332/pexels-photo-7728332.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    title: 'You build a list',
    body:  'Tell us what you need. No upfront price haggling — just add items and quantities.',
    image: 'https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    title: 'WEN matches and delivers',
    body:  'We match your list with a verified farmer nearby, confirm pricing, and coordinate delivery to your door.',
    image: 'https://images.pexels.com/photos/12725414/pexels-photo-12725414.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
]

const CATEGORY_IMAGE: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.image])
)

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const [location, setLocation] = useState('')

  function handleGo() {
    const dest = location.trim()
      ? `/products?location=${encodeURIComponent(location.trim())}`
      : '/products'
    window.location.href = dest
  }

  return (
    <section className="market-board relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1367242/pexels-photo-1367242.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
          alt=""
          aria-hidden
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-soil/60 via-soil/50 to-soil/80" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-20 pb-20 sm:pt-28 sm:pb-28 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-data text-[11px] text-turmeric uppercase tracking-[0.22em] mb-5"
        >
          Farm to your door
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.07 }}
          className="font-display text-grain leading-[1.06] tracking-tight mb-8"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          Fresh produce,<br />
          <em className="text-turmeric not-italic">straight from the farm.</em>
        </motion.h1>

        {/* Location input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="flex items-center gap-0 max-w-lg mx-auto bg-grain rounded-full overflow-hidden shadow-lg border border-soil/10"
        >
          <div className="flex items-center gap-2 pl-4 sm:pl-5 shrink-0">
            <MapPin size={15} className="text-pepper shrink-0" />
          </div>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGo()}
            placeholder="Enter your delivery location"
            className="flex-1 px-3 py-3.5 sm:py-4 text-[14px] text-soil placeholder:text-stone/60 bg-transparent outline-none"
          />
          <button
            onClick={handleGo}
            className="bg-pepper hover:bg-pepper-deep transition-colors text-grain text-[13.5px] font-medium px-5 sm:px-6 py-3.5 sm:py-4 rounded-full m-1 whitespace-nowrap"
          >
            Browse produce
          </button>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-x-7 gap-y-2 mt-9"
        >
          {[
            { icon: Leaf,        text: 'Farm fresh, always' },
            { icon: Users,       text: 'Verified farmers' },
            { icon: ShieldCheck, text: 'Fair pricing' },
            { icon: Truck,       text: 'Reliable delivery' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon size={11} className="text-turmeric/70" />
              <span className="font-data text-[10px] text-grain/45 uppercase tracking-wider">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Category strip ────────────────────────────────────────────────────────
function CategoryStrip() {
  return (
    <section className="bg-grain border-b border-soil/8 py-5 sm:py-6">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                href={`/products?category=${cat.key}`}
                className="group flex flex-col items-center gap-2 shrink-0 w-[72px] sm:w-[84px]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-soil/8 group-hover:border-pepper/50 transition-colors">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[11.5px] text-stone group-hover:text-soil transition-colors text-center leading-tight font-medium">
                  {cat.label}
                </span>
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: CATEGORIES.length * 0.05 }}
          >
            <Link
              href="/products"
              className="group flex flex-col items-center gap-2 shrink-0 w-[72px] sm:w-[84px]"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-dashed border-soil/20 group-hover:border-pepper/50 bg-grain-dim transition-colors flex items-center justify-center">
                <ArrowRight size={16} className="text-stone group-hover:text-pepper transition-colors" />
              </div>
              <span className="text-[11.5px] text-stone group-hover:text-soil transition-colors text-center leading-tight font-medium">
                See all
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Product card ──────────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  const img = CATEGORY_IMAGE[product.category] ?? CATEGORIES[0].image

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link
        href={`/products?category=${product.category}`}
        className="group block bg-grain rounded-xl border border-soil/8 hover:border-pepper/30 hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="aspect-[4/3] overflow-hidden bg-grain-dim relative">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Add button overlay */}
          <div className="absolute bottom-2 right-2 w-7 h-7 bg-pepper rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus size={13} className="text-grain" strokeWidth={2.5} />
          </div>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-soil text-[13.5px] font-medium leading-tight truncate">{product.name}</p>
          {product.unit && (
            <p className="font-data text-[10.5px] text-stone/70 mt-0.5 uppercase tracking-wide">{product.unit}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

// ── Featured products ─────────────────────────────────────────────────────
function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(FALLBACK)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase
        .from('products')
        .select('id, name, category, unit, is_available')
        .eq('is_available', true)
        .limit(8)
        .then(({ data }) => {
          if (data && data.length > 0) setProducts(data as Product[])
        }, () => {}) // silent — fallback already showing
    } catch {
      // env vars not set — fallback already in state
    }
  }, [])

  return (
    <section className="bg-grain py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="font-data text-[10.5px] text-pepper uppercase tracking-[0.2em] mb-1.5">Available now</p>
            <h2 className="font-display text-soil text-2xl sm:text-3xl tracking-tight">What farmers have today</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-pepper hover:text-pepper-deep transition-colors"
          >
            See everything <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="mt-7 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-pepper"
          >
            See everything <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section className="bg-grain-dim py-14 sm:py-20 border-t border-soil/8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <div className="mb-10 sm:mb-14">
          <p className="font-data text-[10.5px] text-pepper uppercase tracking-[0.2em] mb-2">How it works</p>
          <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight">Three steps, farm to door</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-soil/10 rounded-2xl overflow-hidden">
          {HOW.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-grain p-7 sm:p-9 flex flex-col gap-5"
            >
              <div className="aspect-[16/9] rounded-xl overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-data text-[10px] text-pepper/70 uppercase tracking-[0.2em]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-soil text-xl sm:text-2xl tracking-tight mt-1.5 mb-2.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-stone text-[14px] leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Dual CTA ──────────────────────────────────────────────────────────────
function DualCTA() {
  return (
    <section className="bg-grain py-14 sm:py-20 border-t border-soil/8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Farmer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="market-board rounded-2xl p-8 sm:p-10 relative overflow-hidden"
          >
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.pexels.com/photos/7728332/pexels-photo-7728332.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop"
                alt=""
                aria-hidden
                className="w-full h-full object-cover opacity-15"
              />
            </div>
            <div className="relative z-10">
              <p className="font-data text-[10.5px] text-turmeric uppercase tracking-[0.2em] mb-4">For farmers</p>
              <h3
                className="font-display text-grain tracking-tight leading-snug mb-4"
                style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}
              >
                Sell direct.<br />
                <em className="text-turmeric not-italic">Keep more.</em>
              </h3>
              <p className="text-grain/55 text-[14px] leading-relaxed mb-8 max-w-xs">
                No middlemen. List your produce, we bring you buyers and handle coordination.
              </p>
              <Link
                href="/farmers"
                className="inline-flex items-center gap-2 bg-pepper hover:bg-pepper-deep transition-colors text-grain text-[13.5px] font-medium px-5 py-3 rounded-full"
              >
                Join as a farmer <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Buyer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="bg-grain-dim rounded-2xl p-8 sm:p-10 border border-soil/8 relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop"
                alt=""
                aria-hidden
                className="w-full h-full object-cover opacity-[0.06]"
              />
            </div>
            <div className="relative z-10">
              <p className="font-data text-[10.5px] text-pepper uppercase tracking-[0.2em] mb-4">For buyers</p>
              <h3
                className="font-display text-soil tracking-tight leading-snug mb-4"
                style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}
              >
                Fresh produce.<br />
                <em className="text-pepper not-italic">Fair prices.</em>
              </h3>
              <p className="text-stone text-[14px] leading-relaxed mb-8 max-w-xs">
                Build a list, we match you with a verified farmer and confirm pricing before anything moves.
              </p>
              <Link
                href="/buyers"
                className="inline-flex items-center gap-2 bg-soil hover:bg-soil/80 transition-colors text-grain text-[13.5px] font-medium px-5 py-3 rounded-full"
              >
                Start buying <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <CategoryStrip />
        <FeaturedProducts />
        <HowItWorks />
        <DualCTA />
      </main>
      <Footer />
    </>
  )
}
