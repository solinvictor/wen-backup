'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const nextPath     = searchParams?.get('next') ?? '/store'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }
    router.push(nextPath)
    router.refresh()
  }

  async function handleGoogleSignIn() {
    setError('')
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })
    if (error) {
      setError('Could not sign in with Google. Please try again.')
      setGoogleLoading(false)
    }
    // On success Supabase redirects the browser away to Google, so there's
    // nothing further to do here — no need to clear googleLoading.
  }

  return (
    <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="font-display text-3xl font-bold text-soil mb-10">
        WEN
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="font-body text-soil text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-stone/60 text-[14px] mb-8">Log in to track your orders and reorder easily.</p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full bg-white border border-soil/12 text-soil text-[15px] font-semibold py-3.5 rounded-2xl hover:bg-soil/[0.03] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/>
            </svg>
          )}
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-soil/10" />
          <span className="text-[12px] text-stone/40 font-medium">or</span>
          <div className="flex-1 h-px bg-soil/10" />
        </div>

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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-soil/70">Password</label>
              <Link href="/forgot-password" className="text-[12px] text-pepper hover:text-pepper-deep transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full bg-white border border-soil/12 rounded-xl px-4 py-3.5 pr-12 text-[15px] text-soil outline-none focus:border-pepper transition-colors placeholder:text-stone/35"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone/40 hover:text-soil transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-[14px] text-stone/60 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-pepper font-semibold hover:text-pepper-deep transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-grain-dim flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-stone/40" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
