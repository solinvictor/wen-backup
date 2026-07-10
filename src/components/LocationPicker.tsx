'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, X, Locate, Search, ChevronRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useLocation } from '@/context/LocationContext'

// ── Nigerian cities for manual suggestions ─────────────────────────────────
const NG_CITIES = [
  'Abuja, FCT', 'Lagos, Lagos', 'Kano, Kano', 'Ibadan, Oyo',
  'Port Harcourt, Rivers', 'Benin City, Edo', 'Maiduguri, Borno',
  'Zaria, Kaduna', 'Aba, Abia', 'Jos, Plateau', 'Ilorin, Kwara',
  'Oyo, Oyo', 'Enugu, Enugu', 'Abeokuta, Ogun', 'Onitsha, Anambra',
  'Warri, Delta', 'Kaduna, Kaduna', 'Makurdi, Benue', 'Minna, Niger',
  'Bauchi, Bauchi', 'Akure, Ondo', 'Owerri, Imo', 'Uyo, Akwa Ibom',
  'Calabar, Cross River', 'Sokoto, Sokoto', 'Lafia, Nasarawa',
  'Lokoja, Kogi', 'Gombe, Gombe', 'Yola, Adamawa', 'Jalingo, Taraba',
  'Asaba, Delta', 'Awka, Anambra', 'Umuahia, Abia', 'Ikeja, Lagos',
  'Lekki, Lagos', 'Victoria Island, Lagos', 'Surulere, Lagos',
  'Wuse, Abuja', 'Garki, Abuja', 'Gwarinpa, Abuja', 'Maitama, Abuja',
]

type Step = 'idle' | 'locating' | 'success' | 'error'

interface Props {
  onClose: () => void
}

export function LocationPicker({ onClose }: Props) {
  const { setLocation } = useLocation()
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [])

  // Filter city suggestions
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) { setSuggestions([]); return }
    setSuggestions(
      NG_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 6)
    )
  }, [query])

  // ── GPS flow ──────────────────────────────────────────────────────────────
  async function handleGPS() {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.')
      setStep('error')
      return
    }

    setStep('locating')
    setErrorMsg('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          // Reverse geocode via Nominatim — free, no key needed
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'WENPlatform/1.0' } }
          )
          const data = await res.json()
          const addr = data.address || {}
          // Build a clean Nigerian-style label
          const parts = [
            addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.village,
            addr.city || addr.county || addr.state_district,
            addr.state,
          ].filter(Boolean)
          const label = parts.slice(0, 2).join(', ') || data.display_name?.split(',')[0] || 'Your location'

          setLocation({ label, lat, lng, source: 'gps' })
          setStep('success')
          setTimeout(onClose, 900)
        } catch {
          // Geocode failed but we still have coords — use a fallback label
          setLocation({ label: 'Your location', lat, lng, source: 'gps' })
          setStep('success')
          setTimeout(onClose, 900)
        }
      },
      (err) => {
        if (err.code === 1) {
          setErrorMsg('Location access was denied. Please allow it in your browser settings, or enter your area manually.')
        } else if (err.code === 2) {
          setErrorMsg('Could not detect your position. Try again or enter manually.')
        } else {
          setErrorMsg('Location request timed out. Enter your area manually.')
        }
        setStep('error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  // ── Manual selection ───────────────────────────────────────────────────────
  function handleManual(label: string) {
    setLocation({ label, source: 'manual' })
    setStep('success')
    setTimeout(onClose, 700)
  }

  function handleManualSubmit() {
    const label = query.trim()
    if (!label) return
    handleManual(label)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-soil/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-soil/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-soil/8">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-pepper" />
            <h2 className="font-display text-soil text-[17px] font-semibold">Your delivery area</h2>
          </div>
          <button onClick={onClose} className="p-1 text-soil/40 hover:text-soil transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">

          {/* GPS button */}
          {step !== 'success' && (
            <button
              onClick={handleGPS}
              disabled={step === 'locating'}
              className="w-full flex items-center gap-3 bg-soil text-white rounded-2xl px-4 py-3.5 hover:bg-soil/85 transition-colors disabled:opacity-60"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {step === 'locating'
                  ? <Loader2 size={16} className="animate-spin text-white" />
                  : <Locate size={16} className="text-white" />
                }
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-semibold">
                  {step === 'locating' ? 'Detecting location…' : 'Use my current location'}
                </p>
                <p className="text-[11px] text-white/55 mt-0.5">
                  {step === 'locating' ? 'Please allow access if prompted' : 'Precise or approximate — your choice'}
                </p>
              </div>
            </button>
          )}

          {/* Success state */}
          {step === 'success' && (
            <div className="flex items-center gap-3 bg-pepper/10 rounded-2xl px-4 py-3.5">
              <CheckCircle2 size={20} className="text-pepper shrink-0" />
              <p className="text-[14px] font-medium text-soil">Location set!</p>
            </div>
          )}

          {/* Error state */}
          {step === 'error' && (
            <div className="flex gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-600 leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Divider */}
          {step !== 'success' && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-soil/8" />
              <span className="text-[12px] text-stone/50 font-medium">or enter manually</span>
              <div className="flex-1 h-px bg-soil/8" />
            </div>
          )}

          {/* Manual search */}
          {step !== 'success' && (
            <div>
              <div className="flex items-center gap-2 bg-grain-dim border border-soil/12 rounded-xl px-3.5 py-2.5 focus-within:border-pepper/50 transition-colors">
                <Search size={15} className="text-stone/50 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                  placeholder="Search city or area — e.g. Wuse, Abuja"
                  className="flex-1 text-[14px] text-soil placeholder:text-stone/35 bg-transparent outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-stone/40 hover:text-soil transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-2 rounded-xl border border-soil/8 overflow-hidden bg-white shadow-sm">
                  {suggestions.map((city, i) => (
                    <button
                      key={city}
                      onClick={() => handleManual(city)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-grain-dim transition-colors ${
                        i > 0 ? 'border-t border-soil/6' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={13} className="text-pepper shrink-0" />
                        <span className="text-[14px] text-soil">{city}</span>
                      </div>
                      <ChevronRight size={14} className="text-stone/30" />
                    </button>
                  ))}
                </div>
              )}

              {/* Submit if no suggestion matches */}
              {query.trim().length >= 2 && suggestions.length === 0 && (
                <button
                  onClick={handleManualSubmit}
                  className="mt-2 w-full text-[13px] font-medium text-pepper py-2.5 border border-pepper/30 rounded-xl hover:bg-pepper/5 transition-colors"
                >
                  Use &ldquo;{query.trim()}&rdquo; as my area
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
