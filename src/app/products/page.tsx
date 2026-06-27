'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

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
  other: 'Other',
}

const CATEGORY_IMAGES: Record<string, string> = {
  vegetables: 'https://images.pexels.com/photos/37321079/pexels-photo-37321079.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  grains: 'https://images.pexels.com/photos/5273080/pexels-photo-5273080.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  tubers: 'https://images.pexels.com/photos/27567597/pexels-photo-27567597.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  poultry: 'https://images.pexels.com/photos/8827287/pexels-photo-8827287.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  fish: 'https://images.pexels.com/photos/1363850/pexels-photo-1363850.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  other: 'https://images.pexels.com/photos/1093837/pexels-photo-1093837.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
}

const FALLBACK_CATEGORIES = [
  {
    category: 'vegetables',
    items: ['Tomatoes', 'Pepper', 'Spinach', 'Okra'],
    image: 'https://images.pexels.com/photos/37321079/pexels-photo-37321079.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    category: 'grains',
    items: ['Rice', 'Beans', 'Maize'],
    image: 'https://images.pexels.com/photos/5273080/pexels-photo-5273080.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    category: 'tubers',
    items: ['Yam', 'Cassava', 'Sweet Potato'],
    image: 'https://images.pexels.com/photos/27567597/pexels-photo-27567597.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    category: 'poultry',
    items: ['Chicken', 'Eggs'],
    image: 'https://images.pexels.com/photos/8827287/pexels-photo-8827287.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    category: 'fish',
    items: ['Catfish', 'Tilapia'],
    image: 'https://images.pexels.com/photos/1363850/pexels-photo-1363850.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('category')
        setProducts(data || [])
      } catch {
        // Supabase not configured yet during early setup — fall back silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  const hasRealData = products.length > 0

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="bg-grain pt-20 pb-12 sm:pt-28">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[12px] text-pepper uppercase tracking-[0.2em] mb-5">Products Available</p>
            <h1 className="font-display text-soil tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
              Fresh farm produce categories
            </h1>
            <p className="text-stone text-[15px] max-w-md">
              All products are sourced directly from verified farmers. Availability changes based on harvest cycles.
            </p>
          </div>
        </section>

        <section className="bg-grain pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            {loading ? (
              <p className="text-stone text-[14px]">Loading...</p>
            ) : hasRealData ? (
              <div className="space-y-12">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5">
                    <div className="rounded-2xl overflow-hidden aspect-[3/2] sm:aspect-square">
                      <img src={CATEGORY_IMAGES[category] || CATEGORY_IMAGES.other} alt={CATEGORY_LABELS[category] || category}
                        className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="font-display text-soil text-xl mb-4">{CATEGORY_LABELS[category] || category}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {items.map((item) => (
                          <div key={item.id} className="bg-grain-dim rounded-xl px-4 py-3.5 border border-soil/8">
                            <p className="text-soil text-[14px] font-medium">{item.name}</p>
                            {item.unit && <p className="font-data text-[11px] text-stone mt-0.5">{item.unit}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {FALLBACK_CATEGORIES.map(({ category, items, image }) => (
                  <div key={category} className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5">
                    <div className="rounded-2xl overflow-hidden aspect-[3/2] sm:aspect-square">
                      <img src={image} alt={CATEGORY_LABELS[category]} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="font-display text-soil text-xl mb-4">{CATEGORY_LABELS[category]}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {items.map((item) => (
                          <div key={item} className="bg-grain-dim rounded-xl px-4 py-3.5 border border-soil/8">
                            <p className="text-soil text-[14px] font-medium">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-14 bg-soil rounded-2xl p-8 sm:p-10 text-center">
              <p className="text-grain/70 text-[14px] mb-5 max-w-sm mx-auto">
                Want to check what's available right now, or place an order?
              </p>
              <Link href="/contact" className="inline-block bg-pepper text-grain text-[14px] font-medium px-5 py-3 rounded-full hover:bg-pepper-deep transition-colors">
                Check Availability
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
