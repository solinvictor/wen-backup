/**
 * Thin Monnify API client. Monnify (unlike Paystack) requires a short-lived
 * bearer token fetched via Basic auth before every other call — see
 * https://developers.monnify.com/docs/collections/quickstart. Every response
 * body is wrapped the same way: { requestSuccessful, responseMessage,
 * responseCode, responseBody }.
 */

export interface MonnifyConfig {
  apiKey: string
  secretKey: string
  contractCode: string
  baseUrl: string
}

export interface MonnifyEnvelope<T> {
  requestSuccessful: boolean
  responseMessage: string
  responseCode: string
  responseBody: T
}

export function getMonnifyConfig(): MonnifyConfig | null {
  const apiKey = process.env.MONNIFY_API_KEY
  const secretKey = process.env.MONNIFY_SECRET_KEY
  const contractCode = process.env.MONNIFY_CONTRACT_CODE
  const baseUrl = process.env.MONNIFY_BASE_URL

  if (!apiKey || !secretKey || !contractCode || !baseUrl) return null
  return { apiKey, secretKey, contractCode, baseUrl: baseUrl.replace(/\/+$/, '') }
}

// Cached per warm serverless instance — tokens are valid for ~1hr, refetching
// on every call would double the number of round trips for no benefit.
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(config: MonnifyConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token

  const basic = Buffer.from(`${config.apiKey}:${config.secretKey}`).toString('base64')
  const res = await fetch(`${config.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
  })
  const data = (await res.json()) as MonnifyEnvelope<{ accessToken: string; expiresIn: number }>

  if (!res.ok || !data.requestSuccessful || !data.responseBody?.accessToken) {
    throw new Error(data.responseMessage || 'Could not authenticate with Monnify.')
  }

  // Refresh a couple of minutes early rather than racing the real expiry.
  const ttlMs = Math.max((data.responseBody.expiresIn ?? 3600) - 120, 60) * 1000
  cachedToken = { token: data.responseBody.accessToken, expiresAt: Date.now() + ttlMs }
  return cachedToken.token
}

export async function monnifyRequest<T>(
  config: MonnifyConfig,
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<MonnifyEnvelope<T>> {
  const token = await getAccessToken(config)
  const res = await fetch(`${config.baseUrl}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })
  return (await res.json()) as MonnifyEnvelope<T>
}

export interface MonnifyInitTransactionResponse {
  transactionReference: string
  paymentReference: string
  checkoutUrl: string
}

export interface MonnifyCardDetails {
  cardToken?: string
  reusable?: { supportsTokenization?: boolean }
}

export interface MonnifyTransactionStatus {
  transactionReference: string
  paymentReference: string
  amountPaid: number
  totalPayable: number
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERPAID' | 'FAILED' | 'REVERSED' | 'EXPIRED' | 'ABANDONED' | 'CANCELLED'
  paymentMethod?: string
  cardDetails?: MonnifyCardDetails
}

export interface MonnifyChargeCardTokenResponse {
  transactionReference: string
  paymentReference: string
  paymentStatus: string
}

/** Amounts within this many Naira are treated as a match — guards against float rounding, not fraud. */
const AMOUNT_TOLERANCE = 0.01

export function amountsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < AMOUNT_TOLERANCE
}
