'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ArrowRight, Leaf, Users, Truck, ShieldCheck } from 'lucide-react'

const CATEGORIES = [
  { name: 'Tomatoes',  unit: 'per basket', price: '₦8,500',  emoji: '🍅', image: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Yam',       unit: 'per tuber',  price: '₦1,200',  emoji: '🍠', image: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Catfish',   unit: 'per kg',     price: '₦2,800',  emoji: '🐟', image: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Rice',      unit: 'per bag',    price: '₦42,000', emoji: '🌾', image: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Pepper',    unit: 'per basket', price: '₦6,000',  emoji: '🌶️', image: 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Eggs',      unit: 'per crate',  price: '₦3,400',  emoji: '🥚', image: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Plantain',  unit: 'per bunch',  price: '₦2,100',  emoji: '🍌', image: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Groundnut', unit: 'per tin',    price: '₦1,800',  emoji: '🥜', image: 'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
]

const TRUST = [
  { icon: Leaf,        label: 'Farm fresh, always' },
  { icon: Users,       label: 'Verified farmers only' },
  { icon: ShieldCheck, label: 'Fair pricing, guaranteed' },
  { icon: Truck,       label: 'Reliable delivery' },
]

const HOW = [
  {
    num: '01',
    title: 'Farmers list produce',
    body: 'Verified farmers upload what\'s available — vegetables, grains, poultry, and more — with real prices.',
    image: 'https://images.pexels.com/photos/7728332/pexels-photo-7728332.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    num: '02',
    title: 'Buyers place orders',
    body: 'Households, restaurants, and businesses browse and order directly from farmers. No middlemen.',
    image: 'https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    num: '03',
    title: 'WEN handles the rest',
    body: 'We confirm, coordinate, and ensure smooth delivery from farm gate to your door.',
    image: 'https://images.pexels.com/photos/12725414/pexels-photo-12725414.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
]

function ProductCard({ item, index }: { item: (typeof CATEGORIES)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-grain rounded-2xl overflow-hidden border border-soil/8 hover:border-pepper/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <p className="font-display text-soil text-[16px] tracking-tight mb-0.5">{item.name}</p>
        <p className="font-data text-[11px] text-stone mb-3">{item.unit}</p>
        <div className="flex items-center justify-between">
          <span className="font-data text-[15px] font-semibold text-pepper">{item.price}</span>
          <Link
            href="/buyers"
            className="text-[12px] font-medium text-soil bg-turmeric/40 hover:bg-pepper hover:text-grain px-3 py-1.5 rounded-full transition-colors"
          >
            Order
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function HowStep({ step, index }: { step: (typeof HOW)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.25'] })
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1])
  const reversed = index % 2 === 1

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-14 sm:py-20 border-b border-soil/8 last:border-b-0"
    >
      <div className={reversed ? 'lg:order-2' : ''}>
        <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-4">{step.num}</p>
        <h3 className="font-display text-soil text-2xl sm:text-3xl tracking-tight leading-snug mb-4">{step.title}</h3>
        <p className="text-stone text-[15px] sm:text-[16px] leading-relaxed max-w-md">{step.body}</p>
      </div>
      <div className={reversed ? 'lg:order-1' : ''}>
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
          <motion.img
            src={step.image}
            alt={step.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ scale: imgScale }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start end', 'end start'] })
  const heroY = useTransform(heroProgress, [0, 1], ['-12%', '12%'])

  return (
    <>
      <Nav />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="market-board relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-0 sm:pt-28">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-end">

              {/* Copy */}
              <div className="pb-16 sm:pb-24 max-w-2xl">
                {/* Trust strip */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
                  {TRUST.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon size={12} className="text-pepper" />
                      <span className="font-data text-[11px] text-grain/50 uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>

                <h1
                  className="font-display text-grain leading-[1.03] tracking-tight mb-6"
                  style={{ fontSize: 'clamp(40px, 6vw, 68px)' }}
                >
                  Fresh produce,<br />
                  <em className="text-pepper not-italic">straight</em> from<br />
                  the farm.
                </h1>

                <p className="text-grain/60 text-[16px] sm:text-[17px] leading-relaxed max-w-lg mb-9">
                  WEN cuts out the middlemen. Farmers list what they have.
                  Buyers order direct. Everyone wins.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-pepper text-grain text-[14px] font-medium px-6 py-3.5 rounded-full hover:bg-pepper-deep transition-colors"
                  >
                    Shop produce <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/farmers"
                    className="inline-flex items-center gap-2 border border-grain/20 text-grain text-[14px] font-medium px-6 py-3.5 rounded-full hover:bg-grain/5 transition-colors"
                  >
                    Sell your harvest
                  </Link>
                </div>
              </div>

              {/* Hero image — bleeds to bottom of section */}
              <div ref={heroRef} className="relative overflow-hidden rounded-t-2xl aspect-[3/4] lg:aspect-[4/5] self-end">
                <motion.img
                  src="https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"
                  alt="Fresh farm produce"
                  className="absolute inset-0 w-full h-[130%] object-cover"
                  style={{ y: heroY, top: '-15%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-soil/60 via-transparent to-transparent" />

                {/* Floating price badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-6 left-5 right-5 bg-grain/10 backdrop-blur-md border border-grain/20 rounded-xl p-4"
                >
                  <p className="font-data text-[10px] text-grain/50 uppercase tracking-widest mb-2">Today at the market</p>
                  <div className="flex gap-3 overflow-hidden">
                    {CATEGORIES.slice(0, 4).map((c) => (
                      <div key={c.name} className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-xl">{c.emoji}</span>
                        <span className="font-data text-[10px] text-grain/70">{c.price}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ── PRODUCT GRID ─────────────────────────────────────────── */}
        <section className="bg-grain-dim py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Available now</p>
                <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight">What's in season</h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-pepper hover:text-pepper-deep transition-colors"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {CATEGORIES.map((item, i) => (
                <ProductCard key={item.name} item={item} index={i} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-pepper"
              >
                View all produce <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="bg-grain py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="mb-4">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Simple process</p>
              <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight">Farm to your door</h2>
            </div>
            {HOW.map((step, i) => (
              <HowStep key={step.num} step={step} index={i} />
            ))}
          </div>
        </section>

        {/* ── DUAL CTA — farmer vs buyer split ─────────────────────── */}
        <section className="bg-grain-dim py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Farmer card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="market-board rounded-2xl p-8 sm:p-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-pepper/10 blur-3xl pointer-events-none" />
                <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-4">For farmers</p>
                <h3
                  className="font-display text-grain tracking-tight leading-snug mb-4"
                  style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
                >
                  Sell direct.<br />
                  <em className="text-pepper not-italic">Keep more.</em>
                </h3>
                <p className="text-grain/60 text-[14px] leading-relaxed mb-7 max-w-xs">
                  No middlemen taking cuts. List your produce, set your price, get paid fairly.
                </p>
                <Link
                  href="/farmers"
                  className="inline-flex items-center gap-2 bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors"
                >
                  Join as a farmer <ArrowRight size={14} />
                </Link>
              </motion.div>

              {/* Buyer card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-grain rounded-2xl p-8 sm:p-10 border border-soil/8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-pepper/5 blur-3xl pointer-events-none" />
                <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-4">For buyers</p>
                <h3
                  className="font-display text-soil tracking-tight leading-snug mb-4"
                  style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
                >
                  Fresh produce.<br />
                  <em className="text-pepper not-italic">Fair prices.</em>
                </h3>
                <p className="text-stone text-[14px] leading-relaxed mb-7 max-w-xs">
                  Households, restaurants, businesses — get fresh produce delivered direct from trusted farmers.
                </p>
                <Link
                  href="/buyers"
                  className="inline-flex items-center gap-2 bg-soil text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-soil/80 transition-colors"
                >
                  Start buying <ArrowRight size={14} />
                </Link>
              </motion.div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
