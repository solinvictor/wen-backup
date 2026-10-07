'use client'

import { useEffect, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'
import { WEN_HQ } from '@/lib/delivery'

export interface AddressSuggestion {
  label: string
  lat: number
  lng: number
}

interface PhotonProperties {
  name?: string
  street?: string
  housenumber?: string
  district?: string
  city?: string
  county?: string
  state?: string
  country?: string
  countrycode?: string
}

interface PhotonFeature {
  properties?: PhotonProperties
  geometry?: { coordinates?: number[] }
}

interface Props {
  id: string
  value: string
  invalid?: boolean
  onChange: (value: string) => void
  onSelect: (suggestion: AddressSuggestion) => void
}

function uniqueParts(parts: Array<string | undefined>) {
  const seen = new Set<string>()
  return parts
    .map(part => part?.trim())
    .filter((part): part is string => {
      if (!part) return false
      const key = part.toLocaleLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function toSuggestion(feature: PhotonFeature): AddressSuggestion | null {
  const properties = feature.properties
  const coordinates = feature.geometry?.coordinates
  if (!properties || !coordinates || coordinates.length < 2) return null

  const [lng, lat] = coordinates
  if (
    typeof lat !== 'number' || typeof lng !== 'number'
    || !Number.isFinite(lat) || !Number.isFinite(lng)
    || lat < -90 || lat > 90 || lng < -180 || lng > 180
  ) return null

  const isNigeria = properties.countrycode?.toUpperCase() === 'NG'
    || properties.country?.toLocaleLowerCase() === 'nigeria'
  if (!isNigeria) return null

  const street = uniqueParts([properties.housenumber, properties.street]).join(' ')
  const primary = properties.name && properties.name.toLocaleLowerCase() !== properties.street?.toLocaleLowerCase()
    ? properties.name
    : street || properties.name
  const label = uniqueParts([
    primary,
    street !== primary ? street : undefined,
    properties.district,
    properties.city || properties.county,
    properties.state,
  ]).join(', ')

  if (label.length < 3) return null
  return { label, lat, lng }
}

export function AddressAutocomplete({ id, value, invalid, onChange, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedValue, setSelectedValue] = useState('')
  const query = value.trim()
  const listId = `${id}-suggestions`

  useEffect(() => {
    if (query.length < 3 || query === selectedValue) {
      setSuggestions([])
      setSearchState('idle')
      return
    }

    const controller = new AbortController()
    setSearchState('loading')
    setActiveIndex(-1)

    const timeout = window.setTimeout(async () => {
      try {
        const url = new URL('https://photon.komoot.io/api/')
        url.searchParams.set('q', query)
        url.searchParams.set('lat', String(WEN_HQ.lat))
        url.searchParams.set('lon', String(WEN_HQ.lng))
        url.searchParams.set('limit', '8')
        url.searchParams.set('lang', 'en')

        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`Address search failed (${response.status})`)

        const data = await response.json() as { features?: PhotonFeature[] }
        const matches = (data.features ?? [])
          .map(toSuggestion)
          .filter((item): item is AddressSuggestion => item !== null)

        setSuggestions(matches)
        setSearchState('ready')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setSuggestions([])
        setSearchState('error')
      }
    }, 400)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query, selectedValue])

  function selectSuggestion(suggestion: AddressSuggestion) {
    setSelectedValue(suggestion.label)
    setSuggestions([])
    setSearchState('idle')
    setActiveIndex(-1)
    setIsOpen(false)
    onChange(suggestion.label)
    onSelect(suggestion)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex(index => Math.min(index + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault()
      setActiveIndex(index => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
      event.preventDefault()
      selectSuggestion(suggestions[activeIndex])
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const showResults = isOpen && query.length >= 3 && searchState !== 'idle'

  return (
    <div className="w-full">
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone/45 pointer-events-none"
        />
        <input
          id={id}
          name="delivery-address"
          autoComplete="street-address"
          maxLength={180}
          required
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          aria-invalid={invalid || undefined}
          value={value}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 100)}
          onChange={event => {
            setSelectedValue('')
            setSuggestions([])
            setActiveIndex(-1)
            setIsOpen(true)
            onChange(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a street, area, or city"
          className={`wen-input bg-white !pl-10 ${invalid ? '!border-red-400' : ''}`}
        />
      </div>

      {showResults && (
        <div
          id={listId}
          role="listbox"
          aria-label="Address suggestions"
          className="mt-2 overflow-hidden rounded-xl border border-soil/10 bg-white shadow-sm"
        >
          {searchState === 'loading' && (
            <div role="status" className="flex items-center gap-2 px-4 py-3 text-[12px] text-stone/60">
              <Loader2 size={14} className="animate-spin" />
              Searching Nigerian addresses…
            </div>
          )}

          {searchState === 'error' && (
            <p role="status" className="px-4 py-3 text-[12px] text-stone/60">
              Address suggestions are unavailable. You can still add a map pin below.
            </p>
          )}

          {searchState === 'ready' && suggestions.length === 0 && (
            <p role="status" className="px-4 py-3 text-[12px] text-stone/60">
              No matching address found. Add a map pin below to calculate delivery.
            </p>
          )}

          {searchState === 'ready' && suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={event => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
                index === activeIndex ? 'bg-pepper/8' : 'hover:bg-grain-dim'
              } ${index > 0 ? 'border-t border-soil/6' : ''}`}
            >
              <MapPin size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-pepper" />
              <span className="text-[13px] leading-snug text-soil">{suggestion.label}</span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-1.5 text-[11px] leading-relaxed text-stone/45">
        Search suggestions use <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Photon</a> with <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-2">OpenStreetMap</a> data. Typed searches go to Photon; use the optional pin instead if preferred.
      </p>
    </div>
  )
}
