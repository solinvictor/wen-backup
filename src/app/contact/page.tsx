'use client'

import { useState } from 'react'
import { validateName, validatePhone, validateEmail, validateMessage, type FieldError } from '@/lib/validate'
import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Check, Loader2, Phone, Mail, MapPin, Clock, ArrowRight, MessageSquare, Headphones, Building2 } from 'lucide-react'

const CONTACT_PHONE = ''
const CONTACT_EMAIL = ''

const CONTACT_REASONS = [
  { value: 'order', label: 'Order enquiry', icon: '📦' },
  { value: 'partnership', label: 'Partnership', icon: '🤝' },
  { value: 'farmer', label: 'Farmer onboarding', icon: '🌱' },
  { value: 'other', label: 'Other', icon: '💬' },
]

const QUICK_LINKS = [
  {
    icon: MessageSquare,
    title: 'Chat with us',
    desc: 'Fastest response via WhatsApp',
    action: 'Open WhatsApp',
    href: 'https://wa.me/234800000000',
  },
  {
    icon: Headphones,
    title: 'Call us',
    desc: CONTACT_PHONE || 'Available on request',
    action: 'Call now',
    href: CONTACT_PHONE ? `tel:${CONTACT_PHONE}` : '#',
  },
  {
    icon: Building2,
    title: 'Visit us',
    desc: 'Abuja, Nigeria',
    action: 'Get directions',
    href: '#',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', reason: 'order', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const errs: FieldError = {}
    const nameErr = validateName(form.name)
    const phoneErr = form.phone ? validatePhone(form.phone) : null
    const emailErr = validateEmail(form.email)
    const messageErr = validateMessage(form.message)
    if (nameErr) errs.name = nameErr
    if (phoneErr) errs.phone = phoneErr
    if (emailErr) errs.email = emailErr
    if (messageErr) errs.message = messageErr
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
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

        {/* Hero strip */}
        <section className="relative bg-soil overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600&h=600&fit=crop"
              alt=""
              aria-hidden
              className="w-full h-full object-cover opacity-10"
            />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[11px] font-semibold text-pepper uppercase tracking-[0.2em] mb-3"
            >
              Contact WEN
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 }}
              className="font-display text-white leading-tight tracking-tight mb-4"
              style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}
            >
              We're here to help.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="text-white/50 text-[15px] max-w-md"
            >
              Reach out about orders, partnerships, or anything else. We respond within 24 hours.
            </motion.p>
          </div>
        </section>

        {/* Quick links */}
        <section className="bg-grain border-b border-soil/8">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUICK_LINKS.map((item, i) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className="group flex items-center gap-4 bg-white border border-soil/8 hover:border-pepper/30 hover:shadow-md rounded-2xl px-5 py-4 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-pepper/8 flex items-center justify-center shrink-0 group-hover:bg-pepper/14 transition-colors">
                    <item.icon size={18} className="text-pepper" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-soil text-[13.5px] font-semibold">{item.title}</p>
                    <p className="text-stone/60 text-[12px] truncate">{item.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-stone/30 group-hover:text-pepper group-hover:translate-x-0.5 transition-all shrink-0" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Main form + info */}
        <section className="bg-grain-dim py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

            {/* Left info */}
            <div className="lg:col-span-2">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-4">Get in touch</p>
              <h2 className="font-display text-soil tracking-tight mb-4" style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}>
                Send us a message
              </h2>
              <p className="text-stone text-[14.5px] leading-relaxed mb-8">
                Fill in the form and our team will get back to you as soon as possible.
              </p>

              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-pepper/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={14} className="text-pepper" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-soil uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-stone/70 text-[14px]">{CONTACT_PHONE || 'Available on request'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-pepper/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={14} className="text-pepper" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-soil uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-stone/70 text-[14px]">{CONTACT_EMAIL || 'Available on request'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-pepper/8 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} className="text-pepper" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-soil uppercase tracking-wide mb-0.5">Location</p>
                    <p className="text-stone/70 text-[14px]">Abuja, Nigeria</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-pepper/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={14} className="text-pepper" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-soil uppercase tracking-wide mb-0.5">Business Hours</p>
                    <p className="text-stone/70 text-[14px]">Mon – Sat, 9:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Response badge */}
              <div className="inline-flex items-center gap-2 bg-okra/10 border border-okra/20 rounded-full px-4 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-okra animate-pulse" />
                <span className="text-[12px] font-semibold text-okra">Usually responds within 24 hours</span>
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
                  <p className="font-display text-soil text-2xl mb-2">Message received</p>
                  <p className="text-stone text-[14px] max-w-xs mx-auto">Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-7 sm:p-8 space-y-5">
                  {/* Reason selector */}
                  <div>
                    <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-2.5">What's this about?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CONTACT_REASONS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setForm({ ...form, reason: r.value })}
                          className={`flex items-center gap-2.5 text-[13px] py-2.5 px-3.5 rounded-xl border transition-all ${
                            form.reason === r.value
                              ? 'bg-pepper text-white border-pepper shadow-sm'
                              : 'border-soil/12 text-soil/70 hover:border-soil/25 bg-grain-dim'
                          }`}
                        >
                          <span>{r.icon}</span>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 transition-all bg-grain-dim placeholder:text-stone/35 ${fieldErrors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-soil/12 focus:border-pepper focus:ring-pepper/10'}`}
                      />
                      {fieldErrors.name && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+234 800 000 0000"
                        className="w-full border border-soil/12 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper focus:ring-2 focus:ring-pepper/10 transition-all bg-grain-dim placeholder:text-stone/35"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">
                      Email <span className="text-stone/40 normal-case tracking-normal font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full border border-soil/12 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper focus:ring-2 focus:ring-pepper/10 transition-all bg-grain-dim placeholder:text-stone/35"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-soil uppercase tracking-wide mb-1.5">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what's on your mind..."
                      className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 transition-all resize-none bg-grain-dim placeholder:text-stone/35 ${fieldErrors.message ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-soil/12 focus:border-pepper focus:ring-pepper/10'}`}
                    />
                    {fieldErrors.message && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.message}</p>}
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
                      <><Loader2 size={14} className="animate-spin" /> Sending...</>
                    ) : (
                      <>Send message <ArrowRight size={14} /></>
                    )}
                  </button>
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

