import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { MapPin, Package, Clock } from 'lucide-react'
import RiderLogout from './RiderLogout'

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700',
  matched:     'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  delivered:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending:     'Pending',
  matched:     'Matched',
  in_progress: 'On the way',
  delivered:   'Delivered',
  cancelled:   'Cancelled',
}

export default async function RiderHomePage() {
  // Get the logged-in rider's ID from session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: orders } = await adminClient
    .from('orders')
    .select(`
      id, order_ref, product_summary, status,
      delivery_type, created_at,
      buyers ( full_name, location )
    `)
    .eq('rider_id', user!.id)
    .in('status', ['matched', 'in_progress'])
    .order('created_at', { ascending: true })

  const activeOrders = orders || []

  return (
    <div className="min-h-screen bg-grain-dim">
      <header className="bg-white border-b border-soil/8 sticky top-0 z-40 px-5 h-14 flex items-center justify-between">
        <span className="font-body text-soil text-[17px] font-semibold">WEN Rider</span>
        <div className="flex items-center gap-3">
          <span className="font-data text-[11px] text-stone/40 uppercase tracking-wider">Active orders</span>
          <RiderLogout />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activeOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-soil/15 mx-auto mb-4" />
            <p className="font-body text-soil text-lg font-medium mb-1">No active orders</p>
            <p className="text-soil/50 text-[14px]">Check back soon — assigned orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] text-soil/40 font-medium mb-4">
              {activeOrders.length} order{activeOrders.length !== 1 ? 's' : ''} assigned to you
            </p>
            {activeOrders.map((o: any) => {
              const buyer = Array.isArray(o.buyers) ? o.buyers[0] : o.buyers
              return (
                <Link
                  key={o.id}
                  href={`/rider/${o.id}`}
                  className="block bg-white rounded-2xl border border-soil/8 hover:border-pepper/30 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-soil font-semibold text-[15px] truncate">{o.product_summary}</p>
                        {buyer && <p className="text-soil/50 text-[13px] mt-0.5">{buyer.full_name}</p>}
                      </div>
                      <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || ''}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {buyer?.location && (
                        <div className="flex items-center gap-2 text-[13px] text-soil/60">
                          <MapPin size={12} className="text-stone/40 shrink-0" />
                          <span className="truncate">{buyer.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[12px] text-soil/40">
                        <Clock size={11} className="shrink-0" />
                        <span>
                          {new Date(o.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {o.delivery_type === 'express' && (
                          <span className="ml-1 text-pepper font-semibold">· Express</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-grain-dim px-5 py-3 flex items-center justify-between">
                    <span className="text-[12px] text-soil/40">{o.order_ref || 'No ref'}</span>
                    <span className="text-[12px] font-semibold text-pepper">View order →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
