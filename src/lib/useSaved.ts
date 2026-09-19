'use client'

import { useCallback, useEffect, useState } from 'react'

// Device-local "saved products" list — same trust level as the cart (which is
// also localStorage-only until checkout). No server sync yet.
const STORAGE_KEY = 'wen_saved_v1'

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch { /* storage full or unavailable */ }
}

export function useSaved() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(readIds())
  }, [])

  const isSaved = useCallback((id: string) => ids.includes(id), [ids])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      writeIds(next)
      return next
    })
  }, [])

  return { savedIds: ids, isSaved, toggle }
}
