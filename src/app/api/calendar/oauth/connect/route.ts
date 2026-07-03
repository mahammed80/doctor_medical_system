import { NextResponse } from 'next/server'
import { getOAuthUrl, isGoogleCalendarConfigured } from '@/lib/server/googleCalendar'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      { error: 'لم يتم تهيئة بيانات اعتماد Google Calendar. أضف GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET و GOOGLE_REDIRECT_URI في متغيرات البيئة.' },
      { status: 503 },
    )
  }

  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get('doctorId') || 'khalid'
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000'

  const url = getOAuthUrl(doctorId, baseUrl)
  return NextResponse.redirect(url)
}
