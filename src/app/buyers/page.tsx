'use client'

import { useState } from 'react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Check, Loader2 } from 'lucide-react'

const BENEFITS = [
  'Fresh and affordable produce',
  'Direct sourcing from farmers',
  'Reliable supply chain',
  'Easy ordering process',
]

const BUYER_TYPES = [
  { value: 'household', label: 'Household' },
  { value: 'business', label: 'Business' },
  { value: 'restaurant', label: 'Restaurant' },
]

export default function BuyersPage() {
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', location: '', buyerType: 'household', productsInterested: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
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
        <section className="bg-grain-dim py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            <div>
              <p className="font-data text-[12px] text-pepper uppercase tracking-[0.2em] mb-5">Become a Buyer</p>
              <h1 className="font-display text-soil tracking-tight mb-5" style={{ fontSize: 'clamp(30px, 4.5vw, 42px)' }}>
                Get fresh produce directly from farmers
              </h1>
              <p className="text-stone text-[15px] leading-relaxed mb-9 max-w-md">
                Whether you're a household, restaurant, or business, WEN helps you source fresh farm produce easily.
              </p>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-soil/80 text-[14.5px]">
                    <Check size={15} className="text-okra mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-grain rounded-2xl p-7 sm:p-8 border border-soil/8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-okra/10 flex items-center justify-center mx-auto mb-4">
                    <Check size={22} className="text-okra" />
                  </div>
                  <p className="font-display text-soil text-xl mb-2">You're in</p>
                  <p className="text-stone text-[14px]">We'll be in touch about sourcing produce for you.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Full Name</label>
                    <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Phone Number</label>
                    <input required type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Location</label>
                    <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Wuse 2, Abuja"
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Type of Buyer</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUYER_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setForm({ ...form, buyerType: t.value })}
                          className={`text-[13px] py-2.5 rounded-lg border transition-colors ${
                            form.buyerType === t.value
                              ? 'bg-pepper text-grain border-pepper'
                              : 'border-soil/15 text-soil/70 hover:border-soil/30'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Products You Commonly Buy</label>
                    <input value={form.productsInterested} onChange={(e) => setForm({ ...form, productsInterested: e.target.value })}
                      placeholder="e.g. Vegetables, Rice, Fish"
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                  </div>
                  {error && <p className="text-[13px] text-pepper">{error}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-pepper text-grain py-3 rounded-lg text-[14px] font-medium hover:bg-pepper-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Get Started'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
