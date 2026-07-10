import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('consultations')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('[api/consultation] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ consultation: data })
  } catch (err) {
    console.error('[api/consultation] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, updates } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[api/consultation] update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ consultation: data })
  } catch (err) {
    console.error('[api/consultation] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const paymentId = url.searchParams.get('payment_id')
    const nationalId = url.searchParams.get('national_id')

    if (id) {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 404 })
      return NextResponse.json({ consultation: data })
    }

    if (paymentId) {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('payment_id', paymentId)
        .maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 404 })
      return NextResponse.json({ consultation: data })
    }

    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  } catch (err) {
    console.error('[api/consultation] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
