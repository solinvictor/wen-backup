'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function ResetPasswordPage() {
  const router = useRouter()

  // The /auth/callback route exchanges the email link's code for a session
  // before redirecting here, so by the time this page loads the user should
  // already be signed in. If not (link expired, opened on a different
  // device/browser, etc.), there's no valid session to update a password on.
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession]           = useState(false)

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
      setCheckingSession(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords don’t match.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message || 'Could not update password. Try the reset link again.')
      return
    }
    setDone(true)
    setTimeout(() => {
      router.push('/store')
      router.refresh()
    }, 1500)
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-grain-dim flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-stone/40" />
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
        <Logo height={40} className="mb-10" />
        <div className="w-full max-w-sm text-center">
          <h1 className="font-body text-soil text-2xl font-bold mb-2">Link expired</h1>
          <p className="text-stone/60 text-[14px] mb-8">
            This password reset link is invalid or has expired. Request a new one to continue.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all"
          >
            Request a new link
          </a>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
        <Logo height={40} className="mb-10" />
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-pepper/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={24} className="text-pepper" />
          </div>
          <h1 className="font-body text-soil text-2xl font-bold mb-2">Password updated</h1>
          <p className="text-stone/60 text-[14px]">Taking you to the store…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grain-dim flex flex-col items-center justify-center px-5 py-12">
      <Logo height={40} className="mb-10" />

      <div className="w-full max-w-sm">
        <h1 className="font-body text-soil text-2xl font-bold mb-1">Set a new password</h1>
        <p className="text-stone/60 text-[14px] mb-8">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-soil/70 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          <div>
            <label className="block text-[13px] font-medium text-soil/70 mb-1.5">Confirm new password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
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
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
