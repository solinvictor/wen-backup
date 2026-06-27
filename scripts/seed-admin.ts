/**
 * One-time script: creates your account via Supabase's Admin API
 * (no dashboard clicking, no public signup form needed).
 *
 * After running this, you still need to promote yourself to admin —
 * that's a deliberate separate step, done with one SQL command. This
 * script only creates the login; it does NOT grant admin access by itself.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts you@example.com your-password-here
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL to be
 * set in your environment (.env.local is NOT auto-loaded by tsx — either
 * export them in your shell first, or run with:
 *   node --env-file=.env.local -r tsx/cjs scripts/seed-admin.ts you@example.com your-password
 */
import { createClient } from '@supabase/supabase-js'

const [, , email, password] = process.argv

if (!email || !password) {
  console.error('Usage: npx tsx scripts/seed-admin.ts <email> <password>')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.'
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip the confirmation email — this is you, created directly
  })

  if (error) {
    console.error('Failed to create user:', error.message)
    process.exit(1)
  }

  console.log('User created:', data.user?.id)
  console.log('')
  console.log('A profile row was auto-created with role = "user".')
  console.log('To promote yourself to admin, run this ONCE in the Supabase SQL editor:')
  console.log('')
  console.log(`  update public.profiles set role = 'admin' where email = '${email}';`)
  console.log('')
}

main()
