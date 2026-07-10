import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await supabaseFetch('/consultations?select=*', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { Prefer: 'return=representation' },
    })
    return NextResponse.json({ consultation: Array.isArray(data) ? data[0] : data })
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

    const query = `id=eq.${encodeURIComponent(id)}`
    const data = await supabaseFetch(`/consultations?${query}&select=*`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { Prefer: 'return=representation' },
    })
    return NextResponse.json({ consultation: Array.isArray(data) ? data[0] : data })
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

    if (id) {
      const data = await supabaseFetch(`/consultations?id=eq.${encodeURIComponent(id)}`)
      return NextResponse.json({ consultation: data[0] || null })
    }
    if (paymentId) {
      const data = await supabaseFetch(`/consultations?payment_id=eq.${encodeURIComponent(paymentId)}`)
      return NextResponse.json({ consultation: data[0] || null })
    }

    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/consultation] GET error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return { url, key }
}

async function supabaseFetch(path: string, options: RequestInit = {}) {
  const { url, key } = getSupabaseConfig()
  const res = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    console.error(`[api] Supabase ${options.method || 'GET'} ${path} failed: ${res.status} ${text}`)
    throw new Error(text || res.statusText)
  }
  return res.json()
}
