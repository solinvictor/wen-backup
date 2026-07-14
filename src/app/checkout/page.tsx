'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import {
  ChevronLeft, ShoppingBag, Loader2, CheckCircle2, Truck,
  Phone, MapPin, User, FileText, Zap, Clock, Navigation, X,
  Hash, ExternalLink,
} from 'lucide-react'

const CATEGORY_IMAGES: Record<string, string> = {
  vegetables: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  grains:     'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  tubers:     'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  poultry:    'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  fish:       'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  fruits:     'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  dairy:      'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  spices:     'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  other:      'https://images.pexels.com/photos/1093837/pexels-photo-1093837.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
}

function fmt(n: number | null) {
  if (!n) return '—'
  return '₦' + n.toLocaleString('en-NG')
}

function genRef() {
  return 'WEN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

// ── Delivery options ───────────────────────────────────────────────────────
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
  w3w: string
  notes: string
  buyerType: 'household' | 'business' | 'restaurant'
}

interface W3WResult {
  valid: boolean
  words?: string
  lat?: number
  lng?: number
  nearestPlace?: string
  map?: string
  error?: string
}

const BUYER_TYPES = [
  { value: 'household',   label: 'Household'  },
  { value: 'business',    label: 'Business'   },
  { value: 'restaurant',  label: 'Restaurant' },
] as const

// ── Address autocomplete field ─────────────────────────────────────────────
interface Suggestion { display_name: string; lat: string; lon: string }

