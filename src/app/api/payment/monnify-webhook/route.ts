import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { amountsMatch, getMonnifyConfig, monnifyRequest, type MonnifyTransactionStatus } from '@/lib/monnify'

interface MonnifyWebhookEvent {
  eventType?: string
  eventData?: {
    paymentReference?: string
    transactionReference?: string
    amountPaid?: number
    paymentStatus?: string
  }
}

// The success event is documented as SUCCESSFUL_COLLECTION, but some
// integrations observe SUCCESSFUL_TRANSACTION for checkout-initiated
// payments — accept either and still gate on paymentStatus === 'PAID'
// below rather than trusting the event name alone.
const SUCCESS_EVENT_TYPES = new Set(['SUCCESSFUL_COLLECTION', 'SUCCESSFUL_TRANSACTION'])

/**
 * Monnify calls this after transaction events. We only act on a successful
 * payment event, and only after verifying the request genuinely came from
 * Monnify via the monnify-signature header — never trust the body alone,
 * since anyone could POST a fake "success" otherwise.
 *
 * Monnify's sandbox does not send this header at all (documented behavior),
 * so it's only enforced when MONNIFY_BASE_URL points at production.
 *
 * Two distinct success shapes land here:
 *  1. A one-time order payment, or a recurring charge the daily cron
 *     triggered -> mark that order paid. Both create a real `orders` row
 *     up front with order_ref === paymentReference, so one lookup covers
 *     either case identically.
 *  2. A subscription's first, tokenizing payment -> activate the
 *     subscription and store the reusable card token. Routed by
 *     subscriptions.setup_payment_reference rather than any custom
 *     metadata, since Monnify does not reliably echo that back.
 */
export async function POST(req: NextRequest) {
  const config = getMonnifyConfig()
  if (!config) {
    console.error('[monnify-webhook] Monnify env vars are not fully set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('monnify-signature')

  if (signature) {
    const expectedSignature = crypto.createHash('sha512').update(config.secretKey + rawBody).digest('hex')
    if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('[monnify-webhook] signature mismatch — rejecting')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else if (!config.baseUrl.includes('sandbox')) {
    // Production always sends the signature — a missing header there is
    // never legitimate. Sandbox omits it entirely, per Monnify's docs.
    console.error('[monnify-webhook] missing signature header — rejecting')
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  let event: MonnifyWebhookEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Always 200 back to Monnify once the signature is valid, even for events
  // we don't act on — they retry on non-2xx responses.
  if (!event.eventType || !SUCCESS_EVENT_TYPES.has(event.eventType) || event.eventData?.paymentStatus !== 'PAID') {
    return NextResponse.json({ received: true })
  }

  const reference = event.eventData?.paymentReference
  if (!reference) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  // ── One-time order, or a recurring charge the cron triggered ─────────
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, amount_total')
    .eq('order_ref', reference)
    .single()

  if (order) {
    // Idempotency: Monnify can send the same event more than once.
    if (order.status === 'paid') {
      return NextResponse.json({ received: true })
    }

    // Sanity check: the amount actually paid must match what we expected to
    // charge, so a stale/mismatched webhook can't mark an order paid for
    // the wrong amount.
    const expectedAmount = Number(order.amount_total)
    if (!amountsMatch(Number(event.eventData?.amountPaid), expectedAmount)) {
      console.error('[monnify-webhook] amount mismatch for', reference, 'expected', expectedAmount, 'got', event.eventData?.amountPaid)
      await supabase.from('orders').update({ status: 'payment_failed' }).eq('id', order.id)
      return NextResponse.json({ received: true })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid', monnify_transaction_reference: event.eventData?.transactionReference ?? reference })
      .eq('id', order.id)

    if (updateError) {
      console.error('[monnify-webhook] failed to mark order paid:', updateError.message)
    }
    return NextResponse.json({ received: true })
  }

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[monnify-webhook] unexpected error looking up order:', fetchError.message)
  }

  // ── Subscription's first, tokenizing payment ──────────────────────────
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, status, frequency_days')
    .eq('setup_payment_reference', reference)
    .single()

  if (!sub || sub.status !== 'pending_first_payment') {
    // Already activated, or doesn't match anything we know — idempotent no-op.
    console.error('[monnify-webhook] no matching order or pending subscription for reference:', reference)
    return NextResponse.json({ received: true })
  }

  // The webhook payload doesn't reliably carry the card token — fetch full
  // transaction details, which do.
  const statusRes = await monnifyRequest<MonnifyTransactionStatus>(
    config,
    `/api/v2/merchant/transactions/query?paymentReference=${encodeURIComponent(reference)}`
  )
  const cardToken = statusRes.responseBody?.cardDetails?.cardToken

  if (!statusRes.requestSuccessful || !cardToken) {
    console.error('[monnify-webhook] subscription first charge did not return a reusable card token:', sub.id)
    await supabase.from('subscriptions').update({ status: 'payment_issue' }).eq('id', sub.id)
    return NextResponse.json({ received: true })
  }

  const nextDelivery = new Date()
  nextDelivery.setDate(nextDelivery.getDate() + sub.frequency_days)

  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      monnify_card_token: cardToken,
      next_delivery_date: nextDelivery.toISOString().slice(0, 10),
    })
    .eq('id', sub.id)

  return NextResponse.json({ received: true })
}
