'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StoreNav } from '@/components/StoreNav'
import { Footer } from '@/components/Footer'
import { Plus, Minus, ShoppingCart, X, Check, Loader2, ArrowLeft, Search } from 'lucide-react'
import { validateName, validatePhone, validateLocation, type FieldError } from '@/lib/validate'
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Product {
  id: string
  name: string
  category: string
  unit: string | null
  is_available: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  vegetables: 'Vegetables',
  grains: 'Grains',
  tubers: 'Tubers',
  poultry: 'Poultry',
  fish: 'Fish',
  fruits: 'Fruits',
  dairy: 'Dairy',
  spices: 'Spices',
  other: 'Other',
}

const CATEGORY_EMOJI: Record<string, string> = {
  vegetables: '🥬',
  grains: '🌾',
  tubers: '🍠',
  poultry: '🍗',
  fish: '🐟',
  fruits: '🍎',
  dairy: '🥛',
  spices: '🌶️',
  other: '🌿',
}

const CATEGORY_IMAGES: Record<string, string> = {
  vegetables: 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  grains: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  tubers: 'https://images.pexels.com/photos/34143558/pexels-photo-34143558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  poultry: 'https://images.pexels.com/photos/12969328/pexels-photo-12969328.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  fish: 'https://images.pexels.com/photos/32243187/pexels-photo-32243187.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  fruits: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  dairy: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  spices: 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  other: 'https://images.pexels.com/photos/1093837/pexels-photo-1093837.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: 'f-tomatoes',    name: 'Tomatoes',     category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f-pepper',      name: 'Pepper',        category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f-spinach',     name: 'Spinach',       category: 'vegetables', unit: 'per bunch',  is_available: true },
  { id: 'f-okra',        name: 'Okra',          category: 'vegetables', unit: 'per basket', is_available: true },
  { id: 'f-rice',        name: 'Rice',          category: 'grains',     unit: 'per bag',    is_available: true },
  { id: 'f-beans',       name: 'Beans',         category: 'grains',     unit: 'per bag',    is_available: true },
  { id: 'f-maize',       name: 'Maize',         category: 'grains',     unit: 'per bag',    is_available: true },
  { id: 'f-yam',         name: 'Yam',           category: 'tubers',     unit: 'per tuber',  is_available: true },
  { id: 'f-cassava',     name: 'Cassava',       category: 'tubers',     unit: 'per bag',    is_available: true },
  { id: 'f-sweetpotato', name: 'Sweet Potato',  category: 'tubers',     unit: 'per basket', is_available: true },
  { id: 'f-chicken',     name: 'Chicken',       category: 'poultry',    unit: 'per bird',   is_available: true },
  { id: 'f-eggs',        name: 'Eggs',          category: 'poultry',    unit: 'per crate',  is_available: true },
  { id: 'f-catfish',     name: 'Catfish',       category: 'fish',       unit: 'per kg',     is_available: true },
  { id: 'f-tilapia',     name: 'Tilapia',       category: 'fish',       unit: 'per kg',     is_available: true },
  { id: 'f-mango',       name: 'Mango',         category: 'fruits',     unit: 'per dozen',  is_available: true },
  { id: 'f-banana',      name: 'Banana',        category: 'fruits',     unit: 'per bunch',  is_available: true },
]

const BUYER_TYPES = [
  { value: 'household',  label: 'Household' },
  { value: 'business',   label: 'Business' },
  { value: 'restaurant', label: 'Restaurant' },
]

