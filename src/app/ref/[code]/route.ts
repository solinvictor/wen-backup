import { NextRequest, NextResponse } from 'next/server'

// /ref/[code] — stores the referral code in a cookie then redirects to the store.
// The cookie is read at order creation time to credit the referrer.
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = params.code?.trim().toUpperCase()

  const destination = new URL('/', _req.url)
  destination.pathname = '/store'

  const res = NextResponse.redirect(destination)

  if (code) {
    res.cookies.set('wen_ref', code, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  }

  return res
}
