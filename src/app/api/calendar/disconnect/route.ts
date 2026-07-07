import { NextResponse } from 'next/server'
import { disconnectCalendar, isGoogleCalendarConfigured } from '@/lib/server/googleCalendar'
import { isSupabaseConfigured } from '@/lib/server/supabaseServer'
import { getDoctorSettings, saveDoctorSettings } from '@/lib/consultationService'
import { requireAuth } from '@/lib/server/apiAuth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  try {
    const body = await request.json()
    const doctorId = body.doctorId || 'khalid'

    // In demo mode, just clear the connection flag in localStorage settings
    if (!isSupabaseConfigured()) {
      const settings = await getDoctorSettings(doctorId)
      await saveDoctorSettings(doctorId, {
        ...settings,
        googleCalendar: { connected: false, email: null },
      })
      return NextResponse.json({ success: true })
    }

    if (isGoogleCalendarConfigured()) {
      await disconnectCalendar(doctorId)
    } else {
      // No OAuth credentials — just clear the flag
      const settings = await getDoctorSettings(doctorId)
      await saveDoctorSettings(doctorId, {
        ...settings,
        googleCalendar: { connected: false, email: null },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[google-calendar] disconnect failed:', msg)
    return NextResponse.json({ error: 'فشل قطع اتصال Google Calendar.' }, { status: 500 })
  }
}
