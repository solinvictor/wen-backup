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

  return (
    <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="font-display text-3xl font-bold text-soil mb-10">
        WEN
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="font-body text-soil text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-stone/60 text-[14px] mb-8">Log in to track your orders and reorder easily.</p>

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
