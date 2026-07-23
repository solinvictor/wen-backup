'use client'

import { useState } from 'react'
import { validateName, validatePhone, validateLocation, validateText, type FieldError } from '@/lib/validate'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Check, Loader2 } from 'lucide-react'

const FARMER_PHOTOS = [
  { src: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', caption: 'Rice farmers, Northern Nigeria' },
  { src: 'https://images.pexels.com/photos/5529555/pexels-photo-5529555.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', caption: 'Fresh produce at local farm' },
  { src: 'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', caption: 'Harvest season' },
  { src: 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', caption: 'Poultry farming' },
]

const FARMER_STATS = [
  { value: '200+', label: 'Active suppliers' },
  { value: '₦0',   label: 'Commission charged' },
  { value: '48h',  label: 'Avg. payment time' },
  { value: '5+',   label: 'States covered' },
]

const BENEFITS = [
  'WEN contacts you directly — no middlemen involved',
  'Get paid at fair, consistent prices',
  'No market stress or price haggling',
  'Faster sales — we buy what you list',
  'Ongoing relationship with the WEN team',
]

export default function FarmersPage() {
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', location: '', produceType: '', estimatedQuantity: '', farmingExperience: '',
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
    const produceErr = validateText(form.produceType, 'Type of produce')
    if (nameErr) errs.fullName = nameErr
    if (phoneErr) errs.phoneNumber = phoneErr
    if (locationErr) errs.location = locationErr
    if (produceErr) errs.produceType = produceErr
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/farmers', {
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
        <section className="market-board py-12 sm:py-20 lg:py-28 relative overflow-hidden">
          {/* Hero background — farmer in field */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/6231764/pexels-photo-6231764.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-soil/78" />
          </div>
          <div className="relative z-10 w-full">
            <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

              <div>
                <p className="font-data text-[12px] text-turmeric uppercase tracking-[0.2em] mb-4 sm:mb-5">Supply to WEN</p>
                <h1 className="font-display text-grain tracking-tight mb-4 sm:mb-5" style={{ fontSize: 'clamp(26px, 4.5vw, 42px)' }}>
                  List your produce.<br />WEN buys directly.
                </h1>
                <p className="text-grain/70 text-[14px] sm:text-[15px] leading-relaxed mb-7 sm:mb-9 max-w-md">
                  Tell us what you have available. Our team reviews your listing, reaches out, and purchases from you at fair prices — no agents, no stress.
                </p>
                <ul className="space-y-3">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-grain/80 text-[14px] sm:text-[14.5px]">
                      <Check size={15} className="text-turmeric mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-grain rounded-2xl p-5 sm:p-7 lg:p-8">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-okra/10 flex items-center justify-center mx-auto mb-4">
                      <Check size={22} className="text-okra" />
                    </div>
                    <p className="font-body text-soil text-xl font-semibold mb-2">Application received</p>
                    <p className="text-stone text-[14px]">We'll reach out to verify your details soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-soil mb-1.5">Full Name</label>
                      <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper transition-colors bg-white ${fieldErrors.fullName ? "border-red-400" : "border-soil/15"}`} />
                      {fieldErrors.fullName && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.fullName}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium text-soil mb-1.5">Phone Number</label>
                        <input required type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                          className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper transition-colors bg-white ${fieldErrors.phoneNumber ? "border-red-400" : "border-soil/15"}`} />
                        {fieldErrors.phoneNumber && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.phoneNumber}</p>}
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-soil mb-1.5">Location</label>
                        <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="e.g. Gwagwalada, Abuja"
                          className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper transition-colors bg-white ${fieldErrors.location ? "border-red-400" : "border-soil/15"}`} />
                        {fieldErrors.location && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.location}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-soil mb-1.5">Type of Produce</label>
                      <input required value={form.produceType} onChange={(e) => setForm({ ...form, produceType: e.target.value })}
                        placeholder="e.g. Tomatoes, Yam, Catfish"
                        className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper transition-colors bg-white ${fieldErrors.produceType ? "border-red-400" : "border-soil/15"}`} />
                      {fieldErrors.produceType && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.produceType}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-soil mb-1.5">Estimated Quantity Available</label>
                      <input value={form.estimatedQuantity} onChange={(e) => setForm({ ...form, estimatedQuantity: e.target.value })}
                        placeholder="e.g. 20 baskets per week"
                        className="w-full border border-soil/15 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-soil mb-1.5">Farming Experience <span className="text-stone">(optional)</span></label>
                      <textarea rows={2} value={form.farmingExperience} onChange={(e) => setForm({ ...form, farmingExperience: e.target.value })}
                        className="w-full border border-soil/15 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-pepper transition-colors resize-none bg-white" />
                    </div>
                    {error && <p className="text-[13px] text-pepper">{error}</p>}
                    <button type="submit" disabled={submitting}
                      className="w-full bg-pepper text-grain py-3.5 rounded-xl text-[14px] font-semibold hover:bg-pepper-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Submit Application'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── Farmer photo strip ─────────────────────────────────────── */}
        <section className="bg-grain py-14 sm:py-20">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="mb-8">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Our farmers</p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl">The people behind your food</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
              {FARMER_PHOTOS.map(({ src, caption }) => (
                <div key={caption} className="group relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img
                    src={src}
                    alt={caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-soil/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-grain text-[11px] font-medium">{caption}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {FARMER_STATS.map(({ value, label }) => (
                <div key={label} className="bg-grain-dim rounded-2xl p-5 text-center">
                  <p className="font-body text-soil text-3xl font-bold mb-1">{value}</p>
                  <p className="text-stone text-[12px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why supply to WEN ──────────────────────────────────────── */}
        <section className="bg-grain-dim py-14 sm:py-16">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-10">
              <p className="font-data text-[11px] text-pepper uppercase tracking-[0.2em] mb-2">Why WEN</p>
              <h2 className="font-display text-soil text-2xl sm:text-3xl">A better deal for farmers</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: 'No middlemen', body: 'WEN buys directly from you. No agents, no market brokers taking a cut of your earnings.' },
                { title: 'Fair pricing', body: 'We agree on prices upfront and stick to them — no last-minute haggling or underpaying at pickup.' },
                { title: 'Reliable demand', body: 'We buy consistently. List your stock once and we reach out whenever we need what you have.' },
              ].map(({ title, body }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-soil/8">
                  <div className="w-8 h-1 bg-pepper rounded-full mb-4" />
                  <h3 className="font-body text-soil text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-soil/70 text-[14px] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

