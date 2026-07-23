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
  const pinDropped = useRef(false)

  const [loading,   setLoading]   = useState(true)
  const [gpsError,  setGpsError]  = useState('')
  const [coords,    setCoords]    = useState<{ lat: number; lng: number } | null>(null)
  const [label,     setLabel]     = useState('')
  const [resolving, setResolving] = useState(false)

  const DEFAULT = { lat: 7.7322, lng: 8.5391 }

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data?.display_name) {
        return data.display_name.split(',').slice(0, 4).join(', ').trim()
      }
    } catch { /* silent */ }
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
    if (pinDropped.current) return // already got a fix, ignore duplicates
    pinDropped.current = true
    const { latitude: lat, longitude: lng } = pos.coords
    movePin(lat, lng, 17)
    setGpsError('')
    setLoading(false)
  }

  function onGPSError() {
    if (pinDropped.current) return
    pinDropped.current = true
    setGpsError('Could not find you — drag the pin to your location')
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
        // First pass: accept any cached position so map moves fast
        navigator.geolocation.getCurrentPosition(
          onGPSSuccess,
          () => {
            // Cached lookup failed — now try high accuracy (slower but more precise)
            navigator.geolocation.getCurrentPosition(
              onGPSSuccess,
              onGPSError,
              { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
            )
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        )
      } else {
        onGPSError()
      }
    })

    return () => {
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current    = null
        markerObj.current = null
        LRef.current      = null
        pinDropped.current = false
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
