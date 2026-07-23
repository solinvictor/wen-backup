import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import RiderView from './RiderView'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function RiderPage({ params }: Props) {
  const { orderId } = await params

  const supabase = createAdminClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, order_ref, product_summary, status,
      delivery_type, delivery_fee, notes,
      created_at,
      buyers ( full_name, phone_number, location )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) notFound()

  return <RiderView order={order as Parameters<typeof RiderView>[0]['order']} />
}
