import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Called by the checkout callback page after Paystack redirects the buyer
 * back. This does NOT trust the redirect happened — it independently asks
 * Paystack whether the transaction actually succeeded, and only then
 * (defensively — the webhook is the primary path) marks the order paid.
 * Safe to call multiple times: idempotent on order.status.
 *
 * Reuses the monnify_transaction_reference column from the brief Monnify
 * era rather than renaming anything back — see paystack-initialize.
 */
export async function POST(req: NextRequest) {
  try {
    const { reference } = (await req.json()) as { reference?: string }
    if (!reference?.trim()) {
      return NextResponse.json({ error: 'Missing reference.' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })
    }

    const supabase = createAdminClient()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, amount_total, order_ref, product_summary, delivery_type, delivery_fee')
      .eq('order_ref', reference.trim())
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    // Already confirmed (likely by the webhook, which is the primary path) —
    // just return the current state, don't re-verify with Paystack again.
    if (order.status === 'paid') {
      return NextResponse.json({ paid: true, order })
    }

    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const psData = await psRes.json()

    if (!psRes.ok || !psData?.status) {
      return NextResponse.json({ paid: false, error: psData?.message || 'Could not verify payment.' })
    }

    const expectedKobo = Math.round(Number(order.amount_total) * 100)
    const isSuccessful = psData.data?.status === 'success' && psData.data?.amount === expectedKobo

    if (!isSuccessful) {
      if (order.status === 'pending_payment') {
        await supabase.from('orders').update({ status: 'payment_failed' }).eq('id', order.id)
      }
      return NextResponse.json({ paid: false, error: 'Payment was not successful.' })
    }

    if (order.status === 'pending_payment') {
      await supabase
        .from('orders')
        .update({ status: 'paid', monnify_transaction_reference: reference.trim() })
        .eq('id', order.id)
    }

    return NextResponse.json({ paid: true, order: { ...order, status: 'paid' } })
  } catch (err) {
    console.error('[paystack-verify] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
