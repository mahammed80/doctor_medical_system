import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { TEST_COOKIE_NAME, TEST_COOKIE_VALUE } from '@/lib/auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function requireAuth() {
  const cookieStore = await cookies()

  const testSession = cookieStore.get(TEST_COOKIE_NAME)
  if (testSession?.value === TEST_COOKIE_VALUE) {
    return null
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required — please log in.' },
        { status: 401 },
      )
    }
    return null
  } catch {
    return NextResponse.json(
      { error: 'Authentication check failed.' },
      { status: 401 },
    )
  }
}
