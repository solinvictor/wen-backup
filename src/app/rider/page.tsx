import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { MapPin, Package, Clock } from 'lucide-react'
import RiderLogout from './RiderLogout'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  matched: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  matched: 'Ready',
  in_progress: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default async function RiderHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: orders } = await adminClient
    .from('orders')
    .select(
      `
      id, order_ref, product_summary, status,
      delivery_type, created_at, delivered_at,
      buyers ( full_name, location, landmark, phone_number )
    `
    )
    .eq('rider_id', user!.id)
    .in('status', ['matched', 'in_progress', 'delivered'])
    .order('created_at', { ascending: true })

  const all = orders || []
  const active = all.filter((o) => o.status === 'matched' || o.status === 'in_progress')
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const doneToday = all.filter((o) => {
    if (o.status !== 'delivered') return false
    const t = o.delivered_at ? new Date(o.delivered_at) : new Date(o.created_at)
    return t >= startOfDay
  })

  function OrderCard({ o }: { o: (typeof all)[0] }) {
    const buyer = Array.isArray(o.buyers) ? o.buyers[0] : o.buyers
    return (
      <Link
        href={`/rider/${o.id}`}
        className="block bg-white rounded-2xl border border-soil/8 hover:border-pepper/30 hover:shadow-md transition-all overflow-hidden"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-body text-soil font-semibold text-[15px] line-clamp-2">
                {o.product_summary}
              </p>
              {buyer && (
                <p className="text-soil/50 text-[13px] mt-0.5">{buyer.full_name}</p>
              )}
            </div>
            <span
              className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || ''}`}
            >
              {STATUS_LABELS[o.status] || o.status}
            </span>
          </div>

          <div className="space-y-1.5">
            {buyer && 'landmark' in (buyer as object) && (buyer as { landmark?: string | null }).landmark && (
              <div className="flex items-center gap-2 text-[13px] text-pepper font-medium">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">
                  {(buyer as { landmark: string }).landmark}
                </span>
              </div>
            )}
            {buyer?.location && (
              <div className="flex items-center gap-2 text-[13px] text-soil/55">
                <MapPin size={12} className="text-stone/40 shrink-0" />
                <span className="truncate">{buyer.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[12px] text-soil/40">
              <Clock size={11} className="shrink-0" />
              <span>
                {new Date(o.created_at).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {o.delivery_type === 'express' && (
                <span className="ml-1 text-pepper font-semibold">· Express</span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-grain-dim px-4 py-2.5 flex items-center justify-between">
          <span className="text-[12px] text-soil/40">{o.order_ref || 'No ref'}</span>
          <span className="text-[12px] font-semibold text-pepper">Open →</span>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-grain-dim">
      <header className="bg-white border-b border-soil/8 sticky top-0 z-40 px-5 h-14 flex items-center justify-between">
        <span className="font-body text-soil text-[17px] font-semibold">WEN Rider</span>
        <div className="flex items-center gap-3">
          <span className="font-data text-[11px] text-stone/40 uppercase tracking-wider">
            {active.length} active
          </span>
          <RiderLogout />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        <section>
          <p className="text-[12px] text-soil/40 font-medium mb-3">
            Active · {active.length}
          </p>
          {active.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-2xl border border-soil/8">
              <Package size={36} className="text-soil/15 mx-auto mb-3" />
              <p className="font-body text-soil text-[15px] font-medium mb-1">No active orders</p>
              <p className="text-soil/50 text-[13px] px-6">
                Assigned jobs will show here. Pull to refresh after admin assigns you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="text-[12px] text-soil/40 font-medium mb-3">
            Done today · {doneToday.length}
          </p>
          {doneToday.length === 0 ? (
            <p className="text-[13px] text-soil/40 px-1">No deliveries marked done yet today.</p>
          ) : (
            <div className="space-y-3 opacity-90">
              {doneToday.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
