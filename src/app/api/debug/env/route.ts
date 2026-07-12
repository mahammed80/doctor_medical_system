import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const ALLOWED_TOKEN = process.env.DASHBOARD_PASSWORD || 'admin123'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (token !== ALLOWED_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized. Add ?token=...' }, { status: 401 })
  }

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING',
    PAYMOB_API_KEY: process.env.PAYMOB_API_KEY ? '✅ SET' : '❌ MISSING',
    PAYMOB_INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID || '❌ MISSING',
    PAYMOB_HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET ? '✅ SET' : '❌ MISSING',
    PAYMOB_IS_LIVE: process.env.PAYMOB_IS_LIVE || '❌ MISSING',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '❌ MISSING',
    DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD ? '✅ SET' : '❌ MISSING',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not-vercel',
  }

  return NextResponse.json({ env })
}
