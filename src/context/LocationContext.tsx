'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export interface UserLocation {
  label: string        // display name e.g. "Makurdi, Benue"
  lat?: number
  lng?: number
  source: 'gps' | 'manual'
}

interface LocationContextValue {
  location: UserLocation | null
  setLocation: (loc: UserLocation) => void
  clearLocation: () => void
}

// ── Context ────────────────────────────────────────────────────────────────
const LocationContext = createContext<LocationContextValue | null>(null)
const STORAGE_KEY = 'wen_location_v1'

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLocationState(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const setLocation = useCallback((loc: UserLocation) => {
    setLocationState(loc)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)) } catch { /* ignore */ }
  }, [])

  const clearLocation = useCallback(() => {
    setLocationState(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [])

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>')
  return ctx
}
