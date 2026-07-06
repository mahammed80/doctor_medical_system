import { NextResponse } from 'next/server'
import {
  exchangeCodeForTokens,
  saveTokens,
  getCalendarEmail,
  setConnectionStatus,
  isGoogleCalendarConfigured,
} from '@/lib/server/googleCalendar'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      { error: 'Google Calendar OAuth credentials not configured.' },
      { status: 503 },
    )
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')

  let doctorId = 'khalid'
  let baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000'
  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf-8'))
      doctorId = decoded.doctorId || doctorId
      baseUrl = decoded.baseUrl || baseUrl
    } catch {
      // ignore decode errors
    }
  }

  if (error) {
    return NextResponse.redirect(`${baseUrl}/dashboard?calendar_error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/dashboard?calendar_error=no_code`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const email = await getCalendarEmail(tokens)
    await saveTokens(doctorId, tokens)
    await setConnectionStatus(doctorId, true, email || undefined)

    return NextResponse.redirect(`${baseUrl}/dashboard?calendar_connected=true`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[google-calendar] OAuth callback failed:', msg)
    return NextResponse.redirect(`${baseUrl}/dashboard?calendar_error=${encodeURIComponent(msg)}`)
  }
}
