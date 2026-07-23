'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell } from '@/components/AdminShell'

interface Order {
  id: string
  product_summary: string
  status: 'pending' | 'matched' | 'in_progress' | 'delivered' | 'cancelled'
  notes: string | null
  created_at: string
  delivered_by: string | null
  delivered_at: string | null
  buyer: { full_name: string; phone_number: string } | null
  farmer: { full_name: string } | null
}

const STATUS_OPTIONS: Order['status'][] = ['pending', 'matched', 'in_progress', 'delivered', 'cancelled']

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-turmeric/15 text-turmeric',
  matched: 'bg-[#5AA8FF]/15 text-[#3D7DCC]',
  in_progress: 'bg-okra/15 text-okra',
  delivered: 'bg-soil/10 text-soil/60',
  cancelled: 'bg-pepper/15 text-pepper',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, delivered_by, delivered_at, buyer:buyers(full_name, phone_number), farmer:farmers(full_name)')
      .order('created_at', { ascending: false })
    setOrders((data as any) || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: Order['status']) {
    const supabase = createClient()
    const updates: Partial<Order> = { status }
    // Auto-stamp the delivery time the moment it's marked delivered —
    // "delivered_by" is filled in separately since it's manual MVP delivery.
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString()
    }
    await supabase.from('orders').update(updates).eq('id', id)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }

  async function updateDeliveredBy(id: string, deliveredBy: string) {
    const supabase = createClient()
    await supabase.from('orders').update({ delivered_by: deliveredBy }).eq('id', id)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, delivered_by: deliveredBy } : o)))
  }

  return (
    <AdminShell>
      <h1 className="font-body text-soil text-2xl font-semibold mb-6">Orders</h1>

      {loading ? (
        <p className="text-soil/50 text-[14px]">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-soil/50 text-[14px]">No orders yet. Orders will appear here once buyers start requesting produce.</p>
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => (
            <div key={o.id} className="bg-grain rounded-xl p-5 border border-soil/8">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-soil font-medium text-[15px]">{o.product_summary}</p>
                  <p className="text-soil/50 text-[13px]">
                    {o.buyer?.full_name || 'Unknown buyer'}
                    {o.farmer?.full_name && <span> → {o.farmer.full_name}</span>}
                  </p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value as Order['status'])}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize border-0 outline-none cursor-pointer ${STATUS_STYLES[o.status]}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="text-soil bg-white">{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              {o.notes && <p className="text-[13px] text-soil/60 mb-3">{o.notes}</p>}

              {(o.status === 'in_progress' || o.status === 'delivered') && (
                <div className="flex items-center gap-2.5 mt-1 pt-3 border-t border-soil/8">
                  <label className="text-[11.5px] text-soil/50 font-medium shrink-0">Delivered by</label>
                  <input
                    defaultValue={o.delivered_by || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (o.delivered_by || '')) {
                        updateDeliveredBy(o.id, e.target.value)
                      }
                    }}
                    placeholder="e.g. Musa (WEN staff)"
                    className="flex-1 text-[13px] border border-soil/15 rounded-md px-2.5 py-1.5 outline-none focus:border-pepper transition-colors bg-white"
                  />
                  {o.delivered_at && (
                    <span className="font-data text-[10.5px] text-soil/40 shrink-0 whitespace-nowrap">
                      {new Date(o.delivered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}

