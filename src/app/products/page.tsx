'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Plus, Minus, ShoppingBasket, X, Check, Loader2, ArrowLeft, Search } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  unit: string | null
  is_available: boolean
}

interface CartLine {
  id: string
  name: string
  category: string
  unit: string | null
  quantity: number
}

const CATEGORY_LABELS: Record<string, string> = {
  vegetables: 'Vegetables',
  grains: 'Grains',
  tubers: 'Tubers',
  poultry: 'Poultry',
  fish: 'Fish',
  other: 'Other',
}

const CATEGORY_EMOJI: Record<string, string> = {
  vegetables: '🥬',
  grains: '🌾',
  tubers: '🍠',
  poultry: '🍗',
  fish: '🐟',
  other: '🛒',
}

const CATEGORY_IMAGES: Record<string, string> = {
  vegetables: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  grains: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  tubers: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  poultry: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  fish: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  other: 'https://images.pexels.com/photos/1093837/pexels-photo-1093837.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: 'f-tomatoes', name: 'Tomatoes', category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f-pepper', name: 'Pepper', category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f-spinach', name: 'Spinach', category: 'vegetables', unit: 'per bunch', is_available: true },
  { id: 'f-okra', name: 'Okra', category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f-rice', name: 'Rice', category: 'grains', unit: 'per bag', is_available: true },
  { id: 'f-beans', name: 'Beans', category: 'grains', unit: 'per bag', is_available: true },
  { id: 'f-maize', name: 'Maize', category: 'grains', unit: 'per bag', is_available: true },
  { id: 'f-yam', name: 'Yam', category: 'tubers', unit: 'per tuber', is_available: true },
  { id: 'f-cassava', name: 'Cassava', category: 'tubers', unit: 'per bag', is_available: true },
  { id: 'f-sweetpotato', name: 'Sweet Potato', category: 'tubers', unit: 'per basket', is_available: true },
  { id: 'f-chicken', name: 'Chicken', category: 'poultry', unit: 'per bird', is_available: true },
  { id: 'f-eggs', name: 'Eggs', category: 'poultry', unit: 'per crate', is_available: true },
  { id: 'f-catfish', name: 'Catfish', category: 'fish', unit: 'per kg', is_available: true },
  { id: 'f-tilapia', name: 'Tilapia', category: 'fish', unit: 'per kg', is_available: true },
]

const BUYER_TYPES = [
  { value: 'household', label: 'Household' },
  { value: 'business', label: 'Business' },
  { value: 'restaurant', label: 'Restaurant' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [sheetOpen, setSheetOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'details' | 'success'>('review')
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', location: '', buyerType: 'household', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('category')
        if (data && data.length > 0) {
          setProducts(data)
        } else {
          setProducts(FALLBACK_PRODUCTS)
          setUsingFallback(true)
        }
      } catch {
        setProducts(FALLBACK_PRODUCTS)
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const filtered = query.trim()
      ? products.filter(p => p.name.toLowerCase().includes(query.trim().toLowerCase()))
      : products
    return filtered.reduce<Record<string, Product[]>>((acc, p) => {
      acc[p.category] = acc[p.category] || []
      acc[p.category].push(p)
      return acc
    }, {})
  }, [products, query])

  const categories = Object.keys(grouped)

  // Set first category as active on load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  // Intersection observer to update active pill as user scrolls
  useEffect(() => {
    if (query.trim()) return
    const observers: IntersectionObserver[] = []
    categories.forEach((cat) => {
      const el = sectionRefs.current[cat]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCategory(cat) },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [categories, query])

  function scrollToCategory(cat: string) {
    setActiveCategory(cat)
    const el = sectionRefs.current[cat]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartLines = Object.values(cart)
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0)

  function addOne(p: { id: string; name: string; category: string; unit: string | null }) {
    setCart(prev => {
      const existing = prev[p.id]
      return {
        ...prev,
        [p.id]: {
          id: p.id, name: p.name, category: p.category, unit: p.unit,
          quantity: (existing?.quantity || 0) + 1,
        },
      }
    })
  }

  function removeOne(p: { id: string }) {
    setCart(prev => {
      const existing = prev[p.id]
      if (!existing) return prev
      if (existing.quantity <= 1) {
        const next = { ...prev }
        delete next[p.id]
        return next
      }
      return { ...prev, [p.id]: { ...existing, quantity: existing.quantity - 1 } }
    })
  }

  function openCart() {
    setCheckoutStep('review')
    setSheetOpen(true)
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.location.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          location: form.location,
          buyerType: form.buyerType,
          notes: form.notes,
          items: cartLines.map(l => ({ name: l.name, category: l.category, unit: l.unit, quantity: l.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setCheckoutStep('success')
      setCart({})
    } catch {
      setError('Could not submit your request. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1 pb-32">
        {/* Hero */}
        <section className="bg-grain pt-20 pb-6 sm:pt-28">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[12px] text-pepper uppercase tracking-[0.2em] mb-3">Fresh from the farm</p>
            <h1 className="font-display text-soil tracking-tight mb-3" style={{ fontSize: 'clamp(28px, 5vw, 44px)' }}>
              What are you shopping for?
            </h1>
            {/* Search bar — prominent, Instacart-style */}
            <div className="relative mt-5 max-w-lg">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search produce — tomatoes, yam, fish…"
                className="w-full bg-white border border-soil/12 shadow-sm rounded-2xl pl-12 pr-4 py-3.5 text-[15px] text-soil outline-none focus:border-pepper focus:shadow-md transition-all"
              />
            </div>
            {usingFallback && (
              <p className="text-stone/50 text-[11px] mt-3 italic">
                Showing typical categories — live availability updates as farmers list produce.
              </p>
            )}
          </div>
        </section>

        {/* Sticky category pill nav — Instacart-style */}
        {!loading && categories.length > 0 && (
          <div className="sticky top-0 z-30 bg-grain/95 backdrop-blur border-b border-soil/8">
            <div className="max-w-5xl mx-auto px-5 sm:px-8">
              <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    className={`flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-soil text-grain shadow-sm'
                        : 'bg-grain-dim text-stone border border-soil/10 hover:border-soil/20'
                    }`}
                  >
                    <span>{CATEGORY_EMOJI[cat] || '🛒'}</span>
                    <span>{CATEGORY_LABELS[cat] || cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product grid */}
        <section className="bg-grain">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-stone/40" />
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone text-[15px]">No produce matching &quot;{query}&quot;.</p>
                <button onClick={() => setQuery('')} className="mt-3 text-pepper text-[14px] font-medium">Clear search</button>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([category, items]) => (
                  <div
                    key={category}
                    ref={(el) => { sectionRefs.current[category] = el }}
                    className="scroll-mt-24"
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-2xl">{CATEGORY_EMOJI[category] || '🛒'}</span>
                      <h2 className="font-display text-soil text-xl">{CATEGORY_LABELS[category] || category}</h2>
                      <span className="font-data text-[11px] text-stone/50 ml-1">{items.length} items</span>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {items.map((item) => {
                        const inCart = cart[item.id]
                        return (
                          <div
                            key={item.id}
                            className={`bg-white rounded-2xl overflow-hidden border transition-all ${
                              inCart ? 'border-pepper shadow-sm' : 'border-soil/8 hover:border-soil/16 hover:shadow-sm'
                            }`}
                          >
                            {/* Image with overlaid +/counter — Instacart pattern */}
                            <div className="relative aspect-square bg-soil/5">
                              <img
                                src={CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.other}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              {/* Overlay control */}
                              <div className="absolute bottom-2 right-2">
                                {inCart ? (
                                  <div className="flex items-center gap-1 bg-soil rounded-full px-1.5 py-1 shadow-lg">
                                    <button
                                      onClick={() => removeOne(item)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                      aria-label={`Remove one ${item.name}`}
                                    >
                                      <Minus size={12} className="text-grain" />
                                    </button>
                                    <span className="text-grain text-[12px] font-bold font-data w-4 text-center">{inCart.quantity}</span>
                                    <button
                                      onClick={() => addOne(item)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                      aria-label={`Add another ${item.name}`}
                                    >
                                      <Plus size={12} className="text-grain" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addOne(item)}
                                    className="w-8 h-8 rounded-full bg-pepper flex items-center justify-center shadow-lg hover:bg-pepper-deep transition-colors"
                                    aria-label={`Add ${item.name}`}
                                  >
                                    <Plus size={16} className="text-grain" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Card body */}
                            <div className="px-3 py-3">
                              <p className="text-soil text-[13px] font-semibold leading-tight">{item.name}</p>
                              {item.unit && (
                                <p className="font-data text-[11px] text-stone/60 mt-0.5">{item.unit}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Floating cart bar */}
      {cartCount > 0 && !sheetOpen && (
        <button
          onClick={openCart}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-soil text-grain rounded-full pl-4 pr-6 py-3.5 flex items-center gap-3 shadow-xl hover:bg-soil/90 transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-pepper text-grain text-[12px] font-bold font-data flex items-center justify-center">
            {cartCount}
          </span>
          <span className="text-[14px] font-medium flex items-center gap-2">
            <ShoppingBasket size={16} />
            View my list
          </span>
        </button>
      )}

      {/* Cart sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-soil/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-grain rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-grain border-b border-soil/8 px-5 py-4 flex items-center justify-between">
              {checkoutStep === 'details' ? (
                <button onClick={() => setCheckoutStep('review')} className="text-soil flex items-center gap-1.5 text-[14px]">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <h3 className="font-display text-soil text-lg">
                  {checkoutStep === 'success' ? 'Request sent' : 'Your list'}
                </h3>
              )}
              <button onClick={() => setSheetOpen(false)} className="text-stone hover:text-soil transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {checkoutStep === 'review' && (
                <>
                  {cartLines.length === 0 ? (
                    <p className="text-stone text-[14px] py-8 text-center">Your list is empty.</p>
                  ) : (
                    <div className="space-y-2 mb-6">
                      {cartLines.map(line => (
                        <div key={line.id} className="flex items-center justify-between gap-3 bg-grain-dim rounded-xl px-4 py-3">
                          <div>
                            <p className="text-soil text-[14px] font-medium">{line.name}</p>
                            {line.unit && <p className="font-data text-[11px] text-stone">{line.unit}</p>}
                          </div>
                          <div className="flex items-center gap-2 bg-grain rounded-full px-1 py-1 border border-soil/10">
                            <button onClick={() => removeOne(line)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-grain-dim transition-colors">
                              <Minus size={12} className="text-soil" />
                            </button>
                            <span className="text-soil text-[12px] font-data w-4 text-center">{line.quantity}</span>
                            <button onClick={() => addOne(line)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-grain-dim transition-colors">
                              <Plus size={12} className="text-soil" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setCheckoutStep('details')}
                    disabled={cartLines.length === 0}
                    className="w-full bg-pepper text-grain text-[14px] font-medium py-3.5 rounded-full hover:bg-pepper-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue — {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </button>
                </>
              )}

              {checkoutStep === 'details' && (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <p className="text-stone text-[13px] mb-2">
                    We&apos;ll use these details to match your list with a verified farmer and confirm pricing.
                  </p>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">Full name</label>
                    <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="w-full bg-grain-dim border border-soil/10 rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors" />
                  </div>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">Phone number</label>
                    <input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                      className="w-full bg-grain-dim border border-soil/10 rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors" />
                  </div>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">Delivery location</label>
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                      className="w-full bg-grain-dim border border-soil/10 rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors" />
                  </div>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">I&apos;m ordering as a</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUYER_TYPES.map(t => (
                        <button key={t.value} type="button" onClick={() => setForm({ ...form, buyerType: t.value })}
                          className={`text-[12px] font-medium py-2.5 rounded-xl border transition-colors ${
                            form.buyerType === t.value
                              ? 'bg-soil text-grain border-soil'
                              : 'bg-grain-dim text-stone border-soil/10 hover:border-soil/20'
                          }`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">Notes (optional)</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                      className="w-full bg-grain-dim border border-soil/10 rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors resize-none" />
                  </div>
                  {error && <p className="text-[13px] text-red-500">{error}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-pepper text-grain text-[14px] font-medium py-3.5 rounded-full hover:bg-pepper-deep transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {submitting ? 'Sending…' : 'Send my list'}
                  </button>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-pepper/15 flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-pepper-deep" />
                  </div>
                  <p className="text-soil text-[15px] font-medium mb-2">We&apos;ve got your list</p>
                  <p className="text-stone text-[13px] max-w-xs mx-auto mb-6">
                    A WEN team member will reach out on {form.phoneNumber} to confirm pricing and delivery.
                  </p>
                  <button onClick={() => { setSheetOpen(false); setCheckoutStep('review') }}
                    className="text-pepper-deep text-[14px] font-medium">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
