'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import SectionTransition from '@/components/landing/SectionTransition'
import { ArrowRight, Leaf, Users, Truck, ShieldCheck } from 'lucide-react'

const CATEGORIES = [
  { name: 'Vegetables', image: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Tubers',     image: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Fish',       image: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Grains',     image: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  { name: 'Poultry',    image: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
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
    body: 'Verified farmers upload what\'s available — vegetables, grains, poultry, and more.',
    image: 'https://images.pexels.com/photos/7728332/pexels-photo-7728332.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    num: '02',
    title: 'Buyers send a list',
    body: 'Households, restaurants, and businesses build a list of what they need. No price haggling upfront.',
    image: 'https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    num: '03',
    title: 'WEN matches and delivers',
    body: 'We match your list with a verified farmer, confirm pricing directly with you, and coordinate delivery.',
    image: 'https://images.pexels.com/photos/12725414/pexels-photo-12725414.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
]

function CategoryTile({ item, index }: { item: (typeof CATEGORIES)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        href="/products"
        className="group block bg-grain rounded-2xl overflow-hidden border border-soil/8 hover:border-pepper/40 hover:shadow-md transition-all duration-300"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-3.5">
          <p className="font-display text-soil text-[15px] tracking-tight">{item.name}</p>
        </div>
      </Link>
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
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">

              <div className="max-w-2xl">
                <p className="font-data text-[12px] text-turmeric uppercase tracking-[0.2em] mb-5">
                  Farm to Market, Direct
                </p>
                <h1 className="font-display text-grain leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(38px, 6vw, 64px)' }}>
                  Fresh farm produce,<br />
                  <em className="text-turmeric not-italic">direct</em> from trusted farmers.
                </h1>
                <p className="text-grain/70 text-[16px] sm:text-[17px] leading-relaxed max-w-lg mb-9">
                  WEN connects farmers directly to buyers. Build your list, we'll match you with a verified farmer and confirm pricing.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/products" className="inline-flex items-center gap-2 bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors">
                    Start your list <ArrowRight size={15} />
                  </Link>
                  <Link href="/farmers" className="inline-flex items-center gap-2 border border-grain/25 text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-grain/5 transition-colors">
                    Become a Farmer
                  </Link>
                </div>

                {/* Trust strip */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-10">
                  {TRUST.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon size={12} className="text-turmeric" />
                      <span className="font-data text-[10.5px] text-grain/50 uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={heroRef} className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-square">
                <motion.img
                  src="https://images.pexels.com/photos/1093837/pexels-photo-1093837.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop"
                  alt="Fresh produce at market"
                  className="absolute inset-0 w-full h-[140%] object-cover"
                  style={{ y: heroY, top: '-20%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-soil/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES — leads straight into the real product model ── */}
        <SectionTransition>
          <section className="bg-grain-dim py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Browse by category</p>
                  <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight">What are you looking for?</h2>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-pepper hover:text-pepper-deep transition-colors"
                >
                  See all produce <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {CATEGORIES.map((item, i) => (
                  <CategoryTile key={item.name} item={item} index={i} />
                ))}
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link href="/products" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-pepper">
                  See all produce <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <SectionTransition>
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
        </SectionTransition>

        {/* ── DUAL CTA — farmer vs buyer split ─────────────────────── */}
        <SectionTransition>
          <section className="bg-grain-dim py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="market-board rounded-2xl p-8 sm:p-10 relative overflow-hidden"
                >
                  <p className="font-data text-[11px] text-turmeric uppercase tracking-[0.2em] mb-4">For farmers</p>
                  <h3 className="font-display text-grain tracking-tight leading-snug mb-4" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
                    Sell direct.<br />
                    <em className="text-turmeric not-italic">Keep more.</em>
                  </h3>
                  <p className="text-grain/60 text-[14px] leading-relaxed mb-7 max-w-xs">
                    No middlemen taking cuts. List your produce, WEN brings you buyers, you set fair prices.
                  </p>
                  <Link href="/farmers" className="inline-flex items-center gap-2 bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors">
                    Join as a farmer <ArrowRight size={14} />
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-grain rounded-2xl p-8 sm:p-10 border border-soil/8 relative overflow-hidden"
                >
                  <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-4">For buyers</p>
                  <h3 className="font-display text-soil tracking-tight leading-snug mb-4" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
                    Fresh produce.<br />
                    <em className="text-pepper not-italic">Fair prices.</em>
                  </h3>
                  <p className="text-stone text-[14px] leading-relaxed mb-7 max-w-xs">
                    Build a list, we match you with a verified farmer and confirm pricing before delivery.
                  </p>
                  <Link href="/buyers" className="inline-flex items-center gap-2 bg-soil text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-soil/80 transition-colors">
                    Start buying <ArrowRight size={14} />
                  </Link>
                </motion.div>

              </div>
            </div>
          </section>
        </SectionTransition>

      </main>
      <Footer />
    </>
  )
}
