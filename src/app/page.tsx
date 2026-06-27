'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import SectionTransition from '@/components/landing/SectionTransition'
import { ArrowRight, Leaf, Users, Truck, Scale, Recycle } from 'lucide-react'

const CATEGORIES = [
  { name: 'Tomatoes', unit: 'per basket', price: '₦8,500', image: 'https://images.pexels.com/photos/162830/tomatoes-tomato-harvest-healthy-food-162830.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Yam', unit: 'per tuber', price: '₦1,200', image: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Catfish', unit: 'per kg', price: '₦2,800', image: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Rice', unit: 'per bag', price: '₦42,000', image: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Pepper', unit: 'per basket', price: '₦6,000', image: 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Eggs', unit: 'per crate', price: '₦3,400', image: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
]

const STEPS = [
  {
    title: 'Farmers list produce',
    body: 'Farmers upload available farm produce such as vegetables, grains, poultry, and more.',
    image: 'https://images.pexels.com/photos/7728332/pexels-photo-7728332.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop',
  },
  {
    title: 'Buyers place orders',
    body: 'Households, restaurants, and businesses browse and order directly.',
    image: 'https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop',
  },
  {
    title: 'WEN coordinates delivery',
    body: 'We connect, confirm, and ensure smooth delivery from farm to buyer.',
    image: 'https://images.pexels.com/photos/12725414/pexels-photo-12725414.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop',
  },
]

const WHY = [
  { icon: Leaf, text: 'Fresh and affordable farm produce' },
  { icon: Users, text: 'Direct connection to farmers' },
  { icon: Scale, text: 'Fair pricing for both farmers and buyers' },
  { icon: Recycle, text: 'Reduced food waste and middleman exploitation' },
  { icon: Truck, text: 'Reliable sourcing for homes and businesses' },
]

function StepBlock({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.3'],
  })
  const numberScale = useTransform(scrollYProgress, [0, 1], [0.7, 1])
  const numberOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 0.4])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1])

  const reversed = index % 2 === 1

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 sm:py-24 border-b border-soil/8 last:border-b-0">
      <div className={reversed ? 'lg:order-2' : ''}>
        <motion.p
          className="font-data text-okra leading-none mb-5 select-none"
          style={{ scale: numberScale, opacity: numberOpacity, fontSize: 'clamp(64px, 10vw, 120px)', transformOrigin: 'left center' }}
        >
          {String(index + 1).padStart(2, '0')}
        </motion.p>
        <h3 className="font-display text-soil text-2xl sm:text-3xl tracking-tight mb-3">{step.title}</h3>
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
    </div>
  )
}

export default function HomePage() {
  const heroImgRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroImgRef,
    offset: ['start start', 'end start'],
  })
  // Background drifts slower than the page scrolls — the classic parallax cue,
  // applied only here in the hero where it earns its keep.
  const heroImgY = useTransform(heroProgress, [0, 1], ['0%', '20%'])

  return (
    <>
      <Nav />
      <main className="flex-1">

        {/* ── HERO — market board ───────────────────────────────────── */}
        <section className="market-board relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
              <div className="max-w-2xl">
                <p className="font-data text-[12px] text-turmeric uppercase tracking-[0.2em] mb-5">
                  Farm to Market, Direct
                </p>
                <h1 className="font-display text-grain leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(38px, 6vw, 64px)' }}>
                  Fresh farm produce,<br />
                  <span className="italic text-turmeric">direct</span> from trusted farmers.
                </h1>
                <p className="text-grain/70 text-[16px] sm:text-[17px] leading-relaxed max-w-lg mb-9">
                  WEN connects farmers directly to buyers to ensure fresh produce, fair pricing, and faster delivery across communities.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/products" className="inline-flex items-center gap-2 bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors">
                    Browse Products <ArrowRight size={15} />
                  </Link>
                  <Link href="/farmers" className="inline-flex items-center gap-2 border border-grain/25 text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-grain/5 transition-colors">
                    Become a Farmer
                  </Link>
                  <Link href="/buyers" className="inline-flex items-center gap-2 border border-grain/25 text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-grain/5 transition-colors">
                    Become a Buyer
                  </Link>
                </div>
              </div>

              {/* Real produce photography — gives the hero something to "feel" beyond type+color */}
              <div ref={heroImgRef} className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-square">
                <motion.img
                  src="https://images.pexels.com/photos/1093837/pexels-photo-1093837.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop"
                  alt="Fresh produce at market"
                  className="absolute inset-0 w-full h-[130%] object-cover"
                  style={{ y: heroImgY, top: '-15%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-soil/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Market board — signature element: chalkboard price strip with thumbnails */}
            <div className="mt-16 sm:mt-20 border-t border-grain/10 pt-8">
              <p className="font-data text-[11px] text-grain/40 uppercase tracking-[0.2em] mb-4">Today at the market</p>
              <div className="flex flex-wrap gap-x-7 gap-y-4">
                {CATEGORIES.map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <img src={c.image} alt={c.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-grain text-[15px]">{c.name}</span>
                      <span className="font-data text-[12px] text-turmeric">{c.price}</span>
                      <span className="font-data text-[11px] text-grain/40">{c.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS — sequential scroll blocks, not a flat grid ── */}
        <SectionTransition>
          <section className="bg-grain py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight mb-2">How it works</h2>
              <p className="text-stone text-[15px] mb-4 max-w-md">Three steps, start to finish.</p>
              <div>
                {STEPS.map((step, i) => (
                  <StepBlock key={step.title} step={step} index={i} />
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* ── WHY WEN ────────────────────────────────────────────────── */}
        <SectionTransition>
          <section className="bg-grain-dim py-20 sm:py-28">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <h2 className="font-display text-soil text-3xl sm:text-4xl tracking-tight mb-3">Why WEN</h2>
              <p className="text-stone text-[15px] mb-12 max-w-md">
                Reduced food waste, fair pricing on both sides, and a direct line between farm and table.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {WHY.map(({ icon: Icon, text }) => (
                  <div key={text} className="bg-grain rounded-2xl p-5 sm:p-6 border border-soil/8">
                    <Icon size={20} className="text-okra mb-4" />
                    <p className="text-soil text-[14px] sm:text-[15px] leading-snug">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* ── CLOSING CTA ────────────────────────────────────────────── */}
        <section className="market-board py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="font-display text-grain text-3xl sm:text-4xl tracking-tight mb-5">
              Join the network.
            </h2>
            <p className="text-grain/60 text-[15px] mb-8 max-w-md mx-auto">
              Whether you grow it or you buy it, WEN gets it there faster.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/farmers" className="bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors">
                Become a Farmer
              </Link>
              <Link href="/buyers" className="border border-grain/25 text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-grain/5 transition-colors">
                Become a Buyer
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}


