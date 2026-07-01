import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isDemoMode } from '@/lib/demoMode'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const PROTECTED_PREFIXES = ['/dashboard']
const AUTH_PATH = '/dashboard/login'

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === AUTH_PATH) return NextResponse.next()
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
  if (!isProtected) return NextResponse.next()

  if (isDemoMode() || !SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL(AUTH_PATH, request.url))
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request: { headers: request.headers } })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL(AUTH_PATH, request.url)
    loginUrl.searchParams.set('next', pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
