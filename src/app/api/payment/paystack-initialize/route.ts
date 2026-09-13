import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Starts a Paystack checkout for an order that was already created by
 * /api/orders. Re-reads the order + real email/amount from the DB rather
 * than trusting anything the client sends here — the only input we accept
 * is the order_ref, everything that matters is looked up server-side.
 *
 * Body: { orderRef: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { orderRef } = (await req.json()) as { orderRef?: string }
    if (!orderRef?.trim()) {
      return NextResponse.json({ error: 'Missing order reference.' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('[paystack-initialize] PAYSTACK_SECRET_KEY is not set')
      return NextResponse.json({ error: 'Payments are not configured yet. Please try again later.' }, { status: 500 })
    }

    const supabase = createAdminClient()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, amount_total, buyer_id, buyers(email)')
      .eq('order_ref', orderRef.trim())
      .single()

    if (orderError || !order) {
      console.error('[paystack-initialize] order lookup failed:', orderError?.message)
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }
    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: 'This order has already been paid or is no longer payable.' }, { status: 409 })
    }
    if (!order.amount_total || order.amount_total <= 0) {
      return NextResponse.json({ error: 'This order has no payable amount.' }, { status: 400 })
    }

    // Supabase's JS client returns the joined `buyers` relation as an array
    // even for a single row unless explicitly aliased — handle both shapes.
    const buyerRow = Array.isArray(order.buyers) ? order.buyers[0] : order.buyers
    const email = buyerRow?.email
    if (!email) {
      console.error('[paystack-initialize] order has no buyer email:', orderRef)
      return NextResponse.json({ error: 'Could not find an email for this order.' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`

    const psRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(Number(order.amount_total) * 100), // naira -> kobo, integer
        reference: orderRef.trim(),
        callback_url: `${siteUrl}/checkout/callback`,
        metadata: { order_ref: orderRef.trim(), order_id: order.id },
      }),
    })

    const psData = await psRes.json()
    if (!psRes.ok || !psData?.status) {
      console.error('[paystack-initialize] Paystack rejected the request:', psData?.message)
      return NextResponse.json({ error: psData?.message || 'Could not start payment. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({
      authorizationUrl: psData.data.authorization_url,
      accessCode: psData.data.access_code,
      reference: psData.data.reference,
    })
  } catch (err) {
    console.error('[paystack-initialize] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
