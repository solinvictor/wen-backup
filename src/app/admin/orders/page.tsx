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
  status: 'pending_payment' | 'payment_failed' | 'paid' | 'pending' | 'matched' | 'in_progress' | 'delivered' | 'cancelled'
  amount_total: number | null
  notes: string | null
  created_at: string
  delivered_at: string | null
  rider_id: string | null
  rider?: { email: string } | null
  buyer: { full_name: string; phone_number: string } | null
}

// Delivery-lifecycle statuses only — payment state is shown and reasoned
// about separately below, never toggled by hand here (Paystack's webhook
// is the only thing allowed to mark an order paid).
const STATUS_OPTIONS: Order['status'][] = ['pending', 'matched', 'in_progress', 'delivered', 'cancelled']

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-turmeric/15 text-turmeric',
  matched:     'bg-[#5AA8FF]/15 text-[#3D7DCC]',
  in_progress: 'bg-okra/15 text-okra',
  delivered:   'bg-soil/10 text-soil/60',
  cancelled:   'bg-pepper/15 text-pepper',
}

const PAYMENT_STYLES: Record<string, string> = {
  pending_payment: 'bg-turmeric/15 text-turmeric',
  paid:            'bg-okra/15 text-okra',
  payment_failed:  'bg-pepper/15 text-pepper',
}

const PAYMENT_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  paid:            'Paid',
  payment_failed:  'Payment failed',
}

function fmtNaira(n: number | null) {
  if (n == null) return '—'
  return '₦' + n.toLocaleString('en-NG')
}

function paymentState(status: Order['status']): 'pending_payment' | 'paid' | 'payment_failed' {
  if (status === 'paid' || status === 'pending_payment' || status === 'payment_failed') return status
  // Any delivery-lifecycle status (pending/matched/in_progress/delivered/
  // cancelled) implies payment already cleared, for orders created before
  // this payment flow existed.
  return 'paid'
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
        .select('id, product_summary, status, amount_total, notes, created_at, delivered_at, rider_id, buyer:buyers(full_name, phone_number)')
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
    const order = orders.find((o) => o.id === id)
    if (order && paymentState(order.status) !== 'paid') {
      // Never let an order move into the delivery pipeline until Paystack's
      // webhook has actually confirmed the charge went through.
      alert('This order hasn\u2019t been paid for yet — it can\u2019t be dispatched until payment is confirmed.')
      return
    }
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
      <h1 className="font-body text-soil text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Orders</h1>

      {loading ? (
        <p className="text-soil/50 text-[14px]">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-soil/50 text-[14px]">No orders yet.</p>
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => (
            <div key={o.id} className="bg-white sm:bg-grain rounded-xl p-4 sm:p-5 border border-soil/8 overflow-hidden">
              <div className="flex flex-col gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STYLES[paymentState(o.status)]}`}>
                      {PAYMENT_LABELS[paymentState(o.status)]}
                    </span>
                    <span className="font-data text-[12px] text-soil/50">{fmtNaira(o.amount_total)}</span>
                  </div>
                  <p className="text-soil font-medium text-[14px] sm:text-[15px] leading-snug break-words">
                    {o.product_summary}
                  </p>
                  <p className="text-soil/50 text-[12px] sm:text-[13px] mt-0.5">
                    {o.buyer?.full_name || 'Unknown buyer'}
                    {o.buyer?.phone_number ? (
                      <a href={`tel:${o.buyer.phone_number}`} className="text-pepper ml-1.5">
                        {o.buyer.phone_number}
                      </a>
                    ) : null}
                  </p>
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
                  {STATUS_OPTIONS.map((s) => {
                    const disabled = paymentState(o.status) !== 'paid'
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={disabled}
                        onClick={() => updateStatus(o.id, s)}
                        title={disabled ? 'Awaiting payment confirmation' : undefined}
                        className={`shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full capitalize transition-opacity ${
                          disabled
                            ? 'bg-soil/5 text-soil/25 cursor-not-allowed'
                            : o.status === s ? STATUS_STYLES[s] : 'bg-soil/5 text-soil/40'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    )
                  })}
                </div>
              </div>

              {o.notes && <p className="text-[13px] text-soil/60 mb-3">{o.notes}</p>}

              {/* Rider assignment — only for paid orders past the initial 'pending' delivery stage */}
              {paymentState(o.status) === 'paid' && o.status !== 'cancelled' && o.status !== 'pending' && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 pt-3 border-t border-soil/8">
                  <div className="flex items-center gap-2 shrink-0">
                    <Bike size={13} className="text-soil/30 shrink-0" />
                    <label className="text-[11.5px] text-soil/50 font-medium">Assign rider</label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => assignRider(o.id, null)}
                      className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                        !o.rider_id
                          ? 'border-pepper/40 bg-pepper/10 text-pepper'
                          : 'border-soil/10 text-soil/45 hover:border-soil/25'
                      }`}
                    >
                      Unassigned
                    </button>
                    {riders.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => assignRider(o.id, r.id)}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-colors truncate max-w-[9rem] ${
                          o.rider_id === r.id
                            ? 'border-pepper/40 bg-pepper/10 text-pepper'
                            : 'border-soil/10 text-soil/60 hover:border-soil/25'
                        }`}
                        title={r.email}
                      >
                        {r.email.split('@')[0]}
                      </button>
                    ))}
                  </div>
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
