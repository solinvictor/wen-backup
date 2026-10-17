'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronLeft, MailCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { validateEmail } from '@/lib/validate'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed) { setError('Enter your email address.'); return }
    const emailErr = validateEmail(trimmed)
    if (emailErr) { setError(emailErr); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)

    // Always show the same success state, whether or not the email exists —
    // don't leak which addresses have accounts.
    if (error) {
      setError('Something went wrong. Please try again.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
        <Logo height={40} className="mb-10" />
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-pepper/10 flex items-center justify-center mx-auto mb-5">
            <MailCheck size={24} className="text-pepper" />
          </div>
          <h1 className="font-body text-soil text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-stone/60 text-[14px] mb-8">
            If an account exists for <span className="font-semibold text-soil">{email.trim()}</span>, we&apos;ve
            sent a link to reset your password. It may take a minute to arrive.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[14px] text-pepper font-semibold hover:text-pepper-deep transition-colors"
          >
            <ChevronLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
      <Logo height={40} className="mb-10" />

      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] text-stone/60 hover:text-soil transition-colors mb-6"
        >
          <ChevronLeft size={15} />
          Back to login
        </Link>

        <h1 className="font-body text-soil text-2xl font-bold mb-1">Forgot your password?</h1>
        <p className="text-stone/60 text-[14px] mb-8">
          Enter the email on your account and we&apos;ll send you a link to reset it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-soil/70 mb-1.5">Email address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-soil/12 rounded-xl px-4 py-3.5 text-[15px] text-soil outline-none focus:border-pepper transition-colors placeholder:text-stone/35"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-[13px] text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  )
}
