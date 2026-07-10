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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, error } = await getAdmin()
      .from('consultations')
      .insert(body)
      .select()
      .single()
    if (error) {
      console.error('[api/consultation] POST insert error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
    }
    return NextResponse.json({ consultation: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/consultation] POST error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, updates } = await request.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data, error } = await getAdmin()
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[api/consultation] PATCH update error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
    }
    return NextResponse.json({ consultation: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/consultation] PATCH error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const paymentId = url.searchParams.get('payment_id')

    let query = getAdmin().from('consultations').select('*')

    if (id) {
      query = query.eq('id', id)
    } else if (paymentId) {
      query = query.eq('payment_id', paymentId)
    } else {
      return NextResponse.json({ error: 'Missing id or payment_id parameter' }, { status: 400 })
    }

    const { data, error } = await query.maybeSingle()
    if (error) {
      console.error('[api/consultation] GET error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ consultation: data || null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/consultation] GET error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
