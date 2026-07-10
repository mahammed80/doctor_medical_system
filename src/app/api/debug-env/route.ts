import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const vars = {
    PAYMOB_API_KEY: process.env.PAYMOB_API_KEY ? `set (${process.env.PAYMOB_API_KEY.length} chars)` : 'MISSING',
    PAYMOB_INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID || 'MISSING',
    PAYMOB_HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET
      ? process.env.PAYMOB_HMAC_SECRET === 'replace_with_hmac_secret'
        ? 'STILL PLACEHOLDER'
        : `set (${process.env.PAYMOB_HMAC_SECRET.length} chars)`
      : 'MISSING',
    PAYMOB_IS_LIVE: process.env.PAYMOB_IS_LIVE || 'false (default)',
    PAYMOB_BASE_URL: process.env.PAYMOB_BASE_URL || 'https://ksa.paymob.com (default)',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'MISSING',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING',
  }

  return NextResponse.json(vars)
}