function AddressField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen]               = useState(false)
  const [gpsLoading, setGpsLoading]   = useState(false)
  const [gpsError, setGpsError]       = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef  = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced Nominatim search
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 3) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Nigeria')}&format=json&addressdetails=0&limit=5&countrycodes=ng`
        const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } })
        const data: Suggestion[] = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch { /* silent */ }
    }, 350)
  }, [])

  function handleChange(v: string) {
    onChange(v)
    search(v)
    setGpsError('')
  }

  function pick(s: Suggestion) {
    // Trim to the human-readable parts, drop the long country suffix
    const parts = s.display_name.split(',').slice(0, 4).join(',').trim()
    onChange(parts)
    setSuggestions([])
    setOpen(false)
  }

  // GPS → reverse geocode via Nominatim
  async function useGPS() {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported on this device')
      return
    }
    setGpsLoading(true)
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } })
          const data = await res.json()
          if (data?.display_name) {
            const parts = data.display_name.split(',').slice(0, 4).join(',').trim()
            onChange(parts)
            setSuggestions([])
            setOpen(false)
          } else {
            setGpsError('Could not read your location. Type your address instead.')
          }
        } catch {
          setGpsError('Location lookup failed. Type your address instead.')
        } finally {
          setGpsLoading(false)
        }
      },
      (err) => {
        setGpsLoading(false)
        if (err.code === 1) setGpsError('Location access denied. Type your address instead.')
        else setGpsError('Could not get your location. Type your address instead.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 mb-1.5">
        <MapPin size={13} />
        Delivery address
      </label>

      {/* Input + GPS button */}
      <div className={`flex items-center bg-grain-dim border rounded-xl overflow-hidden transition-all focus-within:border-pepper focus-within:bg-white ${error ? 'border-red-400' : 'border-soil/10'}`}>
        <input
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing your address…"
          autoComplete="off"
          className="flex-1 px-4 py-3.5 text-[15px] text-soil bg-transparent outline-none placeholder:text-stone/40"
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setSuggestions([]); setOpen(false) }}
            className="px-2 text-stone/30 hover:text-soil transition-colors"
          >
            <X size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={useGPS}
          disabled={gpsLoading}
          title="Use my current location"
          className="flex items-center gap-1.5 px-3 py-3.5 border-l border-soil/10 text-pepper hover:bg-pepper/5 transition-colors disabled:opacity-50 shrink-0"
        >
          {gpsLoading
            ? <Loader2 size={15} className="animate-spin" />
            : <Navigation size={15} />
          }
          <span className="text-[12px] font-semibold hidden sm:block">Use GPS</span>
        </button>
      </div>

      {/* GPS error */}
      {gpsError && <p className="text-[12px] text-amber-600 mt-1">{gpsError}</p>}
      {error    && <p className="text-[12px] text-red-500 mt-1">{error}</p>}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-soil/10 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => pick(s)}
              className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-grain-dim transition-colors text-left border-b border-soil/6 last:border-0"
            >
              <MapPin size={13} className="text-pepper shrink-0 mt-0.5" />
              <span className="text-[13px] text-soil leading-snug line-clamp-2">
                {s.display_name.split(',').slice(0, 5).join(', ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


// ── What3Words field ────────────────────────────────────────────────────────
function W3WField({
  value,
  onChange,
  onValidated,
}: {
  value: string
  onChange: (v: string) => void
  onValidated: (result: W3WResult | null) => void
}) {
  const [status, setStatus]   = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [result, setResult]   = useState<W3WResult | null>(null)
  const debounceRef           = useRef<ReturnType<typeof setTimeout> | null>(null)

  const validate = useCallback(async (raw: string) => {
    const clean = raw.trim().toLowerCase().replace(/^\/\/\//, '')
    const parts = clean.split('.')
    if (parts.length !== 3 || parts.some(p => !p)) {
      setStatus('idle'); setResult(null); onValidated(null); return
    }
    setStatus('checking')
    try {
      const res  = await fetch(`/api/w3w?words=${encodeURIComponent(clean)}`)
      const data: W3WResult = await res.json()
      if (data.valid) {
        setStatus('valid'); setResult(data); onValidated(data)
      } else {
        setStatus('invalid'); setResult(data); onValidated(null)
      }
    } catch {
      setStatus('invalid'); setResult({ valid: false, error: 'Could not validate — check your connection' }); onValidated(null)
    }
  }, [onValidated])

  function handleChange(v: string) {
    onChange(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setStatus('idle'); setResult(null); onValidated(null)
    const clean = v.trim().replace(/^\/\/\//, '')
    if (clean.split('.').length === 3) {
      debounceRef.current = setTimeout(() => validate(v), 600)
    }
  }

  const borderColor = status === 'valid' ? 'border-pepper' : status === 'invalid' ? 'border-red-400' : 'border-soil/10'

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-medium text-soil/70 mb-1.5">
        <Hash size={13} />
        what3words address
        <span className="text-stone/35 font-normal">(optional but recommended)</span>
      </label>
      <div className={`flex items-center bg-grain-dim border rounded-xl overflow-hidden transition-all focus-within:bg-white ${borderColor} focus-within:border-pepper`}>
        <span className="pl-4 text-stone/40 text-[15px] font-semibold select-none shrink-0">///</span>
        <input
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="word.word.word"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="flex-1 px-2 py-3.5 text-[15px] text-soil bg-transparent outline-none placeholder:text-stone/35"
        />
        {status === 'checking' && <Loader2 size={15} className="animate-spin text-stone/40 mr-3 shrink-0" />}
        {status === 'valid'    && <CheckCircle2 size={15} className="text-pepper mr-3 shrink-0" />}
        {value && (
          <button type="button" onClick={() => { onChange(''); setStatus('idle'); setResult(null); onValidated(null) }}
                  className="px-2 text-stone/30 hover:text-soil transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Status feedback */}
      {status === 'valid' && result && (
        <div className="mt-2 flex items-center justify-between bg-pepper/6 border border-pepper/20 rounded-xl px-3 py-2">
          <div>
            <p className="text-[12px] font-semibold text-pepper-deep">///{result.words}</p>
            {result.nearestPlace && (
              <p className="text-[11px] text-stone/50 mt-0.5">Near {result.nearestPlace}</p>
            )}
          </div>
          {result.map && (
            <a href={result.map} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 text-[11px] text-pepper font-semibold hover:underline shrink-0 ml-3">
              View map <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}
      {status === 'invalid' && result?.error && (
        <p className="text-[12px] text-red-500 mt-1">{result.error}</p>
      )}
      {status === 'idle' && !value && (
        <p className="text-[11.5px] text-stone/40 mt-1">
          Find yours at <a href="https://what3words.com" target="_blank" rel="noopener noreferrer" className="text-pepper hover:underline">what3words.com</a> — precise 3m delivery pin for our rider.
        </p>
      )}
    </div>
  )
}

// ── Main checkout ──────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const { cartLines, cartCount, cartTotal, clearCart } = useCart()
  const [step, setStep]           = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [orderRef, setOrderRef]   = useState('')
  const [delivery, setDelivery]   = useState<DeliveryId>('standard')
  const [form, setForm]           = useState<FormData>({
    fullName: '', phone: '', address: '', w3w: '', notes: '', buyerType: 'household',
  })
  const [w3wResult, setW3wResult]   = useState<W3WResult | null>(null)
  const [errors, setErrors] = useState<Partial<FormData>>({})

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
          fullName:    form.fullName,
          phoneNumber: form.phone,
          location:    form.address,
          buyerType:   form.buyerType,
          notes:       form.notes,
          deliveryType: delivery,
          deliveryFee,
          w3wAddress:  w3wResult?.words  ?? null,
          w3wLat:      w3wResult?.lat    ?? null,
          w3wLng:      w3wResult?.lng    ?? null,
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

  // ── Success ──────────────────────────────────────────────────────────────
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
            <h1 className="font-display text-soil text-2xl font-bold mb-2">Order received!</h1>
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

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-grain-dim flex flex-col">
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

            {/* Delivery speed picker */}
            <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
                <Truck size={16} className="text-pepper" />
                <h2 className="font-display text-soil text-[16px] font-semibold">Delivery speed</h2>
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
                      {/* Badge */}
                      <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5 ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                      {/* Icon + label row */}
                      <div className="flex items-center gap-2">
                        <opt.Icon
                          size={18}
                          className={active ? 'text-pepper' : 'text-stone/50'}
                          strokeWidth={active ? 2.2 : 1.8}
                        />
                        <span className={`text-[15px] font-semibold ${active ? 'text-soil' : 'text-soil/70'}`}>
                          {opt.label}
                        </span>
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
                      {/* Selected ring dot */}
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
                <h2 className="font-display text-soil text-[16px] font-semibold">Your details</h2>
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

                {/* what3words — precise rider location */}
                <W3WField
                  value={form.w3w}
                  onChange={v => setForm({ ...form, w3w: v })}
                  onValidated={setW3wResult}
                />

                {/* Address with GPS + autocomplete */}
                <AddressField
                  value={form.address}
                  onChange={v => setForm({ ...form, address: v })}
                  error={errors.address}
                />

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
                <h2 className="font-display text-soil text-[16px] font-semibold">Order summary</h2>
                <span className="ml-auto font-data text-[12px] text-stone/40">{cartCount} items</span>
              </div>

              {/* Line items */}
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

              {/* Totals */}
              <div className="px-5 py-4 border-t border-soil/8 space-y-2">
                {hasPrices && (
                  <div className="flex justify-between text-[13px] text-stone/60">
                    <span>Subtotal</span>
                    <span>{fmt(cartTotal)}</span>
                  </div>
                )}
                {/* Delivery row — always shown, updates live */}
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
                <div className="flex justify-between font-display text-soil text-[16px] font-bold pt-2 border-t border-soil/8">
                  <span>Total</span>
                  <span>{grandTotal ? fmt(grandTotal) : hasPrices ? fmt(deliveryFee) : '—'}</span>
                </div>
                <p className="text-[11px] text-stone/40">Final price confirmed before delivery</p>
              </div>

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
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
