import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { calculateMarketDayDiscount, getMarketDayInfo } from '@/lib/market-day'

interface CartItem {
  id: string
  name: string
  category: string
  unit: string | null
  quantity: number
}

function genRef() {
  return 'WEN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

const DELIVERY_FEES = {
  standard: 1500,
  express: 3500,
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName, phoneNumber, email, location, landmark,
      deliveryLat, deliveryLng,
      buyerType, items, notes, deliveryType,
    } = body as {
      fullName?: string
      phoneNumber?: string
      email?: string
      location?: string
      landmark?: string
      deliveryLat?: number | null
      deliveryLng?: number | null
      buyerType?: string
      items?: CartItem[]
      notes?: string
      deliveryType?: 'standard' | 'express'
    }

    if (!fullName?.trim() || !phoneNumber?.trim() || !location?.trim() || !buyerType?.trim()) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email for your payment receipt.' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Your list is empty — add at least one product.' }, { status: 400 })
    }
    if (items.some(i => !i.id)) {
      return NextResponse.json({ error: 'Something went wrong with your cart. Please refresh and try again.' }, { status: 400 })
    }
    if (deliveryType !== 'standard' && deliveryType !== 'express') {
      return NextResponse.json({ error: 'Please choose a delivery option.' }, { status: 400 })
    }
    if (items.some(i => !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 100)) {
      return NextResponse.json({ error: 'Please check the quantities in your cart and try again.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fallback/demo items shown when the store has no live products yet
    // carry non-UUID placeholder ids (e.g. "f-eggs") and were never meant
    // to be purchasable — querying Postgres with one of these as a uuid
    // throws instead of just finding nothing, so filter them out up front
    // and treat them the same as "product not found" rather than crashing.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const invalidItem = items.find(i => !UUID_RE.test(i.id))
    if (invalidItem) {
      return NextResponse.json(
        { error: `"${invalidItem.name}" is not available for purchase yet. Please remove it and try again.` },
        { status: 400 }
      )
    }

    // Never trust client-sent prices — look up the real, current price for
    // every item server-side so a tampered request can't change what's charged.
    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('id, price, is_available')
      .in('id', items.map(i => i.id))

    if (productsError) {
      console.error('[orders] product lookup failed:', productsError.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    const priceById = new Map((dbProducts ?? []).map(p => [p.id, p]))
    let itemsTotal = 0
    for (const item of items) {
      const product = priceById.get(item.id)
      if (!product || product.is_available === false || product.price == null) {
        return NextResponse.json(
          { error: `"${item.name}" is no longer available. Please remove it and try again.` },
          { status: 400 }
        )
      }
      itemsTotal += Number(product.price) * item.quantity
    }
    const marketDay = getMarketDayInfo()
    const marketDayDiscount = calculateMarketDayDiscount(itemsTotal, marketDay)
    const deliveryFee = DELIVERY_FEES[deliveryType]
    const amountTotal = itemsTotal - marketDayDiscount + deliveryFee

    let userId: string | null = null
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (url && key) {
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()
        userId = user?.id ?? null
      }
    } catch { /* guest checkout */ }

    const productsInterested = items.map(i => i.name).join(', ')
    const { data: buyer, error: buyerError } = await supabase
      .from('buyers')
      .insert({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim(),
        location: location.trim(),
        landmark: landmark?.trim() || null,
        delivery_lat: deliveryLat ?? null,
        delivery_lng: deliveryLng ?? null,
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
      delivery_type: deliveryType,
      delivery_fee: deliveryFee,
      market_day: marketDay.marketDay,
      discount_amount: marketDayDiscount,
      expected_delivery_date: marketDay.deliveryDate,
      order_ref: orderRef,
      amount_total: amountTotal,
      status: 'pending_payment',
    })

    if (orderError) {
      console.error('[orders] order insert failed:', orderError.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      orderRef,
      amountTotal,
      discountAmount: marketDayDiscount,
      expectedDeliveryDate: marketDay.deliveryDate,
      email: email.trim(),
    })
  } catch (err) {
    console.error('[orders] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
