import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Paystack calls this after every transaction event. We only act on
 * charge.success, and only after verifying the request genuinely came
 * from Paystack via the X-Paystack-Signature header — never trust the
 * body alone, since anyone could POST a fake "success" otherwise.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    console.error('[paystack-webhook] PAYSTACK_SECRET_KEY is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  const expectedSignature = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex')

  if (
    !signature ||
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    console.error('[paystack-webhook] signature mismatch — rejecting')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string; status?: string; amount?: number } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Always 200 back to Paystack once the signature is valid, even for
  // events we don't act on — they retry on non-2xx responses.
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (!reference) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, amount_total')
    .eq('order_ref', reference)
    .single()

  if (fetchError || !order) {
    console.error('[paystack-webhook] no matching order for reference:', reference)
    return NextResponse.json({ received: true })
  }

  // Idempotency: Paystack can send the same event more than once.
  if (order.status === 'paid') {
    return NextResponse.json({ received: true })
  }

  // Sanity check: the amount actually charged (in kobo) must match what we
  // expected to charge, so a stale/mismatched webhook can't mark an order
  // paid for the wrong amount.
  const expectedKobo = Math.round(Number(order.amount_total) * 100)
  if (event.data?.amount !== expectedKobo) {
    console.error(
      '[paystack-webhook] amount mismatch for', reference,
      'expected', expectedKobo, 'got', event.data?.amount
    )
    await supabase.from('orders').update({ status: 'payment_failed' }).eq('id', order.id)
    return NextResponse.json({ received: true })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'paid', paystack_reference: reference })
    .eq('id', order.id)

  if (updateError) {
    console.error('[paystack-webhook] failed to mark order paid:', updateError.message)
  }

  return NextResponse.json({ received: true })
}
