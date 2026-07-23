'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell } from '@/components/AdminShell'
import { Check, X } from 'lucide-react'

interface Buyer {
  id: string
  full_name: string
  phone_number: string
  location: string
  buyer_type: string
  products_interested: string | null
  status: 'pending' | 'verified' | 'rejected' | 'inactive'
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-turmeric/15 text-turmeric',
  verified: 'bg-okra/15 text-okra',
  rejected: 'bg-pepper/15 text-pepper',
  inactive: 'bg-soil/10 text-soil/50',
}

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('buyers').select('*').order('created_at', { ascending: false })
    setBuyers(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: Buyer['status']) {
    const supabase = createClient()
    await supabase.from('buyers').update({ status }).eq('id', id)
    setBuyers((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  const filtered = filter === 'all' ? buyers : buyers.filter((b) => b.status === filter)

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-body text-soil text-2xl font-semibold">Buyers</h1>
        <div className="flex gap-1.5">
          {['all', 'pending', 'verified', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[12px] px-3 py-1.5 rounded-full capitalize transition-colors ${
                filter === s ? 'bg-soil text-grain' : 'bg-grain text-soil/60 hover:text-soil'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-soil/50 text-[14px]">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-soil/50 text-[14px]">No buyers here yet.</p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((b) => (
            <div key={b.id} className="bg-grain rounded-xl p-5 border border-soil/8">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-soil font-medium text-[15px]">{b.full_name}</p>
                  <p className="text-soil/50 text-[13px]">{b.phone_number} · {b.location}</p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <div className="text-[13.5px] text-soil/70 mb-3 capitalize">
                <span className="font-medium">{b.buyer_type}</span>
                {b.products_interested && <span className="text-soil/50"> · interested in {b.products_interested}</span>}
              </div>
              {b.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(b.id, 'verified')}
                    className="flex items-center gap-1.5 text-[12px] bg-okra/10 text-okra px-3 py-1.5 rounded-lg hover:bg-okra/20 transition-colors">
                    <Check size={12} /> Verify
                  </button>
                  <button onClick={() => updateStatus(b.id, 'rejected')}
                    className="flex items-center gap-1.5 text-[12px] bg-pepper/10 text-pepper px-3 py-1.5 rounded-lg hover:bg-pepper/20 transition-colors">
                    <X size={12} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
