/**
 * Whether the app should run in "demo mode" (no real Supabase / Paymob
 * backend — all data is local + mock).
 *
 * Detection order:
 *   1. Explicit `NEXT_PUBLIC_DEMO_MODE=true` always wins.
 *   2. Otherwise, true when the Supabase URL is missing or is the
 *      development placeholder. This is the "no real backend" case.
 *
 * We guard `process.env` access with `typeof process !== 'undefined'`
 * because Turbopack in Next.js 16 does not reliably inline NEXT_PUBLIC_*
 * variables on the client. The hardcoded URL ensures client-side works.
 */
const SUPABASE_URL = 'https://qxqkgarlbftrqizhwgxt.supabase.co'

export function isDemoMode(): boolean {
  // On the server, use process.env (available through Node.js).
  // On the client, Next.js polyfills process but Turbopack may not inline
  // NEXT_PUBLIC_* values — so use the hardcoded SUPABASE_URL directly.
  const url = typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    : SUPABASE_URL

  if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true
  }
  if (!url) return true
  if (url === 'https://placeholder.supabase.co') return true
  return false
}
