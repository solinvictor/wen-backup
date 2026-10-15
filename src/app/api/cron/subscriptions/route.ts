import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMonnifyConfig, monnifyRequest, type MonnifyChargeCardTokenResponse } from '@/lib/monnify'

/**
 * Runs daily (see vercel.json). Finds every active subscription whose
 * next_delivery_date has arrived, creates a real order for it, and
 * charges the buyer's saved, reusable Monnify card token directly —
 * no checkout page, no redirect, this is a true background charge.
 *
 * The actual order gets marked 'paid' by the SAME webhook that handles
 * normal checkouts, once Monnify's success event for this reference
 * comes back — this route only creates the pending_payment order and
 * fires the charge request; it does not mark anything paid itself, to
 * keep exactly one source of truth for "is this order paid".
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const config = getMonnifyConfig()
  if (!config) {
    console.error('[cron/subscriptions] Monnify env vars are not fully set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: due, error: dueError } = await supabase
    .from('subscriptions')
    .select('id, buyer_id, product_id, quantity, frequency_days, monnify_card_token, monnify_email, buyers(full_name), products(name, price, is_available)')
    .eq('status', 'active')
    .lte('next_delivery_date', today)

  if (dueError) {
    console.error('[cron/subscriptions] failed to load due subscriptions:', dueError.message)
    return NextResponse.json({ error: 'Failed to load subscriptions' }, { status: 500 })
  }

  const results: { subscriptionId: string; outcome: string }[] = []

  for (const sub of due ?? []) {
    const productRow = Array.isArray(sub.products) ? sub.products[0] : sub.products
    const buyerRow = Array.isArray(sub.buyers) ? sub.buyers[0] : sub.buyers

    if (!sub.monnify_card_token || !sub.monnify_email) {
      await supabase.from('subscriptions').update({ status: 'payment_issue' }).eq('id', sub.id)
      results.push({ subscriptionId: sub.id, outcome: 'missing_card_token' })
      continue
    }
    if (!productRow || productRow.is_available === false || productRow.price == null) {
      // Skip this cycle rather than charge for something we can't deliver.
      // Still advance next_delivery_date so it doesn't fire again tomorrow.
      const next = new Date()
      next.setDate(next.getDate() + sub.frequency_days)
      await supabase.from('subscriptions')
        .update({ next_delivery_date: next.toISOString().slice(0, 10) })
        .eq('id', sub.id)
      results.push({ subscriptionId: sub.id, outcome: 'product_unavailable_skipped' })
      continue
    }

    const amount = Number(productRow.price) * sub.quantity
    const orderRef = `WEN-SUB-${sub.id}-${Date.now().toString(36).toUpperCase()}`

    // Create the order first, as pending_payment — same invariant as every
    // other order in the system: it only becomes 'paid' via the webhook.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: sub.buyer_id,
        product_summary: `${sub.quantity} × ${productRow.name} (subscription)`,
        status: 'pending_payment',
        amount_total: amount,
        order_ref: orderRef,
        subscription_id: sub.id,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('[cron/subscriptions] order creation failed for', sub.id, orderError?.message)
      results.push({ subscriptionId: sub.id, outcome: 'order_creation_failed' })
      continue
    }

    const chargeRes = await monnifyRequest<MonnifyChargeCardTokenResponse>(config, '/api/v1/merchant/cards/charge-card-token', {
      method: 'POST',
      body: {
        cardToken: sub.monnify_card_token,
        customerEmail: sub.monnify_email,
        customerName: buyerRow?.full_name || 'WEN buyer',
        amount,
        currencyCode: 'NGN',
        paymentReference: orderRef,
        paymentDescription: `WEN Foods subscription charge ${orderRef}`,
        contractCode: config.contractCode,
        apiKey: config.apiKey,
      },
    })

    if (!chargeRes.requestSuccessful) {
      console.error('[cron/subscriptions] charge-card-token failed for', sub.id, chargeRes.responseMessage)
      await supabase.from('orders').update({ status: 'payment_failed' }).eq('id', order.id)
      await supabase.from('subscriptions').update({ status: 'payment_issue', last_order_id: order.id }).eq('id', sub.id)
      results.push({ subscriptionId: sub.id, outcome: 'charge_failed' })
      continue
    }

    // Charge accepted — webhook will confirm/mark the order paid.
    // Advance next_delivery_date now so this subscription isn't picked up
    // again before the webhook has a chance to land.
    const next = new Date()
    next.setDate(next.getDate() + sub.frequency_days)
    await supabase
      .from('subscriptions')
      .update({ next_delivery_date: next.toISOString().slice(0, 10), last_order_id: order.id })
      .eq('id', sub.id)

    results.push({ subscriptionId: sub.id, outcome: 'charge_initiated' })
  }

  return NextResponse.json({ processed: results.length, results })
}
