'use client'

import { MapPin, Phone, Package, Navigation, ExternalLink, Hash, Clock, Zap } from 'lucide-react'

interface Buyer {
  full_name: string
  phone_number: string
  location: string
}

interface Order {
  id: string
  order_ref: string | null
  product_summary: string
  status: string
  delivery_type: 'standard' | 'express' | null
  delivery_fee: number | null
  notes: string | null
  w3w_address: string | null
  w3w_lat: number | null
  w3w_lng: number | null
  created_at: string
  buyers: Buyer | Buyer[] | null
}

export default function RiderView({ order }: { order: Order }) {
  const buyer = Array.isArray(order.buyers) ? order.buyers[0] : order.buyers
  const hasW3W = !!order.w3w_address
  const hasCoords = order.w3w_lat != null && order.w3w_lng != null

  const w3wLink    = hasW3W    ? `https://what3words.com/${order.w3w_address}` : null
  const googleLink = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.w3w_lat},${order.w3w_lng}`
    : null
  const wazeLink   = hasCoords
    ? `https://waze.com/ul?ll=${order.w3w_lat},${order.w3w_lng}&navigate=yes`
    : null
  const phoneLink  = buyer?.phone_number ? `tel:${buyer.phone_number}` : null

  const date = new Date(order.created_at).toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-grain-dim">

      {/* Header */}
      <header className="bg-soil px-5 pt-12 pb-6">
        <p className="text-white/50 text-[12px] font-semibold uppercase tracking-widest mb-1">Delivery order</p>
        <p className="font-data text-white text-[22px] font-bold tracking-wider">
          {order.order_ref ?? order.id.slice(0, 8).toUpperCase()}
        </p>
        <div className="flex items-center gap-2 mt-3">
          {order.delivery_type === 'express'
            ? <span className="flex items-center gap-1.5 bg-white/15 text-white text-[12px] font-semibold px-3 py-1 rounded-full"><Zap size={11} /> Express · 24h</span>
            : <span className="flex items-center gap-1.5 bg-white/10 text-white/70 text-[12px] font-semibold px-3 py-1 rounded-full"><Clock size={11} /> Standard · 3 days</span>
          }
          <span className="text-white/40 text-[12px]">{date}</span>
        </div>
      </header>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">

        {/* Location card — primary action */}
        <div className="bg-white rounded-2xl border border-soil/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-soil/8 flex items-center gap-2.5">
            <MapPin size={16} className="text-pepper" />
            <h2 className="font-display text-soil font-semibold text-[15px]">Delivery location</h2>
          </div>
          <div className="px-5 py-4 space-y-4">

            {/* what3words block */}
            {hasW3W ? (
              <div className="bg-pepper/6 border border-pepper/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Hash size={13} className="text-pepper shrink-0" />
                  <p className="text-[12px] font-semibold text-pepper-deep uppercase tracking-wider">what3words</p>
                </div>
                <p className="font-data text-soil text-[18px] font-bold">///{order.w3w_address}</p>
                <p className="text-[12px] text-stone/50 mt-1">Precise 3m delivery pin</p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-[13px] text-amber-700 font-medium">No what3words address — use the text address below.</p>
              </div>
            )}

            {/* Text address */}
            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="text-stone/40 mt-0.5 shrink-0" />
              <p className="text-[14px] text-soil leading-snug">{buyer?.location ?? 'No address provided'}</p>
            </div>

            {/* Navigation buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {w3wLink && (
                <a href={w3wLink} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 bg-soil text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-soil/90 transition-colors">
                  <Hash size={14} />
                  Open W3W
                </a>
              )}
              {googleLink && (
                <a href={googleLink} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 bg-pepper text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-pepper-deep transition-colors">
                  <Navigation size={14} />
                  Google Maps
                </a>
              )}
              {wazeLink && (
                <a href={wazeLink} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 bg-grain-dim border border-soil/12 text-soil text-[13px] font-semibold py-3 rounded-xl hover:border-soil/25 transition-colors col-span-2">
                  <ExternalLink size={14} />
                  Open in Waze
                </a>
              )}
              {!hasW3W && !hasCoords && (
                <div className="col-span-2 text-center text-[12px] text-stone/40 py-2">
                  No coordinates available — navigate via text address
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buyer contact */}
        <div className="bg-white rounded-2xl border border-soil/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-soil/8 flex items-center gap-2.5">
            <Phone size={16} className="text-pepper" />
            <h2 className="font-display text-soil font-semibold text-[15px]">Buyer contact</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="text-[12px] text-stone/45 mb-0.5">Name</p>
              <p className="text-[15px] font-semibold text-soil">{buyer?.full_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-[12px] text-stone/45 mb-0.5">Phone</p>
              <p className="font-data text-[15px] font-bold text-soil">{buyer?.phone_number ?? '—'}</p>
            </div>
            {phoneLink && (
              <a href={phoneLink}
                 className="w-full flex items-center justify-center gap-2 bg-soil text-white text-[14px] font-semibold py-3.5 rounded-2xl hover:bg-soil/90 transition-colors mt-1">
                <Phone size={15} />
                Call buyer
              </a>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-soil/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-soil/8 flex items-center gap-2.5">
            <Package size={16} className="text-pepper" />
            <h2 className="font-display text-soil font-semibold text-[15px]">Items to deliver</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-[14px] text-soil leading-relaxed">{order.product_summary}</p>
            {order.notes && (
              <div className="mt-3 bg-grain-dim rounded-xl px-4 py-3">
                <p className="text-[11px] text-stone/45 font-semibold uppercase tracking-wider mb-1">Buyer notes</p>
                <p className="text-[13px] text-soil/75">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery fee */}
        {order.delivery_fee != null && (
          <div className="bg-white rounded-2xl border border-soil/10 px-5 py-4 flex items-center justify-between">
            <p className="text-[14px] text-soil/70 font-medium">Collection on delivery</p>
            <p className="font-data text-soil text-[18px] font-bold">
              ₦{order.delivery_fee.toLocaleString('en-NG')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
