'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell } from '@/components/AdminShell'
import { Bike } from 'lucide-react'

interface Rider {
  id: string
  email: string
}

interface Order {
  id: string
  product_summary: string
  status: 'pending' | 'matched' | 'in_progress' | 'delivered' | 'cancelled'
  notes: string | null
  created_at: string
  delivered_at: string | null
  rider_id: string | null
  rider?: { full_name: string } | null
  buyer: { full_name: string; phone_number: string } | null
  farmer: { full_name: string } | null
}

const STATUS_OPTIONS: Order['status'][] = ['pending', 'matched', 'in_progress', 'delivered', 'cancelled']

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-turmeric/15 text-turmeric',
  matched:     'bg-[#5AA8FF]/15 text-[#3D7DCC]',
  in_progress: 'bg-okra/15 text-okra',
  delivered:   'bg-soil/10 text-soil/60',
  cancelled:   'bg-pepper/15 text-pepper',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()

    const [{ data: ordersData }, { data: ridersData }] = await Promise.all([
      supabase
        .from('orders')
        .select('*, delivered_at, rider_id, buyer:buyers(full_name, phone_number), farmer:farmers(full_name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'rider')
        .order('email'),
    ])

    setOrders((ordersData as any) || [])
    setRiders(ridersData || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: Order['status']) {
    const supabase = createClient()
    const updates: any = { status }
    if (status === 'delivered') updates.delivered_at = new Date().toISOString()
    await supabase.from('orders').update(updates).eq('id', id)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }

  async function assignRider(orderId: string, riderId: string | null) {
    const supabase = createClient()
    await supabase.from('orders').update({ rider_id: riderId || null }).eq('id', orderId)
    const rider = riders.find((r) => r.id === riderId) || null
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, rider_id: riderId, rider: rider ? { email: rider.email } : null }
          : o
      )
    )
  }

  return (
    <AdminShell>
      <h1 className="font-body text-soil text-2xl font-semibold mb-6">Orders</h1>

      {loading ? (
        <p className="text-soil/50 text-[14px]">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-soil/50 text-[14px]">No orders yet.</p>
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

              {/* Rider assignment — show for all non-cancelled, non-pending orders */}
              {o.status !== 'cancelled' && o.status !== 'pending' && (
                <div className="flex items-center gap-2.5 mt-1 pt-3 border-t border-soil/8">
                  <Bike size={13} className="text-soil/30 shrink-0" />
                  <label className="text-[11.5px] text-soil/50 font-medium shrink-0">Assign rider</label>
                  <select
                    value={o.rider_id || ''}
                    onChange={(e) => assignRider(o.id, e.target.value || null)}
                    className="flex-1 text-[13px] border border-soil/15 rounded-md px-2.5 py-1.5 outline-none focus:border-pepper transition-colors bg-white text-soil"
                  >
                    <option value="">— Unassigned —</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>{r.email}</option>
                    ))}
                  </select>
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
