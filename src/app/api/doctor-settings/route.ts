import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qxqkgarlbftrqizhwgxt.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_omAjsPorlBdXzhAyevYV5g_CVJane3K'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const doctorId = url.searchParams.get('doctorId') || 'khalid'

    const { data, error } = await supabase
      .from('doctor_settings')
      .select('*')
      .eq('doctor_id', doctorId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[api/doctor-settings] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: data?.settings || null })
  } catch (err) {
    console.error('[api/doctor-settings] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
