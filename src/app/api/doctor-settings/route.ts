import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SUPABASE_URL = 'https://qxqkgarlbftrqizhwgxt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_omAjsPorlBdXzhAyevYV5g_CVJane3K'

function getAdmin() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  )
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const doctorId = url.searchParams.get('doctorId') || 'khalid'

    const { data, error } = await getAdmin()
      .from('doctor_settings')
      .select('*')
      .eq('doctor_id', doctorId)
      .maybeSingle()

    if (error) {
      console.error('[api/doctor-settings] error:', JSON.stringify(error))
      return NextResponse.json({ settings: null })
    }
    return NextResponse.json({ settings: data?.settings || null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/doctor-settings] error:', msg)
    return NextResponse.json({ settings: null }, { status: 500 })
  }
}
