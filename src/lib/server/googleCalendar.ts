import 'server-only'
import { google } from 'googleapis'
import type { oauth2_v2 } from 'googleapis'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './supabaseServer'

// ── Types ───────────────────────────────────────────────────────────────────

export type CalendarTokens = {
  access_token: string
  refresh_token: string | null
  expiry_date: number | null
  token_type?: string
  scope?: string
}

export type BusyRange = {
  start: string
  end: string
}

export type CalendarEventInput = {
  patientName: string
  patientPhone: string
  chiefComplaint: string
  date: string
  time: string
  durationMinutes: number
  doctorName: string
  consultationId: string
}

// ── Config ──────────────────────────────────────────────────────────────────

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || ''

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
]

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI)
}

function getServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

function getOAuth2Client() {
  if (!isGoogleCalendarConfigured()) {
    throw new Error('Google Calendar OAuth credentials not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.')
  }
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
}

const STATE_SECRET = process.env.OAUTH_STATE_SECRET || 'kbaterjee-clinic-default-state-secret'

function signState(payload: Record<string, string>): string {
  const json = JSON.stringify(payload)
  const encoded = Buffer.from(json).toString('base64url')
  const signature = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(encoded)
    .digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyState(state: string): Record<string, string> | null {
  const lastDot = state.lastIndexOf('.')
  if (lastDot === -1) return null
  const encoded = state.slice(0, lastDot)
  const signature = state.slice(lastDot + 1)
  const expected = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(encoded)
    .digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'))
  } catch {
    return null
  }
}

// ── OAuth URL ───────────────────────────────────────────────────────────────

export function getOAuthUrl(doctorId: string, baseUrl: string): string {
  const client = getOAuth2Client()
  const state = signState({ doctorId, baseUrl })
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  })
}

// ── Token exchange ──────────────────────────────────────────────────────────

export async function exchangeCodeForTokens(code: string): Promise<CalendarTokens> {
  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)
  if (!tokens.access_token) {
    throw new Error('Google did not return an access token.')
  }
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || null,
    expiry_date: tokens.expiry_date ?? null,
    token_type: tokens.token_type ?? undefined,
    scope: tokens.scope ?? undefined,
  }
}

// ── Get user email from tokens ─────────────────────────────────────────────

export async function getCalendarEmail(tokens: CalendarTokens): Promise<string | null> {
  const client = getOAuth2Client()
  client.setCredentials(tokens)
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const res = await oauth2.userinfo.get()
  return res.data.email || null
}

// ── Token storage (server-only, uses service role) ─────────────────────────

export async function getStoredTokens(doctorId: string): Promise<CalendarTokens | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase.rpc('get_calendar_tokens', { p_doctor_id: doctorId })
    if (error || !data) return null
    return data as CalendarTokens
  } catch {
    return null
  }
}

export async function saveTokens(doctorId: string, tokens: CalendarTokens): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getServerClient()
  const { error } = await supabase.rpc('save_calendar_tokens', {
    p_doctor_id: doctorId,
    p_tokens: tokens,
  })
  if (error) throw error
}

export async function clearTokens(doctorId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getServerClient()
  await supabase.rpc('clear_calendar_tokens', { p_doctor_id: doctorId })
}

// Also update the client-visible connection status in the settings JSONB
export async function setConnectionStatus(
  doctorId: string,
  connected: boolean,
  email?: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getServerClient()
  const { error } = await supabase.rpc('set_calendar_connection_status', {
    p_doctor_id: doctorId,
    p_connected: connected,
    p_email: email || null,
  })
  if (error) throw error
}

// ── Refresh tokens if expired ───────────────────────────────────────────────

export async function getValidTokens(doctorId: string): Promise<CalendarTokens | null> {
  const tokens = await getStoredTokens(doctorId)
  if (!tokens) return null

  const now = Date.now()
  const expired = !tokens.expiry_date || tokens.expiry_date <= now + 60_000

  if (!expired) return tokens

  if (!tokens.refresh_token) {
    console.warn('[google-calendar] Access token expired and no refresh token available for doctor:', doctorId)
    return null
  }

  try {
    const client = getOAuth2Client()
    client.setCredentials({
      refresh_token: tokens.refresh_token,
    })
    const { credentials } = await client.refreshAccessToken()
    const refreshed: CalendarTokens = {
      access_token: credentials.access_token || tokens.access_token,
      refresh_token: credentials.refresh_token || tokens.refresh_token,
      expiry_date: credentials.expiry_date ?? null,
      token_type: credentials.token_type ?? undefined,
      scope: credentials.scope ?? undefined,
    }
    await saveTokens(doctorId, refreshed)
    return refreshed
  } catch (err) {
    console.error('[google-calendar] Failed to refresh token for doctor:', doctorId, err)
    return null
  }
}

