import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const doctorId = url.searchParams.get('doctorId') || 'khalid'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !supabaseKey) {
      console.error('[api/doctor-settings] Missing Supabase env vars')
      return NextResponse.json({ settings: null })
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/doctor_settings?doctor_id=eq.${encodeURIComponent(doctorId)}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    )

    if (!res.ok) {
      const text = await res.text()
      console.error(`[api/doctor-settings] Supabase returned ${res.status}: ${text}`)
      return NextResponse.json({ settings: null })
    }

    const data = await res.json()
    return NextResponse.json({ settings: data[0]?.settings || null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/doctor-settings] error:', msg)
    return NextResponse.json({ settings: null }, { status: 500 })
  }
}
