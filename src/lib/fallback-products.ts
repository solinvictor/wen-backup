import { CATEGORY_IMAGES } from '@/lib/category-images'

export interface Product {
  id: string
  name: string
  category: string
  unit: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
}

// Shown when Supabase env vars are missing or a fetch fails — keeps the
// store/product/saved pages demoable without a live backend.
export const FALLBACK_PRODUCTS: Product[] = [
  { id: 'f-eggs',    name: 'Eggs',    category: 'eggs',    unit: 'per crate', price: 4200,  image_url: CATEGORY_IMAGES.eggs,    is_available: true },
  { id: 'f-catfish', name: 'Catfish', category: 'fish',    unit: 'per kg',    price: 2800,  image_url: CATEGORY_IMAGES.fish,    is_available: true },
  { id: 'f-tilapia', name: 'Tilapia', category: 'fish',    unit: 'per kg',    price: 2200,  image_url: CATEGORY_IMAGES.fish,    is_available: true },
  { id: 'f-chicken', name: 'Chicken', category: 'chicken', unit: 'per kg',    price: 2800,  image_url: CATEGORY_IMAGES.chicken, is_available: true },
  { id: 'f-rice',    name: 'Rice',    category: 'rice',    unit: 'per bag',   price: 48000, image_url: CATEGORY_IMAGES.rice,    is_available: true },
  { id: 'f-beans',   name: 'Beans',   category: 'beans',   unit: 'per bag',   price: 52000, image_url: CATEGORY_IMAGES.beans,   is_available: true },
]
