import { NextResponse } from 'next/server'
import { getStoredTokens, isGoogleCalendarConfigured } from '@/lib/server/googleCalendar'
import { isSupabaseConfigured } from '@/lib/server/supabaseServer'
import { getDoctorSettings } from '@/lib/consultationService'
import { requireAuth } from '@/lib/server/apiAuth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get('doctorId') || 'khalid'

  // In demo mode (no Supabase), check the settings JSONB from localStorage
  // which stores googleCalendar.connected
  if (!isSupabaseConfigured()) {
    const settings = await getDoctorSettings(doctorId)
    return NextResponse.json({
      connected: settings.googleCalendar?.connected ?? false,
      email: settings.googleCalendar?.email ?? null,
      configured: isGoogleCalendarConfigured(),
    })
  }

  try {
    const tokens = await getStoredTokens(doctorId)
    const settings = await getDoctorSettings(doctorId)
    return NextResponse.json({
      connected: Boolean(tokens) || settings.googleCalendar?.connected === true,
      email: settings.googleCalendar?.email ?? null,
      configured: isGoogleCalendarConfigured(),
    })
  } catch (err) {
    console.error('[google-calendar] status check failed:', err)
    return NextResponse.json({
      connected: false,
      email: null,
      configured: isGoogleCalendarConfigured(),
    })
  }
}
