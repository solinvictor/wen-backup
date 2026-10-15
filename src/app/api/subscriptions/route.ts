import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Creates a subscription row and starts the first (tokenizing) payment.
 * A subscription only becomes 'active' once that first payment succeeds
 * and the webhook captures a reusable authorization — see
 * /api/payment/paystack-webhook.
 *
 * Body: { productId, quantity, frequencyDays, email, fullName, phoneNumber, location, landmark? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId, quantity, frequencyDays,
      email, fullName, phoneNumber, location, landmark,
    } = body as {
      productId?: string
      quantity?: number
      frequencyDays?: number
      email?: string
      fullName?: string
      phoneNumber?: string
      location?: string
      landmark?: string
    }

    if (!productId || !quantity || quantity <= 0 || !frequencyDays || frequencyDays <= 0) {
      return NextResponse.json({ error: 'Missing or invalid subscription details.' }, { status: 400 })
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email for your subscription.' }, { status: 400 })
    }
    if (!fullName?.trim() || !phoneNumber?.trim() || !location?.trim()) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, is_available')
      .eq('id', productId)
      .single()

    if (productError || !product || product.is_available === false || product.price == null) {
      return NextResponse.json({ error: 'This product is no longer available.' }, { status: 400 })
    }

    // Reuse the buyer record if this email is already signed in, otherwise
    // create a fresh guest buyer row — same pattern as one-time checkout.
    let buyerId: string
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (user) {
      const { data: existingBuyer } = await supabase
        .from('buyers').select('id').eq('user_id', user.id).single()
      if (existingBuyer) {
        buyerId = existingBuyer.id
      } else {
        const { data: newBuyer, error: buyerError } = await supabase
          .from('buyers')
          .insert({
            full_name: fullName.trim(), phone_number: phoneNumber.trim(), email: email.trim(),
            location: location.trim(), buyer_type: 'household', user_id: user.id,
          })
          .select('id').single()
        if (buyerError || !newBuyer) {
          return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 })
        }
        buyerId = newBuyer.id
      }
    } else {
      const { data: newBuyer, error: buyerError } = await supabase
        .from('buyers')
        .insert({
          full_name: fullName.trim(), phone_number: phoneNumber.trim(), email: email.trim(),
          location: location.trim(), buyer_type: 'household',
        })
        .select('id').single()
      if (buyerError || !newBuyer) {
        return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 })
      }
      buyerId = newBuyer.id
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        buyer_id: buyerId,
        product_id: productId,
        quantity,
        frequency_days: frequencyDays,
        status: 'pending_first_payment',
        monnify_email: email.trim(),
      })
      .select('id')
      .single()

    if (subError || !subscription) {
      console.error('[subscriptions] insert failed:', subError?.message)
      return NextResponse.json({ error: 'Could not create subscription.' }, { status: 500 })
    }

    const amount = Number(product.price) * quantity

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      amount,
      email: email.trim(),
    })
  } catch (err) {
    console.error('[subscriptions] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
