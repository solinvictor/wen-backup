'use client'

import { useEffect, useRef, useState } from 'react'

const FADE_MS = 700

type Props = {
  /** Video URLs. They play one after another and loop back to the first. */
  sources: string[]
}

type ConnectionInfo = { saveData?: boolean; effectiveType?: string }

// Set a slot's source once; calling it again with the same URL does nothing.
function load(el: HTMLVideoElement, url: string) {
  if (el.dataset.src === url) return
  el.dataset.src = url
  el.src = url
  el.load()
}

/**
 * Looping background videos for the hero. Two stacked <video> layers: while one
 * plays the other is preloaded, then they crossfade when the clip ends.
 *
 * The hero photo underneath is the fallback. Nothing loads for people on Data
 * Saver, slow connections or reduced-motion, or if a clip fails to load.
 */
export function HeroVideos({ sources }: Props) {
  const count = sources.length
  const boxRef = useRef<HTMLDivElement>(null)
  const slotA = useRef<HTMLVideoElement>(null)
  const slotB = useRef<HTMLVideoElement>(null)
  const activeRef = useRef<0 | 1>(0)
  const indexRef = useRef(0)
  const preloadedRef = useRef(false)

  const [enabled, setEnabled] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState<0 | 1>(0)

  // Decide after mount whether to play at all, so server and client markup match.
  useEffect(() => {
    if (count === 0) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const conn = (navigator as Navigator & { connection?: ConnectionInfo }).connection
    const slow = !!conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? '')
    if (!reduce && !slow) setEnabled(true)
  }, [count])

  // Start the first clip, and pause everything while the hero is off-screen.
  useEffect(() => {
    if (!enabled) return
    const slots = [slotA.current, slotB.current]
    const first = slots[0]
    if (!first) return
    for (const el of slots) {
      if (el) {
        el.muted = true
        el.defaultMuted = true
      }
    }
    load(first, sources[0])

    // Autoplay can be silently blocked (varies by browser/OS/power-saving mode) even
    // when muted + inline. If that happens, retry on the first sign of life from the
    // visitor instead of leaving the hero photo showing forever.
    let retried = false
    function tryPlay(el: HTMLVideoElement) {
      el.play().catch(() => {
        if (retried) return
        retried = true
        const retry = () => {
          el.play().catch(() => {})
          events.forEach((ev) => window.removeEventListener(ev, retry))
        }
        const events: (keyof WindowEventMap)[] = ['scroll', 'touchstart', 'pointerdown', 'keydown']
        events.forEach((ev) => window.addEventListener(ev, retry, { once: true, passive: true }))
      })
    }
    tryPlay(first)

    const box = boxRef.current
    let io: IntersectionObserver | undefined
    if (box && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          const el = slots[activeRef.current]
          if (!el) return
          if (entry.isIntersecting) tryPlay(el)
          else el.pause()
        },
        { threshold: 0.05 }
      )
      io.observe(box)
    }
    return () => io?.disconnect()
  }, [enabled, sources])

  function handlePlaying(slot: 0 | 1) {
    setReady(true)
    // Fetch the second clip only once the first is really playing (kind to mobile data).
    if (count > 1 && slot === 0 && !preloadedRef.current) {
      preloadedRef.current = true
      const b = slotB.current
      if (b) load(b, sources[1])
    }
  }

  function handleEnded(slot: 0 | 1) {
    if (count < 2 || slot !== activeRef.current) return
    const next: 0 | 1 = slot === 0 ? 1 : 0
    const nextIndex = (indexRef.current + 1) % count
    const nextEl = (next === 0 ? slotA : slotB).current
    const prevEl = (slot === 0 ? slotA : slotB).current
    if (!nextEl) return

    load(nextEl, sources[nextIndex]) // no-op when it was already preloaded
    nextEl.currentTime = 0
    nextEl.play().catch(() => {})
    // (a blocked play() here is rare — it only happens on the very first clip;
    // once one clip has played, the browser treats the page as already "engaged")
    activeRef.current = next
    indexRef.current = nextIndex
    setActive(next)

    // After the fade: park the old clip and preload the one that comes after.
    window.setTimeout(() => {
      if (!prevEl) return
      prevEl.pause()
      load(prevEl, sources[(nextIndex + 1) % count])
    }, FADE_MS + 100)
  }

  if (!enabled || failed || count === 0) return null

  const slots: (0 | 1)[] = count > 1 ? [0, 1] : [0]

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {slots.map((slot) => (
        <video
          key={slot}
          ref={slot === 0 ? slotA : slotB}
          muted
          playsInline
          preload="auto"
          loop={count === 1}
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => handlePlaying(slot)}
          onEnded={() => handleEnded(slot)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover object-[70%_center] transition-opacity duration-700 ${
            active === slot ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}
