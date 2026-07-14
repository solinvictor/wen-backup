import { NextRequest, NextResponse } from 'next/server'

// Server-side W3W validation — keeps the API key off the client
export async function GET(req: NextRequest) {
  const words = req.nextUrl.searchParams.get('words')?.trim().toLowerCase()
  if (!words) return NextResponse.json({ error: 'No words provided' }, { status: 400 })

  // Basic format check before hitting the API
  const parts = words.replace(/^\/\/\//, '').split('.')
  if (parts.length !== 3 || parts.some(p => !p || !/^[a-z]+$/.test(p))) {
    return NextResponse.json({ valid: false, error: 'Invalid format — must be three words like index.home.raft' })
  }

  const apiKey = process.env.W3W_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'W3W not configured' }, { status: 500 })
  }

  try {
    const clean = parts.join('.')
    const res = await fetch(
      `https://api.what3words.com/v3/convert-to-coordinates?words=${encodeURIComponent(clean)}&key=${apiKey}`,
      { next: { revalidate: 0 } }
    )
    const data = await res.json()

    if (data.error) {
      return NextResponse.json({ valid: false, error: 'Address not found — check spelling' })
    }

    return NextResponse.json({
      valid: true,
      words: clean,
      lat: data.coordinates.lat,
      lng: data.coordinates.lng,
      nearestPlace: data.nearestPlace,
      country: data.country,
      map: `https://what3words.com/${clean}`,
    })
  } catch {
    return NextResponse.json({ error: 'Could not reach what3words. Try again.' }, { status: 502 })
  }
}
