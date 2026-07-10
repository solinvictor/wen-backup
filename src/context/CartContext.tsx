'use client'

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export interface CartLine {
  id: string
  name: string
  category: string
  unit: string | null
  quantity: number
}

interface CartState {
  items: Record<string, CartLine>
}

type CartAction =
  | { type: 'ADD'; product: Omit<CartLine, 'quantity'> }
  | { type: 'REMOVE'; id: string }
  | { type: 'SET_QTY'; id: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: Record<string, CartLine> }

interface CartContextValue {
  items: Record<string, CartLine>
  cartLines: CartLine[]
  cartCount: number
  addOne: (product: Omit<CartLine, 'quantity'>) => void
  removeOne: (id: string) => void
  setQty: (id: string, quantity: number) => void
  clearCart: () => void
}

// ── Reducer ────────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items[action.product.id]
      return {
        items: {
          ...state.items,
          [action.product.id]: {
            ...action.product,
            quantity: (existing?.quantity ?? 0) + 1,
          },
        },
      }
    }
    case 'REMOVE': {
      const existing = state.items[action.id]
      if (!existing) return state
      if (existing.quantity <= 1) {
        const next = { ...state.items }
        delete next[action.id]
        return { items: next }
      }
      return {
        items: {
          ...state.items,
          [action.id]: { ...existing, quantity: existing.quantity - 1 },
        },
      }
    }
    case 'SET_QTY': {
      if (action.quantity <= 0) {
        const next = { ...state.items }
        delete next[action.id]
        return { items: next }
      }
      return {
        items: {
          ...state.items,
          [action.id]: { ...state.items[action.id], quantity: action.quantity },
        },
      }
    }
    case 'CLEAR':
      return { items: {} }
    case 'HYDRATE':
      return { items: action.items }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'wen_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {} })

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          dispatch({ type: 'HYDRATE', items: parsed })
        }
      }
    } catch {
      // corrupted storage — start fresh
    }
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // storage full or blocked
    }
  }, [state.items])

  const addOne = useCallback((product: Omit<CartLine, 'quantity'>) => {
    dispatch({ type: 'ADD', product })
  }, [])

  const removeOne = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  const setQty = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'SET_QTY', id, quantity })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const cartLines = Object.values(state.items)
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      cartLines,
      cartCount,
      addOne,
      removeOne,
      setQty,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
