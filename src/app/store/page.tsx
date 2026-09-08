'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { CATEGORY_IMAGES } from '@/lib/category-images'
import { createClient } from '@/lib/supabase/client'
import { StoreNav } from '@/components/StoreNav'
import { Footer } from '@/components/Footer'
import { Plus, Minus, ShoppingCart, X, Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useSearchParams, useRouter } from 'next/navigation'

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
  eggs: 'Eggs', fish: 'Fish', chicken: 'Chicken', rice: 'Rice', beans: 'Beans',
}



const FALLBACK_PRODUCTS: Product[] = [
  { id: 'f-eggs',    name: 'Eggs',    category: 'eggs',    unit: 'per crate', price: 4200,  image_url: CATEGORY_IMAGES.eggs,    is_available: true },
  { id: 'f-catfish', name: 'Catfish', category: 'fish',    unit: 'per kg',    price: 2800,  image_url: CATEGORY_IMAGES.fish,    is_available: true },
  { id: 'f-tilapia', name: 'Tilapia', category: 'fish',    unit: 'per kg',    price: 2200,  image_url: CATEGORY_IMAGES.fish,    is_available: true },
  { id: 'f-chicken', name: 'Chicken', category: 'chicken', unit: 'per kg',    price: 2800,  image_url: CATEGORY_IMAGES.chicken, is_available: true },
  { id: 'f-rice',    name: 'Rice',    category: 'rice',    unit: 'per bag',   price: 48000, image_url: CATEGORY_IMAGES.rice,    is_available: true },
  { id: 'f-beans',   name: 'Beans',   category: 'beans',   unit: 'per bag',   price: 52000, image_url: CATEGORY_IMAGES.beans,   is_available: true },
]

function fmt(price: number | null) {
  if (!price) return '—'
  return price.toLocaleString('en-NG')
}

// Use this in JSX: <PriceDisplay price={item.price} />
function PriceDisplay({ price, className = '' }: { price: number | null; className?: string }) {
  if (!price) return <span className={className}>—</span>
  return (
    <span className={`inline-flex items-baseline gap-0 ${className}`}>
      <span style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>₦</span>
      <span>{price.toLocaleString('en-NG')}</span>
    </span>
  )
}