// ── Free/Busy query ─────────────────────────────────────────────────────────

export async function getFreeBusy(
  doctorId: string,
  startDate: string,
  endDate: string,
): Promise<BusyRange[]> {
  const tokens = await getValidTokens(doctorId)
  if (!tokens) return []

  const client = getOAuth2Client()
  client.setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth: client })

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: `${startDate}T00:00:00Z`,
      timeMax: `${endDate}T23:59:59Z`,
      items: [{ id: 'primary' }],
    },
  })

  const calendars = res.data.calendars || {}
  const primary = calendars['primary']
  if (!primary || !primary.busy) return []

  return primary.busy
    .filter((b): b is { start: string; end: string } => Boolean(b.start && b.end))
    .map((b) => ({ start: b.start, end: b.end }))
}

// ── Create event ────────────────────────────────────────────────────────────

export async function createCalendarEvent(
  doctorId: string,
  input: CalendarEventInput,
): Promise<string | null> {
  const tokens = await getValidTokens(doctorId)
  if (!tokens) return null

  const client = getOAuth2Client()
  client.setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth: client })

  const startDateTime = `${input.date}T${input.time}:00`
  const endDateTime = addMinutesToISO(startDateTime, input.durationMinutes)

  const event = {
    summary: `استشارة طبية — ${input.patientName}`,
    description: [
      `المريض: ${input.patientName}`,
      `الجوال: ${input.patientPhone}`,
      `الطبيب: ${input.doctorName}`,
      `رقم الاستشارة: ${input.consultationId}`,
      ``,
      `الشكوى الرئيسية:`,
      input.chiefComplaint,
    ].join('\n'),
    start: { dateTime: startDateTime, timeZone: 'Asia/Riyadh' },
    end: { dateTime: endDateTime, timeZone: 'Asia/Riyadh' },
    source: {
      title: 'بتيرجي للاستشارات الطبية',
      url: `https://doctor-consultation.vercel.app/dashboard/${input.consultationId}`,
    },
  }

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  })

  return res.data.id || null
}

// ── Update event ───────────────────────────────────────────────────────────

export async function updateCalendarEvent(
  doctorId: string,
  eventId: string,
  input: CalendarEventInput,
): Promise<void> {
  const tokens = await getValidTokens(doctorId)
  if (!tokens) return

  const client = getOAuth2Client()
  client.setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth: client })

  const startDateTime = `${input.date}T${input.time}:00`
  const endDateTime = addMinutesToISO(startDateTime, input.durationMinutes)

  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: {
      summary: `استشارة طبية — ${input.patientName}`,
      description: [
        `المريض: ${input.patientName}`,
        `الجوال: ${input.patientPhone}`,
        `الطبيب: ${input.doctorName}`,
        `رقم الاستشارة: ${input.consultationId}`,
        ``,
        `الشكوى الرئيسية:`,
        input.chiefComplaint,
      ].join('\n'),
      start: { dateTime: startDateTime, timeZone: 'Asia/Riyadh' },
      end: { dateTime: endDateTime, timeZone: 'Asia/Riyadh' },
    },
  })
}

// ── Delete event ────────────────────────────────────────────────────────────

export async function deleteCalendarEvent(
  doctorId: string,
  eventId: string,
): Promise<void> {
  const tokens = await getValidTokens(doctorId)
  if (!tokens) return

  const client = getOAuth2Client()
  client.setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth: client })

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  })
}

// ── Disconnect ──────────────────────────────────────────────────────────────

export async function disconnectCalendar(doctorId: string): Promise<void> {
  const tokens = await getStoredTokens(doctorId)
  if (tokens) {
    try {
      const client = getOAuth2Client()
      client.setCredentials(tokens)
      await client.revokeCredentials()
    } catch {
      // Best effort — we still clear stored tokens regardless
    }
  }
  await clearTokens(doctorId)
  await setConnectionStatus(doctorId, false, undefined)
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function addMinutesToISO(isoStart: string, minutes: number): string {
  const d = new Date(isoStart)
  d.setMinutes(d.getMinutes() + minutes)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T${h}:${m}:00`
}
