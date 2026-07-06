import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    console.log('[buyers] route hit')
    console.log('[buyers] env check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING',
    })

    const body = await req.json()
    const { fullName, phoneNumber, location, buyerType, productsInterested } = body

    if (!fullName?.trim() || !phoneNumber?.trim() || !location?.trim() || !buyerType?.trim()) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('buyers').insert({
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      location: location.trim(),
      buyer_type: buyerType,
      products_interested: productsInterested?.trim() || null,
    })

    if (error) {
      console.error('[buyers] insert failed:', error.message, error.code, error.details)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[buyers] unexpected error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
