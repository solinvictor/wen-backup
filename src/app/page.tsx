'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight, MapPin, Plus, Leaf, Users, Truck, ShieldCheck, Star, Search } from 'lucide-react'
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
  { key: 'vegetables', label: 'Vegetables', image: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'tubers',     label: 'Tubers',     image: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'grains',     label: 'Grains',     image: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'fish',       label: 'Fish',       image: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { key: 'poultry',    label: 'Poultry',    image: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
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

const HOW = [
  {
    title: 'Farmers list what\'s available',
    body:  'Verified farmers upload their stock — vegetables, grains, tubers, poultry, fish.',
    image: 'https://images.pexels.com/photos/7728332/pexels-photo-7728332.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    title: 'You build a list',
    body:  'Tell us what you need. No upfront price haggling — add items and quantities, nothing more.',
    image: 'https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    title: 'WEN matches and delivers',
    body:  'We match your list with a verified nearby farmer, confirm pricing, and coordinate delivery.',
    image: 'https://images.pexels.com/photos/12725414/pexels-photo-12725414.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
]

const STATS = [
  { value: '200+', label: 'Verified farmers' },
  { value: '5,000+', label: 'Orders delivered' },
  { value: '12',   label: 'States covered' },
  { value: '98%',  label: 'On-time delivery' },
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
    quote: 'We supply a restaurant and WEN has never missed a delivery. The consistency and quality is something we couldn\'t get from the open market.',
    name: 'Chidinma E.',
    role: 'Restaurant buyer, Lagos',
  },
]

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
    <section className="relative overflow-hidden min-h-[520px] sm:min-h-[600px] flex items-center">
      {/* Background image */}
      <img
        src="https://images.pexels.com/photos/1300975/pexels-photo-1300975.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark navy overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-br from-soil/85 via-soil/70 to-soil/50" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-grain mb-3 leading-tight">
            Fresh produce,<br />
            <span className="text-pepper">straight from the farm.</span>
          </h1>
          <p className="text-grain/80 text-lg max-w-lg">Farm to your door. Fresh, fair, fast.</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-grain rounded-lg border-2 border-transparent focus-within:border-pepper transition-colors px-4 py-3.5 shadow-lg">
              <MapPin size={18} className="text-stone shrink-0 mr-3" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGo()}
                placeholder="Enter delivery location"
                className="flex-1 bg-transparent outline-none text-soil placeholder:text-stone/60 text-base"
              />
            </div>
            <button
              onClick={handleGo}
              className="bg-pepper hover:bg-pepper-deep text-grain font-semibold px-8 py-3.5 rounded-lg transition-colors whitespace-nowrap text-base shadow-lg"
            >
              Browse
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Trust badges ──────────────────────────────────────────────────────────
function TrustBadges() {
  return (
    <section className="bg-grain-dim border-b border-soil/8 py-5 sm:py-6">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {[
            { icon: Leaf,        text: 'Farm fresh, always' },
            { icon: Users,       text: 'Verified farmers' },
            { icon: ShieldCheck, text: 'Fair pricing' },
            { icon: Truck,       text: 'Reliable delivery' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={18} className="text-pepper" />
              <span className="text-sm font-medium text-soil">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Category carousel ─────────────────────────────────────────────────────
function CategoryStrip() {
  return (
    <section className="bg-grain py-8 sm:py-10 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-soil">Shop by category</h2>
          <Link
            href="/products"
            className="text-pepper hover:text-pepper-deep text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="shrink-0"
            >
              <Link
                href={`/products?category=${cat.key}`}
                className="group relative block rounded-xl overflow-hidden border border-soil/10 hover:border-pepper/30 hover:shadow-md transition-all duration-300"
                style={{ width: 140, height: 100 }}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-soil/80 via-soil/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                  <p className="text-grain text-sm font-bold leading-tight drop-shadow">{cat.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Stats section ─────────────────────────────────────────────────────────
function StatsStrip() {
  return (
    <section className="bg-grain py-10 sm:py-14 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="text-center"
            >
              <p className="font-display text-3xl sm:text-4xl text-soil mb-2 font-bold">{stat.value}</p>
              <p className="text-sm text-stone font-medium">{stat.label}</p>
            </motion.div>
          ))}
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
      transition={{ duration: 0.35, delay: index * 0.03 }}
    >
      <Link
        href={`/products?category=${product.category}`}
        className="group block bg-grain rounded-xl border border-soil/10 hover:border-pepper/30 hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="aspect-square overflow-hidden bg-grain-dim relative">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 w-8 h-8 bg-pepper rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Plus size={16} className="text-grain" strokeWidth={2.5} />
          </div>
        </div>
        <div className="p-4">
          <p className="text-soil font-bold text-base leading-tight truncate mb-1">{product.name}</p>
          {product.unit && (
            <p className="text-sm text-stone">{product.unit}</p>
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
        }, () => {})
    } catch {
      // env vars not set — fallback showing
    }
  }, [])

  return (
    <section className="bg-grain py-10 sm:py-14 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-pepper text-sm font-bold uppercase tracking-wider mb-2">Available now</p>
            <h2 className="font-display text-2xl sm:text-3xl text-soil font-bold">What farmers have today</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-pepper hover:text-pepper-deep font-semibold transition-colors"
          >
            See everything <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="sm:hidden">
          <Link
            href="/products"
            className="flex items-center justify-center gap-1.5 w-full border-2 border-soil/20 text-soil font-bold py-3.5 rounded-lg hover:bg-grain-dim transition-colors"
          >
            See all produce <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section className="bg-grain-dim py-14 sm:py-20 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="mb-10 sm:mb-14">
          <p className="text-pepper text-sm font-bold uppercase tracking-wider mb-2">How it works</p>
          <h2 className="font-display text-3xl sm:text-4xl text-soil font-bold">Three steps, farm to door</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {HOW.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-grain rounded-2xl p-6 sm:p-8 border border-soil/10 flex flex-col gap-5"
            >
              <div className="aspect-[16/9] rounded-lg overflow-hidden">
                <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-pepper text-xs font-bold uppercase tracking-wider">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-soil font-bold mt-2 mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-stone text-base leading-relaxed">{step.body}</p>
              </div>
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
    <section className="bg-grain py-14 sm:py-20 border-b border-soil/8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="mb-10 sm:mb-14">
          <p className="text-pepper text-sm font-bold uppercase tracking-wider mb-2">Real people</p>
          <h2 className="font-display text-3xl sm:text-4xl text-soil font-bold">What they&apos;re saying</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-grain-dim rounded-xl p-6 sm:p-7 border border-soil/10 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="text-pepper fill-pepper" />
                ))}
              </div>
              <p className="text-soil text-base leading-relaxed flex-1">
                {t.quote}
              </p>
              <div className="pt-2 border-t border-soil/10">
                <p className="font-bold text-soil text-sm">{t.name}</p>
                <p className="text-stone text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <CategoryStrip />
        <StatsStrip />
        <FeaturedProducts />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
