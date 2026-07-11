'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StoreNav } from '@/components/StoreNav'
import { Footer } from '@/components/Footer'
import { Plus, Minus, ShoppingCart, X, Check, Loader2, ArrowLeft } from 'lucide-react'
import { validateName, validatePhone, validateLocation, type FieldError } from '@/lib/validate'
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  category: string
  unit: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  vegetables: 'Vegetables', grains: 'Grains', tubers: 'Tubers',
  poultry: 'Poultry', fish: 'Fish', fruits: 'Fruits',
  dairy: 'Dairy', spices: 'Spices', other: 'Other',
}

const CATEGORY_EMOJI: Record<string, string> = {
  vegetables: '🥬', grains: '🌾', tubers: '🍠',
  poultry: '🍗', fish: '🐟', fruits: '🍎',
  dairy: '🥛', spices: '🌶️', other: '🌿',
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
  { id: 'f-tomatoes',    name: 'Tomatoes',    category: 'vegetables', unit: 'per basket', price: 4500,  image_url: null, is_available: true },
  { id: 'f-pepper',      name: 'Pepper',      category: 'vegetables', unit: 'per basket', price: 3800,  image_url: null, is_available: true },
  { id: 'f-spinach',     name: 'Spinach',     category: 'vegetables', unit: 'per bunch',  price: 800,   image_url: null, is_available: true },
  { id: 'f-okra',        name: 'Okra',        category: 'vegetables', unit: 'per basket', price: 2500,  image_url: null, is_available: true },
  { id: 'f-rice',        name: 'Rice',        category: 'grains',     unit: 'per bag',    price: 48000, image_url: null, is_available: true },
  { id: 'f-beans',       name: 'Beans',       category: 'grains',     unit: 'per bag',    price: 52000, image_url: null, is_available: true },
  { id: 'f-maize',       name: 'Maize',       category: 'grains',     unit: 'per bag',    price: 22000, image_url: null, is_available: true },
  { id: 'f-yam',         name: 'Yam',         category: 'tubers',     unit: 'per tuber',  price: 1200,  image_url: null, is_available: true },
  { id: 'f-cassava',     name: 'Cassava',     category: 'tubers',     unit: 'per bag',    price: 8000,  image_url: null, is_available: true },
  { id: 'f-sweetpotato', name: 'Sweet Potato',category: 'tubers',     unit: 'per basket', price: 5000,  image_url: null, is_available: true },
  { id: 'f-chicken',     name: 'Chicken',     category: 'poultry',    unit: 'per kg',     price: 2800,  image_url: null, is_available: true },
  { id: 'f-eggs',        name: 'Eggs',        category: 'poultry',    unit: 'per crate',  price: 4200,  image_url: null, is_available: true },
  { id: 'f-catfish',     name: 'Catfish',     category: 'fish',       unit: 'per kg',     price: 2800,  image_url: null, is_available: true },
  { id: 'f-tilapia',     name: 'Tilapia',     category: 'fish',       unit: 'per kg',     price: 2200,  image_url: null, is_available: true },
  { id: 'f-mango',       name: 'Mango',       category: 'fruits',     unit: 'per dozen',  price: 1500,  image_url: null, is_available: true },
  { id: 'f-banana',      name: 'Banana',      category: 'fruits',     unit: 'per bunch',  price: 1000,  image_url: null, is_available: true },
]

const BUYER_TYPES = [
  { value: 'household',  label: 'Household'  },
  { value: 'business',   label: 'Business'   },
  { value: 'restaurant', label: 'Restaurant' },
]

function formatPrice(price: number | null): string {
  if (!price) return '—'
  return '₦' + price.toLocaleString('en-NG')
}

