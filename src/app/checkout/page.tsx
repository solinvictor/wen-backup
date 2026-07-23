'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { CATEGORY_IMAGES } from '@/lib/category-images'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import {
  ChevronLeft, ShoppingBag, Loader2, CheckCircle2, Truck,
  Phone, MapPin, User, FileText, Zap, Clock, Navigation, Pencil,
} from 'lucide-react'

const LocationMapPicker = lazy(() => import('@/components/LocationMapPicker'))

function fmt(n: number | null) {
  if (!n) return '—'
  return '₦' + n.toLocaleString('en-NG')
}

function genRef() {
  return 'WEN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

const DELIVERY_OPTIONS = [
  {
    id: 'standard' as const,
    label: 'Standard delivery',
    duration: '3 days',
    fee: 1500,
    Icon: Clock,
    badge: 'Most popular',
    badgeColor: 'bg-soil/8 text-soil/60',
    desc: 'Fresh from farm, delivered within 3 days',
  },
  {
    id: 'express' as const,
    label: 'Express delivery',
    duration: '24 hours',
    fee: 3500,
    Icon: Zap,
    badge: 'Fastest',
    badgeColor: 'bg-amber-50 text-amber-700',
    desc: 'Priority harvest & same-day dispatch',
  },
]

type DeliveryId = 'standard' | 'express'
type Step = 'details' | 'success'

interface FormData {
  fullName: string
  phone: string
  address: string
  notes: string
  buyerType: 'household' | 'business' | 'restaurant'
}

const BUYER_TYPES = [
  { value: 'household',   label: 'Household'  },
  { value: 'business',    label: 'Business'   },
  { value: 'restaurant',  label: 'Restaurant' },
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const { cartLines, cartCount, cartTotal, clearCart } = useCart()
  const [step, setStep]             = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [orderRef, setOrderRef]     = useState('')
  const [delivery, setDelivery]     = useState<DeliveryId>('standard')
  const [form, setForm]             = useState<FormData>({
    fullName: '', phone: '', address: '', notes: '', buyerType: 'household',
  })
  const [errors, setErrors]         = useState<Partial<FormData>>({})
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showMap, setShowMap]       = useState(false)

  useEffect(() => {
    if (cartCount === 0 && step !== 'success') router.replace('/store')
  }, [cartCount, step, router])

  const hasPrices   = cartLines.some(l => l.price)
  const deliveryOpt = DELIVERY_OPTIONS.find(o => o.id === delivery)!
  const deliveryFee = deliveryOpt.fee
  const grandTotal  = hasPrices ? (cartTotal ?? 0) + deliveryFee : null

  function validate(): boolean {
    const e: Partial<FormData> = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = 'Enter your full name'
    if (!/^0[789][01]\d{8}$/.test(form.phone.trim())) e.phone = 'Enter a valid Nigerian phone number'
    if (!form.address.trim() || form.address.trim().length < 5) e.address = 'Tap "Set delivery location" to pin your location'
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
          fullName:    form.fullName,
          phoneNumber: form.phone,
          location:    form.address,
          deliveryLat: deliveryCoords?.lat ?? null,
          deliveryLng: deliveryCoords?.lng ?? null,
          buyerType:   form.buyerType,
          notes:       form.notes,
          deliveryType: delivery,
          deliveryFee,
          items: cartLines.map(l => ({
            name: l.name, category: l.category, unit: l.unit,
            quantity: l.quantity, price: l.price,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong. Try again.'); return }
      setOrderRef(genRef())
      clearCart()
      setStep('success')
    } catch {
      setError('Could not place order. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    const deliveryText = delivery === 'express'
      ? 'Your order will be dispatched within hours and arrive within 24 hours.'
      : 'Your order will be harvested fresh and delivered within 3 days.'
    return (
      <div className="min-h-screen bg-grain-dim flex flex-col">
        <header className="bg-white border-b border-soil/8 px-5 h-14 flex items-center">
          <Link href="/" className="font-display text-xl font-bold text-soil">WEN</Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-pepper/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-pepper" strokeWidth={1.8} />
            </div>
            <h1 className="font-body text-soil text-2xl font-bold mb-2">Order received!</h1>
            <p className="text-stone/60 text-[14px] leading-relaxed mb-1">
              We&apos;ll call <span className="font-semibold text-soil">{form.phone}</span> to confirm.
            </p>
            <div className="inline-flex items-center gap-2 bg-white border border-soil/10 rounded-full px-4 py-2 mt-4 mb-8">
              <span className="text-stone/50 text-[12px]">Order ref</span>
              <span className="font-data text-soil text-[13px] font-bold tracking-wider">{orderRef}</span>
            </div>
            <div className="bg-white rounded-2xl border border-soil/8 p-5 text-left mb-8 space-y-4">
              <p className="text-soil text-[13px] font-semibold mb-3">What happens next</p>
              {[
                { icon: Phone, text: 'We call you within 2 hours to confirm your order' },
                { icon: Truck, text: deliveryText },
                { icon: MapPin, text: `Delivered to: ${form.address}` },
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

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Map picker overlay */}
      {showMap && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
            <Loader2 size={28} className="animate-spin text-pepper" />
          </div>
        }>
          <LocationMapPicker
            onConfirm={(coords, label) => {
              setDeliveryCoords(coords)
              setForm(f => ({ ...f, address: label }))
              setErrors(e => ({ ...e, address: undefined }))
              setShowMap(false)
            }}
            onClose={() => setShowMap(false)}
          />
        </Suspense>
      )}

      <div className="min-h-screen bg-grain-dim flex flex-col">
        <header className="bg-white border-b border-soil/8 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1.5 -ml-1 text-soil/60 hover:text-soil transition-colors">
              <ChevronLeft size={22} />
            </button>
            <span className="font-body text-soil text-[17px] font-semibold">Checkout</span>
            <div className="flex-1" />
            <Link href="/" className="font-display text-xl font-bold text-soil">WEN</Link>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

            {/* ── Left: form ── */}
            <div className="w-full lg:flex-1 space-y-5">

              {/* Delivery speed picker */}
              <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
                  <Truck size={16} className="text-pepper" />
                  <h2 className="font-body text-soil text-[16px] font-semibold">Delivery speed</h2>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DELIVERY_OPTIONS.map(opt => {
                    const active = delivery === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDelivery(opt.id)}
                        className={`relative flex flex-col gap-1.5 text-left p-4 rounded-xl border-2 transition-all ${
                          active
                            ? 'border-pepper bg-pepper/4 shadow-sm'
                            : 'border-soil/10 bg-grain-dim hover:border-soil/25'
                        }`}
                      >
                        <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5 ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                        <div className="flex items-center gap-2">
                          <opt.Icon size={18} className={active ? 'text-pepper' : 'text-stone/50'} strokeWidth={active ? 2.2 : 1.8} />
                          <span className={`text-[15px] font-semibold ${active ? 'text-soil' : 'text-soil/70'}`}>{opt.label}</span>
                        </div>
                        <p className="text-[12px] text-stone/55 leading-snug">{opt.desc}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`font-data text-[13px] font-bold ${active ? 'text-pepper-deep' : 'text-soil/60'}`}>
                            + {fmt(opt.fee)}
                          </span>
                          <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-full ${
                            active ? 'bg-pepper text-white' : 'bg-soil/8 text-soil/50'
                          }`}>
                            {opt.duration}
                          </span>
                        </div>
                        {active && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-pepper flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Delivery details card */}
              <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
                  <MapPin size={16} className="text-pepper" />
                  <h2 className="font-body text-soil text-[16px] font-semibold">Your details</h2>
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

                  {/* Location picker */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 mb-1.5">
                      <MapPin size={13} />
                      Delivery location
                    </label>

                    {form.address ? (
                      /* Location set — show it with an edit button */
                      <div className={`flex items-start gap-3 border rounded-xl px-4 py-3.5 bg-green-50 ${errors.address ? 'border-red-400' : 'border-green-200'}`}>
                        <MapPin size={15} className="text-green-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-soil leading-snug">{form.address}</p>
                          {deliveryCoords && (
                            <p className="text-[11px] text-green-600 font-medium mt-0.5">📍 Exact pin saved</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMap(true)}
                          className="shrink-0 text-soil/40 hover:text-pepper transition-colors p-1"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    ) : (
                      /* No location yet — big tap target */
                      <button
                        type="button"
                        onClick={() => setShowMap(true)}
                        className={`w-full flex items-center justify-center gap-2.5 border-2 border-dashed rounded-xl py-5 transition-all hover:border-pepper hover:bg-pepper/3 ${
                          errors.address ? 'border-red-400 bg-red-50' : 'border-soil/20 bg-grain-dim'
                        }`}
                      >
                        <Navigation size={18} className={errors.address ? 'text-red-400' : 'text-pepper'} />
                        <span className={`text-[15px] font-semibold ${errors.address ? 'text-red-500' : 'text-soil/70'}`}>
                          Set delivery location
                        </span>
                      </button>
                    )}
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
                      placeholder="Any special instructions…"
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

            {/* ── Right: order summary ── */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden sticky top-24">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
                  <ShoppingBag size={16} className="text-pepper" />
                  <h2 className="font-body text-soil text-[16px] font-semibold">Order summary</h2>
                  <span className="ml-auto font-data text-[12px] text-stone/40">{cartCount} items</span>
                </div>

                <div className="px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
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

                <div className="px-5 py-4 border-t border-soil/8 space-y-2">
                  {hasPrices && (
                    <div className="flex justify-between text-[13px] text-stone/60">
                      <span>Subtotal</span>
                      <span>{fmt(cartTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px] text-stone/60">
                    <span className="flex items-center gap-1.5">
                      {deliveryOpt.id === 'express'
                        ? <Zap size={12} className="text-amber-500" />
                        : <Clock size={12} className="text-soil/40" />
                      }
                      Delivery ({deliveryOpt.duration})
                    </span>
                    <span className={deliveryOpt.id === 'express' ? 'text-amber-600 font-semibold' : ''}>
                      {fmt(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-body text-soil text-[16px] font-bold pt-2 border-t border-soil/8">
                    <span>Total</span>
                    <span>{grandTotal ? fmt(grandTotal) : hasPrices ? fmt(deliveryFee) : '—'}</span>
                  </div>
                  <p className="text-[11px] text-stone/40">Final price confirmed before delivery</p>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Placing order…' : 'Place order'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}
