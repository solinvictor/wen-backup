'use client'

import { useState } from 'react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Check, Loader2, Phone, Mail, MapPin } from 'lucide-react'

// TODO before demo: replace with WEN's real contact phone and email.
// Currently shown as "Available on request" everywhere on this page.
const CONTACT_PHONE = '' // e.g. '+234 800 000 0000'
const CONTACT_EMAIL = '' // e.g. 'hello@wen.ng'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
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
        <section className="bg-grain py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            <div>
              <p className="font-data text-[12px] text-pepper uppercase tracking-[0.2em] mb-5">Contact Us</p>
              <h1 className="font-display text-soil tracking-tight mb-5" style={{ fontSize: 'clamp(30px, 4.5vw, 42px)' }}>
                Let's connect
              </h1>
              <p className="text-stone text-[15px] leading-relaxed mb-9 max-w-md">
                Have questions, want to partner, or need more information?
              </p>

              <div className="space-y-4 mb-9">
                <div className="flex items-center gap-3 text-soil/80 text-[14.5px]">
                  <Phone size={16} className="text-pepper" />
                  <span>{CONTACT_PHONE || 'Available on request'}</span>
                </div>
                <div className="flex items-center gap-3 text-soil/80 text-[14.5px]">
                  <Mail size={16} className="text-pepper" />
                  <span>{CONTACT_EMAIL || 'Available on request'}</span>
                </div>
                <div className="flex items-center gap-3 text-soil/80 text-[14.5px]">
                  <MapPin size={16} className="text-pepper" />
                  <span>Abuja, Nigeria</span>
                </div>
              </div>

              <div className="bg-grain-dim rounded-xl p-5 inline-block">
                <p className="font-data text-[11px] text-stone uppercase tracking-wide mb-1">Business Hours</p>
                <p className="text-soil text-[14px]">Monday – Saturday, 9:00 AM – 6:00 PM</p>
              </div>
            </div>

            <div className="bg-grain-dim rounded-2xl p-7 sm:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-okra/10 flex items-center justify-center mx-auto mb-4">
                    <Check size={22} className="text-okra" />
                  </div>
                  <p className="font-display text-soil text-xl mb-2">Message sent</p>
                  <p className="text-stone text-[14px]">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Name</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Email <span className="text-stone">(optional)</span></label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Phone <span className="text-stone">(optional)</span></label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-soil mb-1.5">Message</label>
                    <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors resize-none bg-white" />
                  </div>
                  {error && <p className="text-[13px] text-pepper">{error}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-pepper text-grain py-3 rounded-lg text-[14px] font-medium hover:bg-pepper-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : 'Send Message'}
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

