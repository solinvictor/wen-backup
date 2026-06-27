import { createClient } from '@supabase/supabase-js'

// Used for writes from public, unauthenticated forms (farmer/buyer registration,
// order creation) where there's no logged-in session to rely on for RLS.
// Never expose this client or the service role key to the browser.
export function createAdminClient() {
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceUrl || !serviceKey) {
    throw new Error(
      'Missing Supabase service role configuration. ' +
      'Set SUPABASE_SERVICE_ROLE_KEY in your environment (Supabase → Project Settings → API → service_role key).'
    )
  }
  return createClient(serviceUrl, serviceKey)
}
