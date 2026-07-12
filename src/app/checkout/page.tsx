'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ChevronLeft, ShoppingBag, Loader2, CheckCircle2, Truck, Phone, MapPin, User, FileText } from 'lucide-react'

const CATEGORY_IMAGES: Record<string, string> = {
  vegetables: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  grains: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  tubers: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  poultry: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  fish: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  fruits: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  dairy: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  spices: 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  other: 'https://images.pexels.com/photos/1093837/pexels-photo-1093837.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
}

function fmt(n: number | null) {
  if (!n) return '—'
  return '₦' + n.toLocaleString('en-NG')
}

function genRef() {
  return 'WEN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

type Step = 'details' | 'success'

interface FormData {
  fullName: string
  phone: string
  address: string
  notes: string
  buyerType: 'household' | 'business' | 'restaurant'
}

const BUYER_TYPES = [
  { value: 'household',  label: 'Household'  },
  { value: 'business',   label: 'Business'   },
  { value: 'restaurant', label: 'Restaurant' },
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const { cartLines, cartCount, cartTotal, clearCart } = useCart()
  const [step, setStep] = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
    buyerType: 'household',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Redirect to store if cart is empty and not on success
  useEffect(() => {
    if (cartCount === 0 && step !== 'success') {
      router.replace('/store')
    }
  }, [cartCount, step, router])

  const hasPrices = cartLines.some(l => l.price)

  function validate(): boolean {
    const e: Partial<FormData> = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = 'Enter your full name'
    if (!/^0[789][01]\d{8}$/.test(form.phone.trim())) e.phone = 'Enter a valid Nigerian phone number'
    if (!form.address.trim() || form.address.trim().length < 5) e.address = 'Enter your delivery address'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phoneNumber: form.phone,
          location: form.address,
          buyerType: form.buyerType,
          notes: form.notes,
          items: cartLines.map(l => ({
            name: l.name,
            category: l.category,
            unit: l.unit,
            quantity: l.quantity,
            price: l.price,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong. Try again.'); return }
      const ref = genRef()
      setOrderRef(ref)
      clearCart()
      setStep('success')
    } catch {
      setError('Could not place order. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-grain-dim flex flex-col">
        {/* Minimal header */}
        <header className="bg-white border-b border-soil/8 px-5 h-14 flex items-center">
          <Link href="/" className="font-display text-xl font-bold text-soil">WEN</Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-md text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-pepper/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-pepper" strokeWidth={1.8} />
            </div>

            <h1 className="font-display text-soil text-2xl font-bold mb-2">Order received!</h1>
            <p className="text-stone/60 text-[14px] leading-relaxed mb-1">
              We&apos;ll call <span className="font-semibold text-soil">{form.phone}</span> to confirm your delivery details and pricing.
            </p>

            {/* Order ref */}
            <div className="inline-flex items-center gap-2 bg-white border border-soil/10 rounded-full px-4 py-2 mt-4 mb-8">
              <span className="text-stone/50 text-[12px]">Order ref</span>
              <span className="font-data text-soil text-[13px] font-bold tracking-wider">{orderRef}</span>
            </div>

            {/* What happens next */}
            <div className="bg-white rounded-2xl border border-soil/8 p-5 text-left mb-8 space-y-4">
              <p className="text-soil text-[13px] font-semibold mb-3">What happens next</p>
              {[
                { icon: Phone,  text: 'We call you within 2 hours to confirm your order' },
                { icon: Truck,  text: 'Farmer prepares fresh produce for your delivery' },
                { icon: MapPin, text: 'Delivered to your door, same day or next morning' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-pepper/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={15} className="text-pepper-deep" />
                  </div>
                  <p className="text-stone/70 text-[13px] leading-relaxed pt-1">{text}</p>
                </div>
              ))}
            </div>

            <Link
              href="/store"
              className="w-full inline-flex items-center justify-center gap-2 bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep transition-colors"
            >
              <ShoppingBag size={17} />
              Continue shopping
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // ── Checkout form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-grain-dim flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-soil/8 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 -ml-1 text-soil/60 hover:text-soil transition-colors">
            <ChevronLeft size={22} />
          </button>
          <span className="font-display text-soil text-[17px] font-semibold">Checkout</span>
          <div className="flex-1" />
          <Link href="/" className="font-display text-xl font-bold text-soil">WEN</Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

          {/* ── Left: form ── */}
          <div className="w-full lg:flex-1 space-y-5">

            {/* Delivery details card */}
            <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
                <Truck size={16} className="text-pepper" />
                <h2 className="font-display text-soil text-[16px] font-semibold">Delivery details</h2>
              </div>

              <div className="px-5 py-5 space-y-4">
                {/* Full name */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 mb-1.5">
                    <User size={13} />
                    Full name
                  </label>
                  <input
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Your full name"
                    className={`w-full bg-grain-dim border rounded-xl px-4 py-3.5 text-[15px] text-soil outline-none focus:border-pepper focus:bg-white transition-all ${errors.fullName ? 'border-red-400' : 'border-soil/10'}`}
                  />
                  {errors.fullName && <p className="text-[12px] text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 mb-1.5">
                    <Phone size={13} />
                    Phone number
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="08012345678"
                    type="tel"
                    className={`w-full bg-grain-dim border rounded-xl px-4 py-3.5 text-[15px] text-soil outline-none focus:border-pepper focus:bg-white transition-all ${errors.phone ? 'border-red-400' : 'border-soil/10'}`}
                  />
                  {errors.phone && <p className="text-[12px] text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 mb-1.5">
                    <MapPin size={13} />
                    Delivery address
                  </label>
                  <input
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. 14 High Level Road, Makurdi"
                    className={`w-full bg-grain-dim border rounded-xl px-4 py-3.5 text-[15px] text-soil outline-none focus:border-pepper focus:bg-white transition-all ${errors.address ? 'border-red-400' : 'border-soil/10'}`}
                  />
                  {errors.address && <p className="text-[12px] text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* Buyer type */}
                <div>
                  <label className="text-[13px] font-medium text-soil/70 block mb-2">I&apos;m ordering as a</label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUYER_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, buyerType: t.value })}
                        className={`text-[13px] font-medium py-2.5 rounded-xl border transition-all ${
                          form.buyerType === t.value
                            ? 'bg-soil text-white border-soil'
                            : 'bg-grain-dim text-stone border-soil/10 hover:border-soil/25'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 mb-1.5">
                    <FileText size={13} />
                    Notes <span className="text-stone/40 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any special instructions for your order…"
                    rows={3}
                    className="w-full bg-grain-dim border border-soil/10 rounded-xl px-4 py-3.5 text-[15px] text-soil outline-none focus:border-pepper focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-[13px] text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* ── Right: order summary (desktop) ── */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden sticky top-24">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
                <ShoppingBag size={16} className="text-pepper" />
                <h2 className="font-display text-soil text-[16px] font-semibold">Order summary</h2>
                <span className="ml-auto font-data text-[12px] text-stone/40">{cartCount} items</span>
              </div>

              <div className="px-4 py-3 space-y-2 max-h-72 overflow-y-auto">
                {cartLines.map(line => {
                  const img = line.imageUrl || CATEGORY_IMAGES[line.category] || CATEGORY_IMAGES.other
                  return (
                    <div key={line.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-soil/8">
                        <img src={img} alt={line.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-soil text-[13px] font-medium truncate">{line.name}</p>
                        <p className="text-stone/45 text-[11px] font-data">×{line.quantity}</p>
                      </div>
                      <p className="text-soil text-[13px] font-semibold font-data shrink-0">
                        {line.price ? fmt(line.price * line.quantity) : '—'}
                      </p>
                    </div>
                  )
                })}
              </div>

              {hasPrices && (
                <div className="px-5 py-4 border-t border-soil/8 space-y-2">
                  <div className="flex justify-between text-[13px] text-stone/60">
                    <span>Subtotal</span>
                    <span>{fmt(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-stone/60">
                    <span>Delivery</span>
                    <span className="text-pepper-deep font-medium">Confirmed on call</span>
                  </div>
                  <div className="flex justify-between font-display text-soil text-[16px] font-bold pt-1 border-t border-soil/8">
                    <span>Estimated total</span>
                    <span>{fmt(cartTotal)}</span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Placing order…' : 'Place order'}
                </button>
                <p className="text-center text-stone/40 text-[11px] mt-3">
                  Final price confirmed before delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