// ── Product card ───────────────────────────────────────────────────────────
function ProductCard({ item, inCart, onAdd, onRemove }: {
  item: Product
  inCart: { quantity: number } | undefined
  onAdd: () => void
  onRemove: () => void
}) {
  const img = item.image_url || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.other

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
      inCart
        ? 'ring-2 ring-pepper/35 shadow-lg shadow-pepper/10'
        : 'ring-1 ring-soil/8 shadow-sm hover:shadow-md hover:ring-soil/12'
    }`}>
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-grain-dim">
        <img
          src={img}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {inCart && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-pepper text-white px-2 py-0.5 rounded-full">
            In basket
          </span>
        )}
      </div>
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2.5 flex-1">
        <div className="flex-1 min-h-[2.6rem]">
          <p className="text-soil text-[13px] sm:text-[14px] font-semibold leading-snug line-clamp-2 tracking-tight">
            {item.name}
          </p>
          {item.unit && (
            <p className="text-stone/40 text-[11px] mt-0.5 font-data">{item.unit}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1 truncate pr-1">
            <PriceDisplay price={item.price} className="text-soil text-[14px] sm:text-[15px] font-bold font-body tabular-nums" />
          </div>
          {inCart ? (
            <div className="shrink-0 flex items-center justify-between w-[5.5rem] h-8 bg-pepper rounded-full px-0.5 shadow-sm">
              <button type="button" onClick={onRemove} className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors" aria-label="Remove one">
                <Minus size={12} className="text-white" />
              </button>
              <span className="text-white text-[12px] font-bold font-data tabular-nums min-w-[1.25rem] text-center leading-none">
                {inCart.quantity}
              </span>
              <button type="button" onClick={onAdd} className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors" aria-label="Add one">
                <Plus size={12} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-full bg-soil hover:bg-pepper text-white text-[12px] font-semibold flex items-center justify-center gap-1 transition-colors active:scale-95 shadow-sm"
              aria-label={`Add ${item.name}`}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Cart sheet ─────────────────────────────────────────────────────────────
function CartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cartLines, cartCount, cartTotal, addOne, removeOne, deleteLine } = useCart()
  const router = useRouter()

  if (!open) return null

  const hasPrices = cartLines.some(l => l.price)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet — bottom on mobile, right panel on desktop */}
      <div
        className="relative w-full sm:w-[400px] bg-white sm:h-full flex flex-col rounded-t-3xl sm:rounded-none shadow-2xl sm:border-l border-soil/10"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-soil/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-soil/8 shrink-0">
          <div>
            <p className="font-body text-soil text-[18px] font-semibold">Your basket</p>
            {cartCount > 0 && (
              <p className="text-stone/50 text-[12px] mt-0.5">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-soil/35 hover:text-soil transition-colors -mr-1 rounded-full hover:bg-soil/5">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable line items */}
        <div className="flex-1 overflow-y-auto">
          {cartLines.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-grain-dim flex items-center justify-center">
                <ShoppingBag size={32} className="text-stone/30" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-body text-soil text-[17px] font-semibold mb-1">Your basket is empty</p>
                <p className="text-stone/55 text-[13px] leading-relaxed">Add some fresh produce to get started.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-pepper text-white text-[14px] font-semibold px-8 py-3 rounded-full hover:bg-pepper-deep transition-colors"
              >
                Browse produce
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-2">
              {cartLines.map(line => {
                const img = line.imageUrl || CATEGORY_IMAGES[line.category] || CATEGORY_IMAGES.other
                const lineTotal = line.price ? line.price * line.quantity : null

                return (
                  <div key={line.id} className="flex items-center gap-3 bg-grain-dim rounded-2xl p-3">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-soil/8">
                      <img src={img} alt={line.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-soil text-[14px] font-semibold leading-tight truncate">{line.name}</p>
                      {line.unit && <p className="text-stone/50 text-[11px] font-data mt-0.5">{line.unit}</p>}
                      {lineTotal && (
                        <p className="text-pepper-deep text-[12px] font-bold font-data mt-1">{fmt(lineTotal)}</p>
                      )}
                    </div>

                    {/* Qty controls + delete */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => deleteLine(line.id)}
                        className="text-stone/30 hover:text-red-400 transition-colors p-0.5"
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex items-center gap-1.5 bg-white border border-soil/10 rounded-full px-2 py-1">
                        <button
                          onClick={() => removeOne(line.id)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-grain-dim rounded-full transition-colors"
                        >
                          <Minus size={11} className="text-soil" />
                        </button>
                        <span className="text-soil text-[12px] font-bold font-data w-4 text-center">{line.quantity}</span>
                        <button
                          onClick={() => addOne({ id: line.id, name: line.name, category: line.category, unit: line.unit, price: line.price, imageUrl: line.imageUrl })}
                          className="w-5 h-5 flex items-center justify-center hover:bg-grain-dim rounded-full transition-colors"
                        >
                          <Plus size={11} className="text-soil" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sticky footer — only when items exist */}
        {cartLines.length > 0 && (
          <div className="shrink-0 border-t border-soil/8 px-4 pt-4 pb-6 space-y-3 bg-white">
            {/* Total */}
            {hasPrices && (
              <div className="flex items-center justify-between px-1">
                <span className="text-soil/60 text-[14px]">Estimated total</span>
                <span className="font-body text-soil text-[18px] font-bold">{fmt(cartTotal)}</span>
              </div>
            )}

            {/* Checkout CTA */}
            <button
              onClick={() => {
                onClose()
                router.push('/checkout')
              }}
              className="w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={17} />
              Checkout
              {hasPrices && <span className="ml-1 opacity-80">· {fmt(cartTotal)}</span>}
            </button>

            <p className="text-center text-stone/40 text-[11px]">
              Prices confirmed by farmer before delivery
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Inner store content ────────────────────────────────────────────────────
function StoreInner({ sheetOpen, setSheetOpen }: {
  sheetOpen: boolean
  setSheetOpen: (v: boolean) => void
}) {
  const searchParams = useSearchParams()
  const { items, cartCount, cartTotal, addOne, removeOne } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('')

  const query = searchParams?.get('q') ?? ''
  const categoryFilter = searchParams?.get('c') ?? ''
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    async function load() {
      const start = Date.now()
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setProducts(FALLBACK_PRODUCTS)
          return
        }
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
      } finally {
        const elapsed = Date.now() - start
        setTimeout(() => setLoading(false), Math.max(0, 600 - elapsed))
      }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    let filtered = products
    if (query.trim()) filtered = filtered.filter(p => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    if (categoryFilter) filtered = filtered.filter(p => p.category === categoryFilter)
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
    categories.forEach(cat => {
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

  return (
    <>
      <div className="max-w-5xl mx-auto flex min-h-0 flex-1 w-full">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-soil/8">
          <div className="sticky top-[168px] pt-6 pb-10 px-3 flex flex-col gap-0.5 max-h-[calc(100vh-168px)] overflow-y-auto scrollbar-hide">
            <p className="text-[10.5px] font-semibold text-stone/40 uppercase tracking-[0.15em] mb-3 px-3">Categories</p>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                  <div className="w-9 h-9 rounded-full shrink-0 bg-soil/8 animate-pulse" />
                  <div className="h-3 w-20 rounded-full bg-soil/8 animate-pulse" />
                </div>
              ))
            ) : categories.map(cat => {
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
                    <p className={`text-[13px] font-semibold truncate ${active ? 'text-pepper-deep' : ''}`}>
                      {CATEGORY_LABELS[cat] || cat}
                    </p>
                    <p className="text-[11px] text-stone/40 mt-0.5">{grouped[cat]?.length} items</p>
                  </div>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pepper shrink-0" />}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Product grid */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 py-5 pb-36">
          {(query || categoryFilter) && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-stone">
                {query && <>Results for <span className="font-semibold text-soil">&ldquo;{query}&rdquo;</span></>}
                {categoryFilter && !query && <span className="font-semibold text-soil">{CATEGORY_LABELS[categoryFilter] || categoryFilter}</span>}
              </p>
              <a href="/store" className="text-[13px] text-pepper font-medium">Clear</a>
            </div>
          )}

          {loading ? (
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, si) => (
                <div key={si}>
                  <div className="h-4 w-28 rounded-md bg-soil/8 animate-pulse mb-4" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
                        <div className="bg-grain-dim p-2"><div className="aspect-square rounded-xl bg-soil/8 animate-pulse" /></div>
                        <div className="p-3 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-soil/8 animate-pulse" />
                          <div className="h-3 w-1/2 rounded bg-soil/8 animate-pulse" />
                          <div className="h-7 w-full rounded-lg bg-soil/8 animate-pulse" />
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
                <div key={category} ref={el => { sectionRefs.current[category] = el }} className="scroll-mt-48 lg:scroll-mt-24">
                  <div className="flex items-center gap-2.5 mb-3.5 sm:mb-5">
                    <h2 className="font-body text-soil text-[18px] sm:text-[20px] font-semibold tracking-tight">
                      {CATEGORY_LABELS[category] || category}
                    </h2>
                    <span className="text-stone/35 text-[11px] font-data bg-soil/5 px-2 py-0.5 rounded-full">
                      {categoryItems.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
                    {categoryItems.map(item => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        inCart={items[item.id]}
                        onAdd={() => addOne({
                          id: item.id,
                          name: item.name,
                          category: item.category,
                          unit: item.unit,
                          price: item.price,
                          imageUrl: item.image_url || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.other,
                        })}
                        onRemove={() => removeOne(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && !sheetOpen && (
        <button
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-soil text-white rounded-full pl-3.5 pr-5 py-3.5 flex items-center gap-3 shadow-[0_12px_40px_rgba(15,41,64,0.35)] active:scale-95 transition-all whitespace-nowrap max-w-[min(100vw-2rem,24rem)] ring-1 ring-white/10"
        >
          <span className="w-7 h-7 rounded-full bg-pepper text-white text-[12px] font-bold font-data flex items-center justify-center shrink-0">
            {cartCount}
          </span>
          <span className="text-[14px] font-semibold">View basket</span>
          {cartTotal > 0 && (
            <span className="ml-auto font-data text-[13px] font-bold tabular-nums opacity-95">
              ₦{cartTotal.toLocaleString('en-NG')}
            </span>
          )}
        </button>
      )}

      {/* Cart sheet */}
      <CartSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function StorePage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#eef1f4] flex flex-col">
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
