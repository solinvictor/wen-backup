'use client'

import { useState } from 'react'
import { validateName, validatePhone, validateLocation, type FieldError } from '@/lib/validate'
import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Check, Loader2, ArrowRight, Leaf, Truck, ShieldCheck, Clock } from 'lucide-react'

const BENEFITS = [
  {
    icon: Leaf,
    title: 'Farm-direct freshness',
    desc: 'Produce sourced directly from verified farmers — no middlemen, no delays.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified supply chain',
    desc: 'Every farmer on WEN is vetted for quality and consistency.',
  },
  {
    icon: Truck,
    title: 'Reliable delivery',
    desc: 'We handle logistics so your produce arrives on time, every time.',
  },
  {
    icon: Clock,
    title: 'Easy reordering',
    desc: 'Once we know your needs, repeat orders are handled with one message.',
  },
]

const BUYER_TYPES = [
  { value: 'household', label: 'Household', emoji: '🏠', desc: 'For my family' },
  { value: 'business', label: 'Business', emoji: '🏢', desc: 'Bulk orders' },
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️', desc: 'My kitchen' },
]

const SOCIAL_PROOF = [
  { value: '200+', label: 'Verified farmers' },
  { value: '5,000+', label: 'Orders delivered' },
  { value: '98%', label: 'On-time delivery' },
]

export default function BuyersPage() {
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', location: '', buyerType: 'household', productsInterested: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const errs: FieldError = {}
    const nameErr = validateName(form.fullName)
    const phoneErr = validatePhone(form.phoneNumber)
    const locationErr = validateLocation(form.location)
    if (nameErr) errs.fullName = nameErr
    if (phoneErr) errs.phoneNumber = phoneErr
    if (locationErr) errs.location = locationErr
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-grain border-b border-soil/8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/8476597/pexels-photo-8476597.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop"
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/86" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16 lg:py-20">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[11px] font-semibold text-pepper uppercase tracking-[0.2em] mb-3"
            >
              For buyers
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 }}
              className="font-display text-soil leading-tight tracking-tight mb-4"
              style={{ fontSize: 'clamp(26px, 5vw, 52px)' }}
            >
              Fresh produce.<br />
              <span className="text-pepper">Fair prices.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="text-stone text-[14px] sm:text-[15px] leading-relaxed mb-7 sm:mb-8 max-w-lg"
            >
              Whether you're feeding a family, running a restaurant, or sourcing for your business — WEN connects you directly to farmers across Nigeria.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-5 sm:gap-6"
            >
              {SOCIAL_PROOF.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-soil text-2xl tracking-tight">{s.value}</p>
                  <p className="text-stone/60 text-[12px] font-medium">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-grain border-b border-soil/8 py-10 sm:py-12">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className="bg-white border border-soil/8 rounded-2xl p-5"
                >
                  <div className="w-9 h-9 rounded-xl bg-pepper/8 flex items-center justify-center mb-4">
                    <b.icon size={16} className="text-pepper" />
                  </div>
                  <p className="text-soil text-[14px] font-semibold mb-1.5">{b.title}</p>
                  <p className="text-stone/65 text-[13px] leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form section */}
        <section className="bg-grain-dim py-10 sm:py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-14">

            {/* Left copy */}
            <div className="lg:col-span-2">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-4">Get started</p>
              <h2 className="font-display text-soil tracking-tight mb-4" style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}>
                Register as a buyer
              </h2>
              <p className="text-stone text-[14px] sm:text-[14.5px] leading-relaxed mb-7 sm:mb-8">
                Tell us what you need. We'll match you with the right farmers and handle everything from sourcing to delivery.
              </p>

              {/* How it works */}
              <div className="space-y-4 sm:space-y-5">
                {[
                  { step: '01', text: 'Fill in the form below' },
                  { step: '02', text: 'We match you with verified farmers' },
                  { step: '03', text: 'Your produce is sourced and delivered' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3.5">
                    <span className="font-data text-[11px] font-bold text-pepper/60 w-6 shrink-0">{item.step}</span>
                    <div className="h-px flex-1 bg-soil/10" />
                    <span className="text-soil/75 text-[13px] sm:text-[13.5px] font-medium text-right max-w-[160px]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-3 bg-white rounded-2xl border border-soil/8 shadow-sm overflow-hidden"
            >
              {submitted ? (
                <div className="text-center py-16 px-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="w-14 h-14 rounded-full bg-okra/10 flex items-center justify-center mx-auto mb-5"
                  >
                    <Check size={24} className="text-okra" />
                  </motion.div>
                  <p className="font-display text-soil text-2xl mb-2">You're in the list</p>
                  <p className="text-stone text-[14px] max-w-xs mx-auto">We'll be in touch soon to connect you with the right farmers.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 sm:p-7 lg:p-8 space-y-5">

                  {/* Buyer type selector */}
                  <div>
                    <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-2.5">I am buying for</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUYER_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setForm({ ...form, buyerType: t.value })}
                          className={`flex flex-col items-center gap-1 text-center py-3 px-2 rounded-xl border transition-all ${
                            form.buyerType === t.value
                              ? 'bg-pepper text-white border-pepper shadow-sm'
                              : 'border-soil/12 text-soil/70 hover:border-soil/25 bg-grain-dim'
                          }`}
                        >
                          <span className="text-xl">{t.emoji}</span>
                          <span className="text-[12.5px] font-semibold leading-tight">{t.label}</span>
                          <span className={`text-[11px] leading-tight hidden sm:block ${form.buyerType === t.value ? 'text-white/70' : 'text-stone/50'}`}>
                            {t.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">Full Name</label>
                      <input
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="Your name"
                        className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 transition-all bg-grain-dim placeholder:text-stone/35 ${fieldErrors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-soil/12 focus:border-pepper focus:ring-pepper/10'}`}
                      />
                      {fieldErrors.fullName && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="08012345678"
                        className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 transition-all bg-grain-dim placeholder:text-stone/35 ${fieldErrors.phoneNumber ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-soil/12 focus:border-pepper focus:ring-pepper/10'}`}
                      />
                      {fieldErrors.phoneNumber && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.phoneNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">Your Location</label>
                    <input
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Wuse 2, Abuja"
                      className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 transition-all bg-grain-dim placeholder:text-stone/35 ${fieldErrors.location ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-soil/12 focus:border-pepper focus:ring-pepper/10'}`}
                    />
                    {fieldErrors.location && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">
                      Products you commonly buy{' '}
                      <span className="text-stone/40 normal-case tracking-normal font-normal">(optional)</span>
                    </label>
                    <input
                      value={form.productsInterested}
                      onChange={(e) => setForm({ ...form, productsInterested: e.target.value })}
                      placeholder="e.g. Tomatoes, Yam, Catfish, Rice"
                      className="w-full border border-soil/12 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper focus:ring-2 focus:ring-pepper/10 transition-all bg-grain-dim placeholder:text-stone/35"
                    />
                  </div>

                  {error && (
                    <p className="text-[13px] text-pepper bg-pepper/5 border border-pepper/15 rounded-lg px-4 py-2.5">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-pepper text-white py-3.5 rounded-xl text-[14px] font-semibold hover:bg-pepper-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {submitting ? (
                      <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                    ) : (
                      <>Get started <ArrowRight size={14} /></>
                    )}
                  </button>

                  <p className="text-center text-[12px] text-stone/45">
                    No spam. We only reach out about your order.
                  </p>
                </form>
              )}
            </motion.div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
