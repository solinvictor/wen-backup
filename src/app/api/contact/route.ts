import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, message } = body

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Please fill in your name and message.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      message: message.trim(),
    })

    if (error) {
      console.error('[contact] insert failed:', error.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
