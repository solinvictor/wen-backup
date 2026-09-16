import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { amountsMatch, getMonnifyConfig, monnifyRequest, type MonnifyTransactionStatus } from '@/lib/monnify'

/**
 * Called by the checkout callback page after Monnify redirects the buyer
 * back. This does NOT trust the redirect happened — it independently asks
 * Monnify whether the transaction actually succeeded, and only then
 * (defensively — the webhook is the primary path) marks the order paid.
 * Safe to call multiple times: idempotent on order.status.
 */
export async function POST(req: NextRequest) {
  try {
    const { reference } = (await req.json()) as { reference?: string }
    if (!reference?.trim()) {
      return NextResponse.json({ error: 'Missing reference.' }, { status: 400 })
    }

    const config = getMonnifyConfig()
    if (!config) {
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
    // just return the current state, don't re-verify with Monnify again.
    if (order.status === 'paid') {
      return NextResponse.json({ paid: true, order })
    }

    const verifyRes = await monnifyRequest<MonnifyTransactionStatus>(
      config,
      `/api/v2/merchant/transactions/query?paymentReference=${encodeURIComponent(reference.trim())}`
    )

    if (!verifyRes.requestSuccessful) {
      return NextResponse.json({ paid: false, error: verifyRes.responseMessage || 'Could not verify payment.' })
    }

    const expectedAmount = Number(order.amount_total)
    const isSuccessful =
      verifyRes.responseBody?.paymentStatus === 'PAID' && amountsMatch(Number(verifyRes.responseBody.amountPaid), expectedAmount)

    if (!isSuccessful) {
      if (order.status === 'pending_payment') {
        await supabase.from('orders').update({ status: 'payment_failed' }).eq('id', order.id)
      }
      return NextResponse.json({ paid: false, error: 'Payment was not successful.' })
    }

    if (order.status === 'pending_payment') {
      await supabase
        .from('orders')
        .update({ status: 'paid', monnify_transaction_reference: verifyRes.responseBody.transactionReference })
        .eq('id', order.id)
    }

    return NextResponse.json({ paid: true, order: { ...order, status: 'paid' } })
  } catch (err) {
    console.error('[monnify-verify] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
