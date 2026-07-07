import { NextResponse } from 'next/server'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  isGoogleCalendarConfigured,
  type CalendarEventInput,
} from '@/lib/server/googleCalendar'
import { isSupabaseConfigured } from '@/lib/server/supabaseServer'
import { getDoctorSettings } from '@/lib/consultationService'
import { requireAuth } from '@/lib/server/apiAuth'

export const runtime = 'nodejs'

type EventRequestBody = {
  action: 'create' | 'update' | 'delete'
  doctorId: string
  consultationId: string
  eventId?: string
  consultation: {
    patientName: string
    patientPhone: string
    chiefComplaint: string
    date: string
    time: string
    doctorName: string
  }
}

export async function POST(request: Request) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  // In demo mode or when OAuth not configured, silently succeed (no-op)
  if (!isSupabaseConfigured() || !isGoogleCalendarConfigured()) {
    return NextResponse.json({ success: true, eventId: null, skipped: true })
  }

  try {
    const body = (await request.json()) as EventRequestBody
    const { action, doctorId, consultationId, consultation } = body

    // Check if the doctor has connected their calendar
    const settings = await getDoctorSettings(doctorId)
    if (!settings.googleCalendar?.connected) {
      return NextResponse.json({ success: true, eventId: null, skipped: true })
    }

    const slotDuration = settings.slotDuration || 30
    const input: CalendarEventInput = {
      patientName: consultation.patientName,
      patientPhone: consultation.patientPhone,
      chiefComplaint: consultation.chiefComplaint,
      date: consultation.date,
      time: consultation.time,
      durationMinutes: slotDuration,
      doctorName: consultation.doctorName,
      consultationId,
    }

    if (action === 'create') {
      const eventId = await createCalendarEvent(doctorId, input)
      return NextResponse.json({ success: true, eventId })
    }

    if (action === 'update' && body.eventId) {
      await updateCalendarEvent(doctorId, body.eventId, input)
      return NextResponse.json({ success: true, eventId: body.eventId })
    }

    if (action === 'delete' && body.eventId) {
      await deleteCalendarEvent(doctorId, body.eventId)
      return NextResponse.json({ success: true, eventId: null })
    }

    return NextResponse.json({ error: 'Invalid action or missing eventId' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[google-calendar] event operation failed:', msg)
    // Fail gracefully — don't block the booking flow
    return NextResponse.json({ success: false, error: msg, eventId: null }, { status: 500 })
  }
}
