'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  MapPin, Phone, Package, Clock, CheckCircle2,
  Navigation, Loader2, ExternalLink, Hash, ChevronRight
} from 'lucide-react'

interface Buyer {
  full_name: string
  phone_number: string
  location: string
}

interface Order {
  id: string
  order_ref: string | null
  product_summary: string
  delivery_type: string | null
  delivery_fee: number | null
  status: string
  notes: string | null
  created_at: string
  w3w_address: string | null
  w3w_lat: number | null
  w3w_lng: number | null
  buyers: Buyer | Buyer[] | null
}

const STATUS_FLOW = ['pending', 'matched', 'in_progress', 'delivered'] as const
type OrderStatus = typeof STATUS_FLOW[number]

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  matched: 'Matched',
  in_progress: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  matched: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const NEXT_LABEL: Record<string, string> = {
  matched: 'Mark as Matched',
  in_progress: 'Start Delivery',
  delivered: 'Mark as Delivered',
}

function fmt(n: number | null) {
  if (!n) return '—'
  return '₦' + n.toLocaleString('en-NG')
}

export default function RiderView({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder)
  const [updating, setUpdating] = useState(false)

  const buyer = Array.isArray(order.buyers) ? order.buyers[0] : order.buyers
  const currentIdx = STATUS_FLOW.indexOf(order.status as OrderStatus)
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : null

  const isDelivered = order.status === 'delivered'
  const isCancelled = order.status === 'cancelled'

  const w3wUrl = order.w3w_address ? `https://what3words.com/${order.w3w_address}` : null
  const googleMapsUrl = order.w3w_lat && order.w3w_lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.w3w_lat},${order.w3w_lng}`
    : null

  async function markNextStatus() {
    if (!nextStatus) return
    setUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', order.id)
    if (!error) setOrder({ ...order, status: nextStatus })
    setUpdating(false)
  }

  return (
    <div className="min-h-screen bg-grain-dim">

      {/* Header */}
      <header className="bg-white border-b border-soil/8 sticky top-0 z-40 px-5 h-14 flex items-center justify-between">
        <span className="font-display text-soil text-[17px] font-semibold">WEN Rider</span>
        {order.order_ref && (
          <span className="font-data text-[12px] text-stone/40 font-bold tracking-wider">
            {order.order_ref}
          </span>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span className={`text-[12px] font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-stone/10 text-stone'}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
          <span className="text-[12px] text-stone/40">
            {new Date(order.created_at).toLocaleDateString('en-NG', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>

        {/* Delivery location */}
        <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
            <MapPin size={16} className="text-pepper" />
            <h2 className="font-display text-soil text-[15px] font-semibold">Delivery location</h2>
          </div>
          <div className="px-5 py-4 space-y-4">

            {order.w3w_address ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-pepper/6 border border-pepper/20 rounded-xl px-4 py-3">
                  <Hash size={16} className="text-pepper mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-stone/50 mb-0.5">what3words address</p>
                    <p className="text-[15px] font-bold text-soil font-data">
                      ///{order.w3w_address}
                    </p>
                    <p className="text-[11px] text-stone/40 mt-1">Precise 3m² delivery point</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {w3wUrl && (
                    <a href={w3wUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-pepper text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-pepper-deep transition-colors">
                      <Navigation size={14} /> Open in W3W
                    </a>
                  )}
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-soil text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-soil/85 transition-colors">
                      <ExternalLink size={14} /> Google Maps
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-amber-700">No what3words address — use street address below</p>
              </div>
            )}

            {buyer && (
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-stone/40 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-stone/40 mb-0.5">Street address</p>
                  <p className="text-[14px] text-soil">{buyer.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buyer */}
        {buyer && (
          <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
              <Phone size={16} className="text-pepper" />
              <h2 className="font-display text-soil text-[15px] font-semibold">Buyer</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <p className="text-[11px] text-stone/40 mb-0.5">Name</p>
                <p className="text-[15px] font-semibold text-soil">{buyer.full_name}</p>
              </div>
              <a href={`tel:${buyer.phone_number}`}
                className="flex items-center justify-between w-full bg-soil text-white rounded-xl px-4 py-3 hover:bg-soil/85 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Phone size={15} />
                  <span className="text-[14px] font-semibold">{buyer.phone_number}</span>
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </a>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-soil/8">
            <Package size={16} className="text-pepper" />
            <h2 className="font-display text-soil text-[15px] font-semibold">Items</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-[14px] text-soil leading-relaxed">{order.product_summary}</p>
            {order.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-amber-600 font-semibold mb-0.5">Buyer note</p>
                <p className="text-[13px] text-amber-800">{order.notes}</p>
              </div>
            )}
            {order.delivery_type && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-stone/50 flex items-center gap-1.5">
                  <Clock size={12} />
                  {order.delivery_type === 'express' ? 'Express (24hrs)' : 'Standard (3 days)'}
                </span>
                <span className="font-semibold text-soil">{fmt(order.delivery_fee)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        {!isDelivered && !isCancelled && nextStatus && (
          <button onClick={markNextStatus} disabled={updating}
            className="w-full flex items-center justify-center gap-2 bg-pepper text-white text-[15px] font-semibold py-4 rounded-2xl hover:bg-pepper-deep active:scale-[0.98] transition-all disabled:opacity-60">
            {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {updating ? 'Updating…' : NEXT_LABEL[nextStatus]}
          </button>
        )}

        {isDelivered && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
            <CheckCircle2 size={22} className="text-green-500 shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-green-800">Delivered!</p>
              <p className="text-[12px] text-green-600">Order complete.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
