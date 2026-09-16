import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMonnifyConfig, monnifyRequest, type MonnifyInitTransactionResponse } from '@/lib/monnify'

/**
 * Starts a Monnify checkout for either:
 *  - a one-time order (orderRef) — the original flow
 *  - a subscription's first, tokenizing payment (subscriptionId) — the
 *    reusable card token captured from THIS charge is what the daily
 *    cron uses to charge future deliveries automatically
 *
 * Never trusts anything the client sends beyond which record to charge for
 * — amount and email are always re-read from the database.
 *
 * Body: { orderRef: string } OR { subscriptionId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderRef?: string; subscriptionId?: string }
    const { orderRef, subscriptionId } = body

    if (!orderRef?.trim() && !subscriptionId?.trim()) {
      return NextResponse.json({ error: 'Missing order or subscription reference.' }, { status: 400 })
    }

    const config = getMonnifyConfig()
    if (!config) {
      console.error('[monnify-initialize] Monnify env vars are not fully set')
      return NextResponse.json({ error: 'Payments are not configured yet. Please try again later.' }, { status: 500 })
    }

    const supabase = createAdminClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`

    let email: string
    let customerName: string
    let amount: number
    let reference: string
    let callbackPath: string
    let paymentMethods: string[]

    if (orderRef?.trim()) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, status, amount_total, buyer_id, buyers(email, full_name)')
        .eq('order_ref', orderRef.trim())
        .single()

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
      }
      if (order.status !== 'pending_payment') {
        return NextResponse.json({ error: 'This order has already been paid or is no longer payable.' }, { status: 409 })
      }
      if (!order.amount_total || order.amount_total <= 0) {
        return NextResponse.json({ error: 'This order has no payable amount.' }, { status: 400 })
      }

      const buyerRow = Array.isArray(order.buyers) ? order.buyers[0] : order.buyers
      if (!buyerRow?.email) {
        return NextResponse.json({ error: 'Could not find an email for this order.' }, { status: 400 })
      }

      email = buyerRow.email
      customerName = buyerRow.full_name || 'WEN buyer'
      amount = Number(order.amount_total)
      reference = orderRef.trim()
      callbackPath = '/checkout/callback'
      paymentMethods = ['CARD', 'ACCOUNT_TRANSFER']
    } else {
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('id, status, quantity, product_id, monnify_email, buyers(full_name), products(price)')
        .eq('id', subscriptionId!.trim())
        .single()

      if (subError || !sub) {
        return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 })
      }
      if (sub.status !== 'pending_first_payment') {
        return NextResponse.json({ error: 'This subscription has already been activated.' }, { status: 409 })
      }
      if (!sub.monnify_email) {
        return NextResponse.json({ error: 'Missing email for this subscription.' }, { status: 400 })
      }

      const productRow = Array.isArray(sub.products) ? sub.products[0] : sub.products
      const price = productRow?.price
      if (price == null) {
        return NextResponse.json({ error: 'This product no longer has a price set.' }, { status: 400 })
      }

      const buyerRow = Array.isArray(sub.buyers) ? sub.buyers[0] : sub.buyers

      email = sub.monnify_email
      customerName = buyerRow?.full_name || 'WEN buyer'
      amount = Number(price) * sub.quantity
      reference = `WEN-SUBSETUP-${sub.id}-${Date.now().toString(36).toUpperCase()}`
      callbackPath = '/subscribe/callback'
      // Only CARD can be tokenized for the recurring charges that follow —
      // account transfer / USSD have nothing to reuse next cycle.
      paymentMethods = ['CARD']

      // The webhook can't rely on Monnify echoing back custom metadata, so
      // it looks the subscription up by this reference directly instead.
      const { error: refError } = await supabase
        .from('subscriptions')
        .update({ setup_payment_reference: reference })
        .eq('id', sub.id)
      if (refError) {
        console.error('[monnify-initialize] failed to store setup_payment_reference:', refError.message)
        return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 500 })
      }
    }

    const initRes = await monnifyRequest<MonnifyInitTransactionResponse>(config, '/api/v1/merchant/transactions/init-transaction', {
      method: 'POST',
      body: {
        amount,
        customerName,
        customerEmail: email,
        paymentReference: reference,
        paymentDescription: `WEN payment ${reference}`,
        currencyCode: 'NGN',
        contractCode: config.contractCode,
        redirectUrl: `${siteUrl}${callbackPath}`,
        paymentMethods,
      },
    })

    if (!initRes.requestSuccessful || !initRes.responseBody?.checkoutUrl) {
      console.error('[monnify-initialize] Monnify rejected the request:', initRes.responseMessage)
      return NextResponse.json({ error: initRes.responseMessage || 'Could not start payment. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({
      checkoutUrl: initRes.responseBody.checkoutUrl,
      transactionReference: initRes.responseBody.transactionReference,
      reference: initRes.responseBody.paymentReference,
    })
  } catch (err) {
    console.error('[monnify-initialize] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
