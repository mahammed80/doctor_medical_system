/**
 * Whether the app should run in "demo mode" (no real Supabase / Paymob
 * backend — all data is local + mock).
 *
 * Detection order:
 *   1. Explicit `NEXT_PUBLIC_DEMO_MODE=true` always wins.
 *   2. Otherwise, true when the Supabase URL is missing or is the
 *      development placeholder. This is the "no real backend" case.
 *
 * Use this everywhere instead of duplicating the `URL.includes('placeholder')`
 * check, which can silently misfire on a real URL that happens to contain
 * the substring.
 */
export function isDemoMode(): boolean {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true
  }
  const url = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : ''
  if (!url) return true
  if (url === 'https://placeholder.supabase.co') return true
  return false
}
