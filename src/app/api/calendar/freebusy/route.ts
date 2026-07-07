import { NextResponse } from 'next/server'
import { getFreeBusy, isGoogleCalendarConfigured } from '@/lib/server/googleCalendar'
import { isSupabaseConfigured } from '@/lib/server/supabaseServer'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get('doctorId') || 'khalid'
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date parameter is required (YYYY-MM-DD)' }, { status: 400 })
  }

  // In demo mode or when OAuth not configured, return empty busy list
  if (!isSupabaseConfigured() || !isGoogleCalendarConfigured()) {
    return NextResponse.json({ busy: [] })
  }

  try {
    const busy = await getFreeBusy(doctorId, date, date)
    return NextResponse.json({ busy })
  } catch (err) {
    console.error('[google-calendar] freebusy query failed:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ busy: [], error: msg }, { status: 200 })
  }
}
