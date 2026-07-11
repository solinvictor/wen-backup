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
                  <div className="w-9 h-9 rounded-full shrink-0 shimmer" />
                  <div className="h-3 w-20 rounded-full shimmer" />
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
              <div className="space-y-8 sm:space-y-10">
                {Array.from({ length: 3 }).map((_, si) => (
                  <div key={si}>
                    {/* Category heading skeleton */}
                    <div className="h-4 w-32 rounded-md shimmer mb-5" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
                          {/* Image area */}
                          <div className="bg-grain-dim p-2 sm:p-3 pb-0">
                            <div className="aspect-square rounded-xl shimmer" />
                          </div>
                          {/* Text lines */}
                          <div className="p-3 space-y-2.5">
                            <div className="h-3 w-3/4 rounded-md shimmer" />
                            <div className="h-3 w-1/2 rounded-md shimmer" />
                            <div className="h-7 w-full rounded-lg shimmer mt-1" />
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
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-soil text-white rounded-full px-5 py-3 flex items-center gap-2.5 shadow-xl active:scale-95 transition-all whitespace-nowrap"
        >
          <span className="w-5 h-5 rounded-full bg-pepper text-white text-[11px] font-bold font-data flex items-center justify-center shrink-0">{cartCount}</span>
          <ShoppingCart size={15} className="shrink-0" />
          <span className="text-[13px] font-semibold">View my list</span>
        </button>
      )}

      {/* Cart sheet — bottom sheet on mobile, right panel on desktop */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative w-full sm:w-[400px] bg-white sm:h-full flex flex-col rounded-t-3xl sm:rounded-none shadow-2xl sm:border-l border-soil/10" style={{ maxHeight: '92dvh' }}>

            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
              <div className="w-10 h-1 rounded-full bg-soil/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-soil/8 shrink-0">
              {checkoutStep === 'details' ? (
                <button onClick={() => setCheckoutStep('review')} className="flex items-center gap-1.5 text-[14px] font-medium text-soil">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <p className="font-display text-soil text-[17px]">
                  {checkoutStep === 'success' ? 'Order placed' : 'My list'}
                </p>
              )}
              <button onClick={() => setSheetOpen(false)} className="p-1.5 text-soil/35 hover:text-soil transition-colors -mr-1">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Review step ── */}
              {checkoutStep === 'review' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 px-4 py-4 space-y-2">
                    {cartLines.length === 0 ? (
                      <p className="text-stone/60 text-[14px] text-center py-12">Your list is empty.</p>
                    ) : cartLines.map(line => (
                      <div key={line.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-grain-dim">
                        <div className="flex-1 min-w-0">
                          <p className="text-soil text-[14px] font-semibold leading-tight truncate">{line.name}</p>
                          {line.unit && <p className="text-stone/50 text-[11px] font-data mt-0.5">{line.unit}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 bg-pepper rounded-full px-2 py-1 shrink-0">
                          <button onClick={() => removeOne(line.id)} className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                            <Minus size={11} className="text-white" />
                          </button>
                          <span className="text-white text-[12px] font-bold font-data w-4 text-center">{line.quantity}</span>
                          <button onClick={() => addOne({ id: line.id, name: line.name, category: line.category, unit: line.unit })} className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                            <Plus size={11} className="text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sticky checkout footer */}
                  <div className="px-4 pb-6 pt-3 border-t border-soil/8 shrink-0">
                    <button
                      onClick={() => setCheckoutStep('details')}
                      disabled={cartLines.length === 0}
                      className="w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}

              {/* ── Details step ── */}
              {checkoutStep === 'details' && (
                <form onSubmit={handleCheckout} className="flex flex-col h-full">
                  <div className="flex-1 px-4 py-4 space-y-4">
                    {[
                      { key: 'fullName',    label: 'Full name',        placeholder: 'Your full name',     type: 'text' },
                      { key: 'phoneNumber', label: 'Phone number',     placeholder: '08012345678',        type: 'tel'  },
                      { key: 'location',    label: 'Delivery address', placeholder: 'e.g. Wuse 2, Abuja', type: 'text' },
                    ].map(({ key, label, placeholder, type }) => (
                      <div key={key}>
                        <label className="text-soil/70 text-[13px] font-medium block mb-1.5">{label}</label>
                        <input
                          type={type}
                          value={(form as Record<string, string>)[key]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          placeholder={placeholder}
                          className={`w-full bg-grain-dim border rounded-xl px-4 py-3.5 text-[15px] text-soil outline-none focus:border-pepper focus:bg-white transition-all ${(fieldErrors as Record<string, string>)[key] ? 'border-red-400' : 'border-soil/10'}`}
                        />
                        {(fieldErrors as Record<string, string>)[key] && (
                          <p className="text-[12px] text-red-500 mt-1">{(fieldErrors as Record<string, string>)[key]}</p>
                        )}
                      </div>
                    ))}
                    {error && <p className="text-[13px] text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
                  </div>

                  <div className="px-4 pb-6 pt-3 border-t border-soil/8 shrink-0">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      {submitting ? 'Placing order…' : 'Place order'}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Success step ── */}
              {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center text-center px-6 py-16 gap-4">
                  <div className="w-16 h-16 rounded-full bg-pepper/10 flex items-center justify-center">
                    <Check size={28} className="text-pepper" />
                  </div>
                  <div>
                    <p className="font-display text-soil text-xl mb-1.5">Order received!</p>
                    <p className="text-stone/60 text-[13px] leading-relaxed max-w-[240px] mx-auto">
                      We'll call {form.phoneNumber} to confirm your delivery.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSheetOpen(false); setCheckoutStep('review') }}
                    className="mt-2 bg-pepper text-white text-[14px] font-semibold px-8 py-3 rounded-full hover:bg-pepper-deep transition-colors"
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

