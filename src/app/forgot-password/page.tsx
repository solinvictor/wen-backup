'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
      <Logo height={40} className="mb-10" />
      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center">
            <h1 className="font-body text-soil text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-stone/60 text-[14px] leading-relaxed mb-6">
              If an account exists for <span className="font-semibold text-soil">{email}</span>, we sent a link to reset your password.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep transition-colors"
            >
              Back to login
            </Link>
            <p className="text-[12px] text-stone/40 mt-4">Didn&apos;t get it? Check your spam folder.</p>
          </div>
        ) : (
          <>
            <h1 className="font-body text-soil text-2xl font-bold mb-1">Reset your password</h1>
            <p className="text-stone/60 text-[14px] mb-8">Enter your email and we&apos;ll send you a reset link.</p>
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
            <p className="text-center text-[14px] text-stone/60 mt-6">
              <Link href="/login" className="text-pepper font-semibold hover:text-pepper-deep transition-colors">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
