'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, MapPin, Navigation, X, LocateFixed } from 'lucide-react'

interface Props {
  onConfirm: (coords: { lat: number; lng: number }, label: string) => void
  onClose: () => void
}

/** Max GPS accuracy (meters) we accept without requiring a manual pin adjust */
const GOOD_ACCURACY_M = 30
/** Soft threshold — warn but still allow confirm if user explicitly adjusted pin */
const FAIR_ACCURACY_M = 75

export default function LocationMapPicker({ onConfirm, onClose }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapObj     = useRef<any>(null)
  const markerObj  = useRef<any>(null)
  const circleObj  = useRef<any>(null)
  const LRef       = useRef<any>(null)
  const watchId    = useRef<number | null>(null)
  /** True once user dragged or tapped the map — pin is intentional, not raw GPS */
  const manualPin  = useRef(false)

  const [loading,   setLoading]   = useState(true)
  const [gpsError,  setGpsError]  = useState('')
  const [coords,    setCoords]    = useState<{ lat: number; lng: number } | null>(null)
  const [label,     setLabel]     = useState('')
  const [resolving, setResolving] = useState(false)
  const [accuracy,  setAccuracy]  = useState<number | null>(null)
  const [pinSource, setPinSource] = useState<'gps' | 'manual' | null>(null)

  const DEFAULT = { lat: 7.7322, lng: 8.5391 }

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'WENPlatform/1.0 (farm-to-market; contact@wen.local)',
          },
        }
      )
      if (!res.ok) throw new Error(`Nominatim ${res.status}`)
      const data = await res.json()
      const addr = data.address || {}
      const parts = [
        addr.road || addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.village,
        addr.city || addr.county || addr.state_district,
        addr.state,
      ].filter(Boolean)
      if (parts.length) return parts.slice(0, 3).join(', ')
      if (data?.display_name) {
        return data.display_name.split(',').slice(0, 4).join(', ').trim()
      }
    } catch { /* fall through */ }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  function updateAccuracyCircle(lat: number, lng: number, acc: number | null) {
    const L = LRef.current
    const map = mapObj.current
    if (!L || !map) return

    if (circleObj.current) {
      map.removeLayer(circleObj.current)
      circleObj.current = null
    }
    // Only show circle for live GPS fixes, not manual pins
    if (acc != null && acc > 0 && !manualPin.current) {
      circleObj.current = L.circle([lat, lng], {
        radius: acc,
        color: acc <= GOOD_ACCURACY_M ? '#16a34a' : acc <= FAIR_ACCURACY_M ? '#d97706' : '#ea580c',
        fillColor: acc <= GOOD_ACCURACY_M ? '#22c55e' : acc <= FAIR_ACCURACY_M ? '#f59e0b' : '#f97316',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map)
    }
  }

  function movePin(lat: number, lng: number, zoom?: number, fromManual = false) {
    const L   = LRef.current
    const map = mapObj.current
    if (!L || !map) return

    if (fromManual) {
      manualPin.current = true
      setPinSource('manual')
      setAccuracy(null)
      if (circleObj.current) {
        map.removeLayer(circleObj.current)
        circleObj.current = null
      }
      // Stop refining GPS so it doesn't yank the pin back
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }
    }

    if (markerObj.current) {
      markerObj.current.setLatLng([lat, lng])
    } else {
      const m = L.marker([lat, lng], { draggable: true }).addTo(map)
      m.on('dragend', () => {
        const p = m.getLatLng()
        movePin(p.lat, p.lng, undefined, true)
      })
      markerObj.current = m
    }

    map.setView([lat, lng], zoom ?? map.getZoom())
    resolvePin(lat, lng)
  }

  function resolvePin(lat: number, lng: number) {
    setCoords({ lat, lng })
    setResolving(true)
    reverseGeocode(lat, lng).then(l => {
      setLabel(l)
      setResolving(false)
    })
  }

  const onGPSSuccess = useCallback((pos: GeolocationPosition) => {
    // Ignore further GPS updates after user placed the pin manually
    if (manualPin.current) return

    const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords
    const rounded = Math.round(acc)
    const zoom = acc <= 20 ? 19 : acc <= 50 ? 18 : acc <= 200 ? 17 : 15

    movePin(lat, lng, zoom, false)
    setAccuracy(rounded)
    setPinSource('gps')
    setGpsError('')
    setLoading(false)
    updateAccuracyCircle(lat, lng, acc)

    // Lock once we have a strong fix
    if (acc <= GOOD_ACCURACY_M && watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onGPSError(err?: GeolocationPositionError) {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    let msg = 'Could not find you — drag the pin to your exact gate or door'
    if (err?.code === 1) msg = 'Location permission denied — allow access, or drag the pin yourself'
    else if (err?.code === 2) msg = 'GPS signal weak — go near a window, or drag the pin on the map'
    else if (err?.code === 3) msg = 'GPS timed out — drag the pin to your exact location'
    setGpsError(msg)
    if (!coords) {
      movePin(DEFAULT.lat, DEFAULT.lng, 15, true)
    }
    setLoading(false)
  }

  function startWatching() {
    if (!navigator.geolocation) {
      onGPSError()
      return
    }
    manualPin.current = false
    setPinSource(null)
    setLoading(true)
    setGpsError('')
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
    }
    watchId.current = navigator.geolocation.watchPosition(
      onGPSSuccess,
      onGPSError,
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    )
  }

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then(L => {
      const DefaultIcon = L.Icon.Default as any
      delete DefaultIcon.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [DEFAULT.lat, DEFAULT.lng],
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      map.on('click', (e: any) => {
        movePin(e.latlng.lat, e.latlng.lng, undefined, true)
      })

      LRef.current   = L
      mapObj.current = map
      startWatching()
    }).catch(() => {
      setGpsError('Map failed to load — check your connection and try again')
      setLoading(false)
    })

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current    = null
        markerObj.current = null
        circleObj.current = null
        LRef.current      = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isManual = pinSource === 'manual'
  const isGood   = accuracy !== null && accuracy <= GOOD_ACCURACY_M
  const isFair   = accuracy !== null && accuracy > GOOD_ACCURACY_M && accuracy <= FAIR_ACCURACY_M
  const isPoor   = accuracy !== null && accuracy > FAIR_ACCURACY_M

  // Block confirm on poor GPS unless user deliberately adjusted the pin
  const canConfirm = !!coords && !resolving && !loading && (isManual || isGood || isFair)

  let accuracyHint: string | null = null
  let accuracyColor = 'text-stone/50'
  if (isManual) {
    accuracyHint = '✓ Pin placed by you — drag to fine-tune the exact gate or door'
    accuracyColor = 'text-green-600'
  } else if (isGood) {
    accuracyHint = `✓ Strong GPS — ±${accuracy}m — good for the rider`
    accuracyColor = 'text-green-600'
  } else if (isFair) {
    accuracyHint = `±${accuracy}m — ok, but drag the pin to your gate if you can`
    accuracyColor = 'text-amber-600'
  } else if (isPoor) {
    accuracyHint = `±${accuracy}m — too wide for delivery. Drag the pin to your exact spot`
    accuracyColor = 'text-orange-600'
  } else if (!loading && !gpsError) {
    accuracyHint = 'Waiting for a precise GPS fix…'
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 h-14 border-b border-soil/10 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-pepper" />
          <span className="font-body text-soil text-[16px] font-semibold">Pin exact delivery spot</span>
        </div>
        <button onClick={onClose} className="p-2 text-soil/40 hover:text-soil transition-colors" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-2.5 bg-pepper/5 border-b border-pepper/10 shrink-0 text-center">
        <p className="text-[12.5px] text-pepper-deep font-medium">
          {loading
            ? 'Getting a precise GPS fix — hold still…'
            : 'Drag the pin or tap the map so the rider finds your gate'}
        </p>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/80">
            <Loader2 size={28} className="animate-spin text-pepper" />
            <p className="text-[12px] text-soil/50">Locking onto your location…</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

        {/* Recenter on GPS */}
        {!loading && (
          <button
            type="button"
            onClick={startWatching}
            className="absolute bottom-4 right-4 z-[500] flex items-center gap-1.5 bg-white shadow-lg border border-soil/10 rounded-full px-3 py-2.5 text-[12px] font-semibold text-soil hover:bg-grain-dim transition-colors"
            title="Use my GPS again"
          >
            <LocateFixed size={15} className="text-pepper" />
            My GPS
          </button>
        )}
      </div>

      <div className="shrink-0 border-t border-soil/10 px-4 pt-3 pb-6 bg-white space-y-3">
        {gpsError && (
          <p className="text-[12px] text-amber-600 text-center">{gpsError}</p>
        )}
        {accuracyHint && (
          <div className={`text-center text-[12px] font-medium ${accuracyColor}`}>
            {accuracyHint}
          </div>
        )}
        {label && (
          <div className="flex items-start gap-2 bg-grain-dim rounded-xl px-3 py-2.5">
            <MapPin size={13} className="text-pepper shrink-0 mt-0.5" />
            <p className="text-[13px] text-soil leading-snug">
              {resolving ? 'Reading address…' : label}
            </p>
          </div>
        )}
        <button
          onClick={() => coords && onConfirm(coords, label)}
          disabled={!canConfirm}
          className="w-full flex items-center justify-center gap-2 bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep transition-colors disabled:opacity-50"
        >
          <Navigation size={16} />
          {isPoor && !isManual
            ? 'Improve pin accuracy first'
            : isGood || isManual
              ? 'Confirm exact location'
              : 'Confirm this location'}
        </button>
        {isPoor && !isManual && (
          <p className="text-[11px] text-center text-stone/50">
            Wide GPS circles make riders search. Drag the pin onto your gate or door.
          </p>
        )}
      </div>
    </div>
  )
}