// ── Inner store content (uses useSearchParams) ─────────────────────────────
function StoreContent() {
  const searchParams = useSearchParams()
  const { items, cartLines, cartCount, addOne, removeOne, clearCart } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'details' | 'success'>('review')
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', location: '', buyerType: 'household', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})

  const query = searchParams?.get('q') ?? ''
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

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  useEffect(() => {
    if (query.trim()) return
    const observers: IntersectionObserver[] = []
    categories.forEach((cat) => {
      const el = sectionRefs.current[cat]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCategory(cat) },
        { rootMargin: '-20% 0px -70% 0px' }
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

  function openCart() {
    setCheckoutStep('review')
    setSheetOpen(true)
  }

  async function handleCheckout(e: React.FormEvent) {
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
      clearCart()
    } catch {
      setError('Could not submit your request. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* ── Main two-column layout ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto flex gap-0">

        {/* ── Left sidebar: category list — desktop only ──────────────── */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0">
          {/* Sticky inner */}
          <div className="sticky top-[80px] pt-6 pb-10 px-4 xl:px-6 flex flex-col gap-0.5 max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
            <p className="text-[11px] font-semibold text-stone/50 uppercase tracking-[0.15em] mb-3 px-3">
              Categories
            </p>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-soil/8 animate-pulse shrink-0" />
                  <div className="h-3 w-20 bg-soil/8 rounded-full animate-pulse" />
                </div>
              ))
            ) : (
              categories.map((cat) => {
                const active = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all group ${
                      active
                        ? 'bg-pepper/8 text-pepper-deep'
                        : 'text-soil/70 hover:bg-soil/5 hover:text-soil'
                    }`}
                  >
                    {/* Category thumbnail */}
                    <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                      active ? 'border-pepper/40 shadow-sm' : 'border-soil/10 group-hover:border-soil/20'
                    }`}>
                      <img
                        src={CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.other}
                        alt=""
                        aria-hidden
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[13px] font-semibold leading-tight truncate ${active ? 'text-pepper-deep' : ''}`}>
                        {CATEGORY_LABELS[cat] || cat}
                      </p>
                      <p className="text-[11px] text-stone/50 mt-0.5">
                        {grouped[cat]?.length} item{grouped[cat]?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {/* Active indicator */}
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pepper shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── Right: product area ─────────────────────────────────────── */}
        <main className="flex-1 min-w-0 border-l border-soil/6">

          {/* Mobile category pill scroll */}
          {!loading && categories.length > 0 && (
            <div className="lg:hidden sticky top-[120px] sm:top-[68px] z-20 bg-grain/96 backdrop-blur border-b border-soil/8">
              <div className="flex gap-2 overflow-x-auto py-3 px-4 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-soil text-grain shadow-sm'
                        : 'bg-grain-dim text-stone border border-soil/10 hover:border-soil/20'
                    }`}
                  >
                    <span>{CATEGORY_EMOJI[cat] || '🌿'}</span>
                    <span>{CATEGORY_LABELS[cat] || cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search result notice */}
          {query && (
            <div className="px-6 pt-6 pb-2">
              <p className="text-[14px] text-stone">
                Results for <span className="font-semibold text-soil">&ldquo;{query}&rdquo;</span>
              </p>
            </div>
          )}

          {/* Product sections */}
          <div className="px-4 sm:px-6 py-6 pb-32">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 size={24} className="animate-spin text-stone/40" />
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-24">
                <p className="text-stone text-[15px]">No produce matching &ldquo;{query}&rdquo;.</p>
                <a href="/store" className="mt-3 inline-block text-pepper text-[14px] font-medium">Clear search</a>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(grouped).map(([category, categoryItems]) => (
                  <div
                    key={category}
                    ref={(el) => { sectionRefs.current[category] = el }}
                    className="scroll-mt-32 lg:scroll-mt-28"
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-soil/8">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-soil/10 shrink-0">
                        <img
                          src={CATEGORY_IMAGES[category] || CATEGORY_IMAGES.other}
                          alt=""
                          aria-hidden
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="font-display text-soil text-lg leading-tight">
                          {CATEGORY_LABELS[category] || category}
                        </h2>
                        <p className="font-data text-[11px] text-stone/50">{categoryItems.length} items available</p>
                      </div>
                    </div>

                    {/* Product grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                      {categoryItems.map((item) => {
                        const inCart = items[item.id]
                        return (
                          <div
                            key={item.id}
                            className={`bg-white rounded-2xl overflow-hidden border transition-all ${
                              inCart ? 'border-pepper/50 shadow-sm ring-1 ring-pepper/15' : 'border-soil/8 hover:border-soil/18 hover:shadow-sm'
                            }`}
                          >
                            <div className="relative aspect-square bg-grain-dim">
                              <img
                                src={CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.other}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              {/* Add/quantity overlay */}
                              <div className="absolute bottom-2 right-2">
                                {inCart ? (
                                  <div className="flex items-center gap-1 bg-soil rounded-full px-1.5 py-1 shadow-lg">
                                    <button
                                      onClick={() => removeOne(item.id)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                      aria-label={`Remove one ${item.name}`}
                                    >
                                      <Minus size={12} className="text-grain" />
                                    </button>
                                    <span className="text-grain text-[12px] font-bold font-data w-4 text-center">{inCart.quantity}</span>
                                    <button
                                      onClick={() => addOne({ id: item.id, name: item.name, category: item.category, unit: item.unit })}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                      aria-label={`Add another ${item.name}`}
                                    >
                                      <Plus size={12} className="text-grain" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addOne({ id: item.id, name: item.name, category: item.category, unit: item.unit })}
                                    className="w-8 h-8 rounded-full bg-pepper flex items-center justify-center shadow-lg hover:bg-pepper-deep transition-colors"
                                    aria-label={`Add ${item.name}`}
                                  >
                                    <Plus size={16} className="text-grain" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="px-3 py-3">
                              <p className="text-soil text-[13px] font-semibold leading-tight">{item.name}</p>
                              {item.unit && (
                                <p className="font-data text-[11px] text-stone/55 mt-0.5">{item.unit}</p>
                              )}
                              <p className="text-[11px] text-pepper font-medium mt-1.5">Request price →</p>
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
        </main>
      </div>

      {/* ── Floating cart bar ─────────────────────────────────────────────── */}
      {cartCount > 0 && !sheetOpen && (
        <button
          onClick={openCart}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-soil text-grain rounded-full pl-4 pr-6 py-3.5 flex items-center gap-3 shadow-xl hover:bg-soil/90 transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-pepper text-grain text-[12px] font-bold font-data flex items-center justify-center">
            {cartCount}
          </span>
          <span className="text-[14px] font-medium flex items-center gap-2">
            <ShoppingCart size={16} />
            View my list
          </span>
        </button>
      )}

      {/* ── Cart sheet ───────────────────────────────────────────────────── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
          <div className="absolute inset-0 bg-soil/30 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative w-full sm:w-[420px] sm:h-full bg-grain sm:rounded-none rounded-t-3xl max-h-[88vh] sm:max-h-full overflow-y-auto sm:shadow-2xl sm:border-l sm:border-soil/10">
            <div className="sticky top-0 bg-grain border-b border-soil/8 px-5 py-4 flex items-center justify-between">
              {checkoutStep === 'details' ? (
                <button onClick={() => setCheckoutStep('review')} className="text-soil flex items-center gap-1.5 text-[14px]">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <h3 className="font-display text-soil text-lg">
                  {checkoutStep === 'success' ? 'Request sent ✓' : 'Your list'}
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
                    <p className="text-stone text-[14px] py-10 text-center">Your list is empty.</p>
                  ) : (
                    <div className="space-y-2 mb-6">
                      {cartLines.map(line => (
                        <div key={line.id} className="flex items-center justify-between gap-3 bg-grain-dim rounded-xl px-4 py-3">
                          <div>
                            <p className="text-soil text-[14px] font-medium">{line.name}</p>
                            {line.unit && <p className="font-data text-[11px] text-stone">{line.unit}</p>}
                          </div>
                          <div className="flex items-center gap-2 bg-grain rounded-full px-1 py-1 border border-soil/10">
                            <button onClick={() => removeOne(line.id)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-grain-dim transition-colors">
                              <Minus size={12} className="text-soil" />
                            </button>
                            <span className="text-soil text-[12px] font-data w-4 text-center">{line.quantity}</span>
                            <button onClick={() => addOne({ id: line.id, name: line.name, category: line.category, unit: line.unit })} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-grain-dim transition-colors">
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
                    We&apos;ll match your list with a verified farmer and confirm pricing.
                  </p>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">Full name</label>
                    <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Your full name"
                      className={`w-full bg-grain-dim border rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors ${fieldErrors.fullName ? 'border-red-400' : 'border-soil/10'}`} />
                    {fieldErrors.fullName && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">Phone number</label>
                    <input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                      placeholder="08012345678"
                      className={`w-full bg-grain-dim border rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors ${fieldErrors.phoneNumber ? 'border-red-400' : 'border-soil/10'}`} />
                    {fieldErrors.phoneNumber && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.phoneNumber}</p>}
                  </div>
                  <div>
                    <label className="text-soil text-[13px] font-medium block mb-1.5">Delivery location</label>
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Wuse 2, Abuja"
                      className={`w-full bg-grain-dim border rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors ${fieldErrors.location ? 'border-red-400' : 'border-soil/10'}`} />
                    {fieldErrors.location && <p className="text-[12px] text-red-500 mt-1">{fieldErrors.location}</p>}
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
                <div className="text-center py-8">
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

// ── Page wrapper ───────────────────────────────────────────────────────────
export default function StorePage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="min-h-screen bg-grain flex flex-col">
      <StoreNav onCartOpen={() => setSheetOpen(true)} />
      {usingFallback && (
        <div className="bg-turmeric/30 border-b border-turmeric/60 px-4 py-2 text-center text-[12px] text-soil/70">
          Showing typical categories — live availability updates as farmers list produce.
        </div>
      )}
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-stone/40" />
        </div>
      }>
        <StoreContent />
      </Suspense>
      <Footer />
    </div>
  )
}
