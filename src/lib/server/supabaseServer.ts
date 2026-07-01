import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && !SUPABASE_URL.includes('placeholder')
    && Boolean(SUPABASE_ANON_KEY) && SUPABASE_ANON_KEY !== 'placeholder'
}

/**
 * Server-side Supabase client bound to the current request's cookies.
 * Use in Server Components, route handlers, and server actions.
 * Do NOT import this from a client component.
 */
export async function getServerSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase env not configured')
  }
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // `setAll` is called from a Server Component (read-only context).
          // The proxy refreshes the session, so this is safe to ignore.
        }
      },
    },
  })
}

/**
 * Service-role Supabase client. Bypasses RLS. ONLY for trusted server
 * contexts (webhooks, cron jobs, admin scripts). Never expose to the browser.
 * The SUPABASE_SERVICE_ROLE_KEY must be set in the deployment environment.
 */
export function getServiceSupabase(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
