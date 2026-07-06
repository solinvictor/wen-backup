'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight, MapPin, Search, Leaf, Users, Truck, ShieldCheck, Star, ChevronRight } from 'lucide-react'
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
  { key: 'vegetables', label: 'Vegetables', emoji: '🥬', image: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'tubers',     label: 'Tubers',     emoji: '🍠', image: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'grains',     label: 'Grains',     emoji: '🌾', image: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'fish',       label: 'Fish',       emoji: '🐟', image: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'fruits',     label: 'Fruits',     emoji: '🍎', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'poultry',    label: 'Poultry',    emoji: '🍗', image: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'dairy',      label: 'Dairy',      emoji: '🥛', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'spices',     label: 'Spices',     emoji: '🌶', image: 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
]

const CATEGORY_IMAGE: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.image])
)

const FALLBACK: Product[] = [
  { id: 'f1', name: 'Tomatoes',  category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f2', name: 'Yam',       category: 'tubers',     unit: 'per tuber',  is_available: true },
  { id: 'f3', name: 'Catfish',   category: 'fish',       unit: 'per kg',     is_available: true },
  { id: 'f4', name: 'Rice',      category: 'grains',     unit: 'per bag',    is_available: true },
  { id: 'f5', name: 'Chicken',   category: 'poultry',    unit: 'per bird',   is_available: true },
  { id: 'f6', name: 'Spinach',   category: 'vegetables', unit: 'per bunch',  is_available: true },
  { id: 'f7', name: 'Cassava',   category: 'tubers',     unit: 'per bag',    is_available: true },
  { id: 'f8', name: 'Tilapia',   category: 'fish',       unit: 'per kg',     is_available: true },
]

const STATS = [
  { value: '200+',   label: 'Verified farmers' },
  { value: '5,000+', label: 'Orders delivered' },
  { value: '12',     label: 'States covered' },
  { value: '98%',    label: 'On-time delivery' },
]

const TESTIMONIALS = [
  {
    quote: 'I used to spend hours at the market every week. Now I build a list on WEN and the produce arrives at my door, fresher than anything I\'d find myself.',
    name: 'Amaka O.',
    role: 'Household buyer, Abuja',
  },
  {
    quote: 'Before WEN, middlemen took more than half my earnings. Now I list directly and keep what my produce is actually worth.',
    name: 'Musa D.',
    role: 'Tomato farmer, Kaduna',
  },
  {
    quote: 'We supply a restaurant and WEN has never missed a delivery. The consistency is something we couldn\'t get from the open market.',
    name: 'Chidinma E.',
    role: 'Restaurant buyer, Lagos',
  },
]

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const [query, setQuery] = useState('')

  function handleSearch() {
    const dest = query.trim()
      ? `/products?q=${encodeURIComponent(query.trim())}`
      : '/products'
    window.location.href = dest
  }

  return (
    <section className="relative bg-grain border-b border-soil/8 overflow-hidden">
      {/* Hero background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
        />
        {/* layered overlay: deep green base + warm gradient so text is readable but image breathes */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,41,64,0.72) 0%, rgba(44,90,32,0.55) 50%, rgba(139,195,74,0.28) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.18) 100%)' }} />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-8 sm:pt-14 sm:pb-12">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-[12px] font-semibold text-green-300 uppercase tracking-[0.18em] mb-3"
        >
          Farm fresh · delivered fast
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="font-display text-white leading-[1.08] tracking-tight mb-6"
          style={{ fontSize: 'clamp(32px, 5.5vw, 58px)' }}
        >
          Fresh produce,<br />
          <span className="text-green-300">straight from the farm.</span>
        </motion.h1>

        {/* Search bar — Instacart-style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="flex items-center bg-white rounded-xl border-2 border-soil/12 hover:border-pepper/50 focus-within:border-pepper transition-colors shadow-sm max-w-2xl"
        >
          <div className="flex items-center pl-4 shrink-0">
            <Search size={18} className="text-stone/60" />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search for tomatoes, yam, catfish..."
            className="flex-1 px-3 py-4 text-[15px] text-soil placeholder:text-stone/40 bg-transparent outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-pepper hover:bg-pepper-deep transition-colors text-white text-[14px] font-semibold px-6 py-3 rounded-lg m-1.5 whitespace-nowrap"
          >
            Find produce
          </button>
        </motion.div>

        {/* Trust pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap gap-3 mt-5"
        >
          {[
            { icon: Leaf,        text: 'Farm fresh' },
            { icon: MapPin,      text: 'Nationwide delivery' },
            { icon: ShieldCheck, text: 'Verified farmers' },
            { icon: Truck,       text: 'Fast logistics' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
              <Icon size={12} className="text-green-300" />
              <span className="text-[12px] font-medium text-white/85">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Category grid ─────────────────────────────────────────────────────────
function CategoryGrid() {
  return (
    <section className="bg-grain py-8 sm:py-10 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-soil text-lg sm:text-xl tracking-tight">Shop by category</h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-[13px] font-semibold text-pepper hover:text-pepper-deep transition-colors"
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Link
                href={`/products?category=${cat.key}`}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-grain-dim border border-soil/8 group-hover:border-pepper/30 group-hover:shadow-md transition-all duration-200">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[12px] font-semibold text-soil text-center leading-tight">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Promo banner ──────────────────────────────────────────────────────────
function PromoBanner() {
  return (
    <section className="bg-grain py-6 sm:py-8 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Farmer CTA */}
          <Link href="/farmers" className="group relative rounded-2xl overflow-hidden bg-soil flex items-center gap-5 px-6 py-5 hover:bg-soil/90 transition-colors">
            <div className="absolute inset-0">
              <img
                src="https://images.pexels.com/photos/7728332/pexels-photo-7728332.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop"
                alt=""
                aria-hidden
                className="w-full h-full object-cover opacity-15"
              />
            </div>
            <div className="relative z-10 flex-1">
              <p className="text-turmeric text-[11px] font-semibold uppercase tracking-[0.16em] mb-1">For farmers</p>
              <p className="font-display text-white text-xl leading-snug tracking-tight">Sell direct. Keep more.</p>
              <p className="text-white/50 text-[13px] mt-1">No middlemen. List your produce today.</p>
            </div>
            <div className="relative z-10 shrink-0">
              <div className="w-9 h-9 rounded-full bg-pepper flex items-center justify-center group-hover:bg-pepper-deep transition-colors">
                <ArrowRight size={16} className="text-white" />
              </div>
            </div>
          </Link>

          {/* Buyer CTA */}
          <Link href="/buyers" className="group relative rounded-2xl overflow-hidden bg-pepper flex items-center gap-5 px-6 py-5 hover:bg-pepper-deep transition-colors">
            <div className="absolute inset-0">
              <img
                src="https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop"
                alt=""
                aria-hidden
                className="w-full h-full object-cover opacity-10"
              />
            </div>
            <div className="relative z-10 flex-1">
              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.16em] mb-1">For buyers</p>
              <p className="font-display text-white text-xl leading-snug tracking-tight">Fresh produce. Fair prices.</p>
              <p className="text-white/60 text-[13px] mt-1">Build a list, we match you with a farmer.</p>
            </div>
            <div className="relative z-10 shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight size={16} className="text-white" />
              </div>
            </div>
          </Link>

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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link
        href={`/products?category=${product.category}`}
        className="group block bg-white rounded-2xl border border-soil/8 hover:border-pepper/30 hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <div className="aspect-square overflow-hidden bg-grain-dim">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="px-3.5 py-3">
          <p className="text-soil text-[14px] font-semibold leading-tight truncate">{product.name}</p>
          {product.unit && (
            <p className="text-stone/60 text-[12px] mt-0.5">{product.unit}</p>
          )}
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-pepper text-[12px] font-semibold">Request price</span>
            <div className="w-7 h-7 rounded-full bg-pepper flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={12} className="text-white" />
            </div>
          </div>
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
        }, () => {})
    } catch {
      // env vars not set — fallback showing
    }
  }, [])

  return (
    <section className="bg-grain py-8 sm:py-12 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold text-pepper uppercase tracking-[0.18em] mb-1">Available now</p>
            <h2 className="font-display text-soil text-xl sm:text-2xl tracking-tight">What farmers have today</h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-[13px] font-semibold text-pepper hover:text-pepper-deep transition-colors"
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/products"
            className="flex items-center justify-center gap-1.5 w-full border-2 border-soil/10 text-[14px] font-semibold text-soil py-3.5 rounded-xl hover:bg-grain-dim transition-colors"
          >
            Browse all produce <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section className="bg-soil py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4 text-center">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <p className="font-display text-white text-3xl sm:text-4xl tracking-tight mb-1">{stat.value}</p>
              <p className="text-white/45 text-[12px] font-medium uppercase tracking-[0.14em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section className="bg-grain-dim py-12 sm:py-16 border-t border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold text-pepper uppercase tracking-[0.18em] mb-1">Real people</p>
            <h2 className="font-display text-soil text-xl sm:text-2xl tracking-tight">What they're saying</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-soil/8 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={13} className="text-pepper fill-pepper" />
                ))}
              </div>
              <p className="text-soil text-[14px] leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="border-t border-soil/8 pt-4">
                <p className="text-soil text-[13px] font-semibold">{t.name}</p>
                <p className="text-stone/60 text-[11.5px] mt-0.5 uppercase tracking-[0.12em] font-medium">{t.role}</p>
              </div>
            </motion.div>
          ))}
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
        <CategoryGrid />
        <PromoBanner />
        <FeaturedProducts />
        <Stats />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}