// ── Product card — Instacart style ─────────────────────────────────────────
function ProductCard({ item, inCart, onAdd, onRemove }: {
  item: Product
  inCart: { quantity: number } | undefined
  onAdd: () => void
  onRemove: () => void
}) {
  const img = item.image_url || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.other

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border transition-all flex flex-col ${
      inCart ? 'border-pepper/40 shadow-sm ring-1 ring-pepper/10' : 'border-soil/8 hover:shadow-md hover:border-soil/15'
    }`}>
      {/* Image — padded, not full bleed */}
      <div className="bg-grain-dim p-2 sm:p-3 pb-0">
        <div className="aspect-square rounded-xl overflow-hidden">
          <img src={img} alt={item.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info + add button */}
      <div className="px-2.5 sm:px-3 pt-2 pb-2.5 sm:pt-2.5 sm:pb-3 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <div className="flex-1">
          <p className="text-soil text-[12px] sm:text-[13px] font-semibold leading-tight">{item.name}</p>
          {item.unit && (
            <p className="text-stone/55 text-[11px] mt-0.5 font-data">{item.unit}</p>
          )}
        </div>

        {/* Price + add button row */}
        <div className="flex items-center justify-between">
          <p className="text-soil text-[13px] sm:text-[14px] font-bold font-display">
            {formatPrice(item.price)}
          </p>

          {inCart ? (
            <div className="flex items-center gap-1.5 bg-pepper rounded-full px-1.5 py-1">
              <button
                onClick={onRemove}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Remove one"
              >
                <Minus size={11} className="text-white" />
              </button>
              <span className="text-white text-[12px] font-bold font-data w-4 text-center">{inCart.quantity}</span>
              <button
                onClick={onAdd}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Add one more"
              >
                <Plus size={11} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-full bg-pepper hover:bg-pepper-deep transition-colors flex items-center justify-center shadow-sm"
              aria-label={`Add ${item.name}`}
            >
              <Plus size={16} className="text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inner content ──────────────────────────────────────────────────────────
function StoreInner({
  sheetOpen, setSheetOpen,
}: {
  sheetOpen: boolean
  setSheetOpen: (v: boolean) => void
}) {
  const searchParams = useSearchParams()
  const { items, cartLines, cartCount, addOne, removeOne, clearCart } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'details' | 'success'>('review')
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', location: '', buyerType: 'household', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})

  const query = searchParams?.get('q') ?? ''
  const categoryFilter = searchParams?.get('c') ?? ''
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('id, name, category, unit, price, image_url, is_available')
          .eq('is_available', true)
          .order('category')
        if (data && data.length > 0) setProducts(data)
        else setProducts(FALLBACK_PRODUCTS)
      } catch {
        setProducts(FALLBACK_PRODUCTS)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    let filtered = products
    if (query.trim()) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    }
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }
    return filtered.reduce<Record<string, Product[]>>((acc, p) => {
      acc[p.category] = acc[p.category] || []
      acc[p.category].push(p)
      return acc
    }, {})
  }, [products, query, categoryFilter])

  const categories = Object.keys(grouped)

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0])
  }, [categories, activeCategory])

  useEffect(() => {
    if (query.trim() || categoryFilter) return
    const observers: IntersectionObserver[] = []
    categories.forEach((cat) => {
      const el = sectionRefs.current[cat]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCategory(cat) },
        { rootMargin: '-20% 0px -70% 0px' }
      )
      obs.observe(el); observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [categories, query, categoryFilter])

  function scrollToCategory(cat: string) {
    setActiveCategory(cat)
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function openCart() { setCheckoutStep('review'); setSheetOpen(true) }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault(); setError('')
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
          fullName: form.fullName, phoneNumber: form.phoneNumber,
          location: form.location, buyerType: form.buyerType, notes: form.notes,
          items: cartLines.map(l => ({ name: l.name, category: l.category, unit: l.unit, quantity: l.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setCheckoutStep('success'); clearCart()
    } catch { setError('Could not submit. Check your connection and try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto flex min-h-0 flex-1">

        {/* Left sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 border-r border-soil/8">
          <div className="sticky top-16 pt-6 pb-10 px-3 xl:px-5 flex flex-col gap-0.5 max-h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
            <p className="text-[10.5px] font-semibold text-stone/45 uppercase tracking-[0.15em] mb-3 px-3">
              Categories
            </p>
            {loading ? (
              Array.from({ length: 7 }).map((_, i) => (
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
                      active ? 'bg-pepper/8 text-pepper-deep' : 'text-soil/70 hover:bg-soil/5 hover:text-soil'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                      active ? 'border-pepper/40 shadow-sm' : 'border-soil/10 group-hover:border-soil/20'
                    }`}>
                      <img src={CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.other} alt="" aria-hidden className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[13px] font-semibold leading-tight truncate ${active ? 'text-pepper-deep' : ''}`}>
                        {CATEGORY_LABELS[cat] || cat}
                      </p>
                      <p className="text-[11px] text-stone/45 mt-0.5">{grouped[cat]?.length} item{grouped[cat]?.length !== 1 ? 's' : ''}</p>
                    </div>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pepper shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Right product area */}
        <main className="flex-1 min-w-0">



          {/* Search / filter notice */}
          {(query || categoryFilter) && (
            <div className="px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between">
              <p className="text-[14px] text-stone">
                {query && <>Results for <span className="font-semibold text-soil">&ldquo;{query}&rdquo;</span></>}
                {categoryFilter && !query && <span className="font-semibold text-soil">{CATEGORY_LABELS[categoryFilter] || categoryFilter}</span>}
              </p>
              <a href="/store" className="text-[13px] text-pepper font-medium">Clear</a>
            </div>
          )}

          {/* Product sections */}
          <div className="px-3 sm:px-6 py-5 pb-36">
            {loading ? (
              // Skeleton grid
              <div className="space-y-8 sm:space-y-10">
                {Array.from({ length: 2 }).map((_, si) => (
                  <div key={si}>
                    <div className="h-5 w-28 bg-soil/8 rounded-full animate-pulse mb-5" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
                          <div className="bg-grain-dim p-2 sm:p-3 pb-0">
                            <div className="aspect-square rounded-xl bg-soil/6 animate-pulse" />
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="h-3 w-3/4 bg-soil/8 rounded-full animate-pulse" />
                            <div className="h-3 w-1/2 bg-soil/8 rounded-full animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-24">
                <p className="text-stone text-[15px]">No produce found{query ? ` for "${query}"` : ''}.</p>
                <a href="/store" className="mt-3 inline-block text-pepper text-[14px] font-medium">Browse all</a>
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-10">
                {Object.entries(grouped).map(([category, categoryItems]) => (
                  <div
                    key={category}
                    ref={(el) => { sectionRefs.current[category] = el }}
                    className="scroll-mt-44 lg:scroll-mt-24"
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <span className="text-xl">{CATEGORY_EMOJI[category] || '🌿'}</span>
                      <h2 className="font-display text-soil text-[17px] font-semibold">{CATEGORY_LABELS[category] || category}</h2>
                      <span className="text-stone/40 text-[12px] font-data ml-1">{categoryItems.length}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                      {categoryItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          inCart={items[item.id]}
                          onAdd={() => addOne({ id: item.id, name: item.name, category: item.category, unit: item.unit })}
                          onRemove={() => removeOne(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && !sheetOpen && (
        <button
          onClick={openCart}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-soil text-white rounded-full pl-4 pr-6 py-3.5 flex items-center gap-3 shadow-xl hover:bg-soil/90 active:scale-95 transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-pepper text-white text-[12px] font-bold font-data flex items-center justify-center">{cartCount}</span>
          <span className="text-[14px] font-semibold flex items-center gap-2">
            <ShoppingCart size={16} />
            View my list
          </span>
        </button>
      )}

      {/* Cart sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
          <div className="absolute inset-0 bg-soil/30 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative w-full sm:w-[420px] bg-white sm:h-full rounded-t-3xl sm:rounded-none max-h-[90vh] sm:max-h-full overflow-y-auto shadow-2xl sm:border-l sm:border-soil/10">

            {/* Sheet header */}
            <div className="sticky top-0 bg-white border-b border-soil/8 px-5 py-4 flex items-center justify-between">
              {checkoutStep === 'details' ? (
                <button onClick={() => setCheckoutStep('review')} className="text-soil flex items-center gap-1.5 text-[14px] font-medium">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <h3 className="font-display text-soil text-lg">
                  {checkoutStep === 'success' ? 'Order placed ✓' : `My list (${cartCount})`}
                </h3>
              )}
              <button onClick={() => setSheetOpen(false)} className="text-stone/50 hover:text-soil transition-colors p-1">
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
                        <div key={line.id} className="flex items-center justify-between gap-3 bg-grain-dim rounded-2xl px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-soil text-[14px] font-semibold truncate">{line.name}</p>
                            {line.unit && <p className="font-data text-[11px] text-stone/55">{line.unit}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 bg-pepper rounded-full px-1.5 py-1 shrink-0">
                            <button onClick={() => removeOne(line.id)} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                              <Minus size={11} className="text-white" />
                            </button>
                            <span className="text-white text-[12px] font-bold font-data w-4 text-center">{line.quantity}</span>
                            <button onClick={() => addOne({ id: line.id, name: line.name, category: line.category, unit: line.unit })} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                              <Plus size={11} className="text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setCheckoutStep('details')}
                    disabled={cartLines.length === 0}
                    className="w-full bg-pepper text-white text-[14px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep transition-colors disabled:opacity-40"
                  >
                    Continue — {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </button>
                </>
              )}

              {checkoutStep === 'details' && (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <p className="text-stone/65 text-[13px]">Enter your details and we'll confirm your order.</p>
                  {[
                    { key: 'fullName',    label: 'Full name',        placeholder: 'Your full name'     },
                    { key: 'phoneNumber', label: 'Phone number',     placeholder: '08012345678'        },
                    { key: 'location',    label: 'Delivery address', placeholder: 'e.g. Wuse 2, Abuja' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-soil text-[12px] font-semibold uppercase tracking-wide block mb-1.5">{label}</label>
                      <input
                        value={(form as Record<string, string>)[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className={`w-full bg-grain-dim border rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors ${(fieldErrors as Record<string, string>)[key] ? 'border-red-400' : 'border-soil/10'}`}
                      />
                      {(fieldErrors as Record<string, string>)[key] && (
                        <p className="text-[12px] text-red-500 mt-1">{(fieldErrors as Record<string, string>)[key]}</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="text-soil text-[12px] font-semibold uppercase tracking-wide block mb-2">I'm ordering as a</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUYER_TYPES.map(t => (
                        <button key={t.value} type="button" onClick={() => setForm({ ...form, buyerType: t.value })}
                          className={`text-[12px] font-semibold py-2.5 rounded-xl border transition-colors ${
                            form.buyerType === t.value ? 'bg-soil text-white border-soil' : 'bg-grain-dim text-stone border-soil/10'
                          }`}>{t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-soil text-[12px] font-semibold uppercase tracking-wide block mb-1.5">Notes <span className="normal-case font-normal text-stone/40">(optional)</span></label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                      className="w-full bg-grain-dim border border-soil/10 rounded-xl px-4 py-3 text-[14px] text-soil outline-none focus:border-pepper transition-colors resize-none" />
                  </div>
                  {error && <p className="text-[13px] text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-pepper text-white text-[14px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Placing order…' : 'Place order'}
                  </button>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-pepper/12 flex items-center justify-center mx-auto mb-4">
                    <Check size={26} className="text-pepper" />
                  </div>
                  <p className="font-display text-soil text-xl mb-2">Order received</p>
                  <p className="text-stone text-[13px] max-w-xs mx-auto mb-6 leading-relaxed">
                    We'll reach out on {form.phoneNumber} to confirm delivery details.
                  </p>
                  <button
                    onClick={() => { setSheetOpen(false); setCheckoutStep('review') }}
                    className="text-pepper font-semibold text-[14px]"
                  >
                    Done
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

// ── Page ───────────────────────────────────────────────────────────────────
export default function StorePage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="min-h-screen bg-grain-dim flex flex-col">
      <StoreNav onCartOpen={() => setSheetOpen(true)} />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-stone/40" />
        </div>
      }>
        <StoreInner sheetOpen={sheetOpen} setSheetOpen={setSheetOpen} />
      </Suspense>
      <Footer />
    </div>
  )
}
