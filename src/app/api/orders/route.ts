import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface CartItem {
  name: string
  category: string
  unit: string | null
  quantity: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, phoneNumber, location, buyerType, items, notes } = body as {
      fullName?: string
      phoneNumber?: string
      location?: string
      buyerType?: string
      items?: CartItem[]
      notes?: string
    }

    if (!fullName?.trim() || !phoneNumber?.trim() || !location?.trim() || !buyerType?.trim()) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Your list is empty — add at least one product.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // No public auth/session exists yet, so we can't reliably match this
    // person to an existing buyer row — every order submission creates a
    // fresh buyer record, same as the standalone buyer registration form
    // does today. Matches the existing pattern rather than inventing dedup
    // logic that isn't backed by real identity.
    const productsInterested = items.map(i => i.name).join(', ')
    const { data: buyer, error: buyerError } = await supabase
      .from('buyers')
      .insert({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        location: location.trim(),
        buyer_type: buyerType,
        products_interested: productsInterested,
      })
      .select('id')
      .single()

    if (buyerError || !buyer) {
      console.error('[orders] buyer insert failed:', buyerError?.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // orders.product_summary is free text (no line-item table exists yet) —
    // compose a readable summary from the cart so admins reviewing orders
    // see exactly what was requested, same as if a buyer had typed it in.
    const productSummary = items
      .map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}${i.unit ? ` (${i.unit})` : ''}`)
      .join(', ')

    const { error: orderError } = await supabase.from('orders').insert({
      buyer_id: buyer.id,
      product_summary: productSummary,
      notes: notes?.trim() || null,
    })

    if (orderError) {
      console.error('[orders] order insert failed:', orderError.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[orders] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
