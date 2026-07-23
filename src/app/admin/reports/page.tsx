'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell } from '@/components/AdminShell'
import { Users, ShoppingCart, ClipboardList, TrendingUp } from 'lucide-react'

interface Stats {
  totalFarmers: number
  verifiedFarmers: number
  totalBuyers: number
  verifiedBuyers: number
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  topProduce: { type: string; count: number }[]
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()

    const [{ data: farmers }, { data: buyers }, { data: orders }] = await Promise.all([
      supabase.from('farmers').select('status, produce_type'),
      supabase.from('buyers').select('status'),
      supabase.from('orders').select('status'),
    ])

    const produceCounts: Record<string, number> = {}
    ;(farmers || []).forEach((f) => {
      const key = f.produce_type.trim()
      produceCounts[key] = (produceCounts[key] || 0) + 1
    })
    const topProduce = Object.entries(produceCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setStats({
      totalFarmers: farmers?.length || 0,
      verifiedFarmers: farmers?.filter((f) => f.status === 'verified').length || 0,
      totalBuyers: buyers?.length || 0,
      verifiedBuyers: buyers?.filter((b) => b.status === 'verified').length || 0,
      totalOrders: orders?.length || 0,
      pendingOrders: orders?.filter((o) => o.status === 'pending').length || 0,
      deliveredOrders: orders?.filter((o) => o.status === 'delivered').length || 0,
      topProduce,
    })
    setLoading(false)
  }

  if (loading || !stats) {
    return (
      <AdminShell>
        <p className="text-soil/50 text-[14px]">Loading...</p>
      </AdminShell>
    )
  }

  const cards = [
    { label: 'Farmers', value: stats.totalFarmers, sub: `${stats.verifiedFarmers} verified`, icon: Users },
    { label: 'Buyers', value: stats.totalBuyers, sub: `${stats.verifiedBuyers} verified`, icon: ShoppingCart },
    { label: 'Orders', value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, icon: ClipboardList },
    { label: 'Delivered', value: stats.deliveredOrders, sub: 'completed orders', icon: TrendingUp },
  ]

  return (
    <AdminShell>
      <h1 className="font-body text-soil text-2xl font-semibold mb-6">Reports</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-grain rounded-xl p-5 border border-soil/8">
            <Icon size={16} className="text-pepper mb-3" />
            <p className="font-body text-soil text-2xl font-bold mb-0.5">{value}</p>
            <p className="text-soil/50 text-[12px]">{label} · {sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-grain rounded-xl p-6 border border-soil/8">
        <h2 className="text-soil font-medium text-[15px] mb-4">Product demand insights</h2>
        {stats.topProduce.length === 0 ? (
          <p className="text-soil/50 text-[13.5px]">No produce data yet.</p>
        ) : (
          <div className="space-y-2.5">
            {stats.topProduce.map((p) => (
              <div key={p.type} className="flex items-center justify-between text-[14px]">
                <span className="text-soil/80">{p.type}</span>
                <span className="font-data text-soil/50">{p.count} farmer{p.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
