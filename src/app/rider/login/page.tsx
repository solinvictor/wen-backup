'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Bike } from 'lucide-react'

export default function RiderLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    // Verify this user is actually a rider
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'rider') {
      await supabase.auth.signOut()
      setError('Access denied. Rider accounts only.')
      setLoading(false)
      return
    }

    router.push('/rider')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-soil flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pepper flex items-center justify-center">
            <Bike size={22} className="text-grain" />
          </div>
          <p className="font-display text-grain text-2xl">WEN Rider</p>
          <p className="text-grain/40 text-[13px]">Sign in to see your deliveries</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-grain rounded-2xl p-7 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-soil mb-1.5">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-soil mb-1.5">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-soil/15 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-pepper transition-colors bg-white"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[13px] text-pepper font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pepper text-grain py-3 rounded-lg text-[14px] font-medium hover:bg-pepper/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
