import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface CartItem {
  name: string
  category: string
  unit: string | null
  quantity: number
  price?: number | null
}

function genRef() {
  return 'WEN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, phoneNumber, location, buyerType, items, notes, deliveryType, deliveryFee } = body as {
      fullName?: string
      phoneNumber?: string
      location?: string
      buyerType?: string
      items?: CartItem[]
      notes?: string
      deliveryType?: 'standard' | 'express'
      deliveryFee?: number
    }

    if (!fullName?.trim() || !phoneNumber?.trim() || !location?.trim() || !buyerType?.trim()) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Your list is empty — add at least one product.' }, { status: 400 })
    }

    // Try to get the logged-in user — gracefully skip if env vars missing or no session
    let userId: string | null = null
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (url && key) {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id ?? null
      }
    } catch { /* no session — guest checkout, userId stays null */ }

    const supabase = createAdminClient()

    const productsInterested = items.map(i => i.name).join(', ')
    const { data: buyer, error: buyerError } = await supabase
      .from('buyers')
      .insert({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        location: location.trim(),
        buyer_type: buyerType,
        products_interested: productsInterested,
        ...(userId ? { user_id: userId } : {}),
      })
      .select('id')
      .single()

    if (buyerError || !buyer) {
      console.error('[orders] buyer insert failed:', buyerError?.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    const productSummary = items
      .map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}${i.unit ? ` (${i.unit})` : ''}`)
      .join(', ')

    const orderRef = genRef()

    const { error: orderError } = await supabase.from('orders').insert({
      buyer_id: buyer.id,
      product_summary: productSummary,
      notes: notes?.trim() || null,
      delivery_type: deliveryType ?? null,
      delivery_fee: deliveryFee ?? null,
      order_ref: orderRef,
    })

    if (orderError) {
      console.error('[orders] order insert failed:', orderError.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderRef })
  } catch (err) {
    console.error('[orders] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
