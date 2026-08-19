'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, Navigation, X } from 'lucide-react'

interface Props {
  onConfirm: (coords: { lat: number; lng: number }, label: string) => void
  onClose: () => void
}

export default function LocationMapPicker({ onConfirm, onClose }: Props) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapObj    = useRef<any>(null)
  const markerObj = useRef<any>(null)
  const LRef      = useRef<any>(null)
  const watchId = useRef<number | null>(null)

  const [loading,   setLoading]   = useState(true)
  const [gpsError,  setGpsError]  = useState('')
  const [coords,    setCoords]    = useState<{ lat: number; lng: number } | null>(null)
  const [label,     setLabel]     = useState('')
  const [resolving, setResolving] = useState(false)
  const [accuracy,  setAccuracy]  = useState<number | null>(null)

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
    } catch { /* silent — fall through */ }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  function movePin(lat: number, lng: number, zoom?: number) {
    const L   = LRef.current
    const map = mapObj.current
    if (!L || !map) return

    if (markerObj.current) {
      markerObj.current.setLatLng([lat, lng])
    } else {
      const m = L.marker([lat, lng], { draggable: true }).addTo(map)
      m.on('dragend', () => {
        const p = m.getLatLng()
        resolvePin(p.lat, p.lng)
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

  function onGPSSuccess(pos: GeolocationPosition) {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords
    // Keep refining pin as accuracy improves — zoom in more as we get better fix
    const zoom = accuracy <= 20 ? 19 : accuracy <= 50 ? 18 : accuracy <= 200 ? 17 : 15
    movePin(lat, lng, zoom)
    setAccuracy(Math.round(accuracy))
    setGpsError('')
    setLoading(false)
    // Stop watching once we hit ≤20m — precise enough
    if (accuracy <= 20 && watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }

  function onGPSError(err?: GeolocationPositionError) {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    let msg = 'Could not find you — drag the pin to your location'
    if (err?.code === 1) msg = 'Location permission denied — drag the pin or allow access and reopen'
    else if (err?.code === 2) msg = 'Position unavailable — check GPS signal, or drag the pin'
    else if (err?.code === 3) msg = 'GPS timed out — drag the pin to your location'
    setGpsError(msg)
    movePin(DEFAULT.lat, DEFAULT.lng, 15)
    setLoading(false)
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
        movePin(e.latlng.lat, e.latlng.lng)
      })

      LRef.current   = L
      mapObj.current = map

      if (navigator.geolocation) {
        // watchPosition keeps refining — pin moves as GPS chip gets a better fix
        // maximumAge: 0 forces fresh reading every time, never stale cache
        watchId.current = navigator.geolocation.watchPosition(
          onGPSSuccess,
          onGPSError,
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        )
      } else {
        onGPSError()
      }
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
        LRef.current      = null
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 h-14 border-b border-soil/10 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-pepper" />
          <span className="font-body text-soil text-[16px] font-semibold">Pin your location</span>
        </div>
        <button onClick={onClose} className="p-2 text-soil/40 hover:text-soil transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-2.5 bg-pepper/5 border-b border-pepper/10 shrink-0 text-center">
        <p className="text-[12.5px] text-pepper-deep font-medium">
          {loading ? 'Getting your location…' : 'Drag the pin or tap the map to adjust'}
        </p>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <Loader2 size={28} className="animate-spin text-pepper" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="shrink-0 border-t border-soil/10 px-4 pt-3 pb-6 bg-white space-y-3">
        {gpsError && (
          <p className="text-[12px] text-amber-600 text-center">{gpsError}</p>
        )}
        {accuracy !== null && !gpsError && (
          <div className={`text-center text-[11.5px] font-medium ${accuracy <= 20 ? 'text-green-600' : accuracy <= 50 ? 'text-amber-500' : 'text-orange-500'}`}>
            {accuracy <= 20
              ? `✓ Pin locked — ±${accuracy}m accuracy`
              : `Refining GPS… ±${accuracy}m — hold still for better accuracy`}
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
          disabled={!coords || resolving}
          className="w-full flex items-center justify-center gap-2 bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep transition-colors disabled:opacity-50"
        >
          <Navigation size={16} />
          Confirm this location
        </button>
      </div>
    </div>
  )
}
