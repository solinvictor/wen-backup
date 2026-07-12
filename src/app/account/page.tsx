import { redirect } from 'next/navigation'
import AccountClient from './AccountClient'
import { createClient } from '@/lib/supabase/server'

export default async function AccountPage() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) redirect('/login?next=/account')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single()

  const name  = user.user_metadata?.full_name ?? ''
  const phone = user.user_metadata?.phone     ?? ''

  return (
    <AccountClient
      userId={user.id}
      initialName={name}
      initialEmail={profile?.email ?? user.email ?? ''}
      initialPhone={phone}
    />
  )
}
