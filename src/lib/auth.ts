import { supabase } from './supabase'

export type AuthSession = {
  user_id: string
  email: string
  display_name: string | null
  role: 'doctor' | 'admin'
}

const SESSION_KEY = 'doctor_console_session'

// ── Static test credential (testing only — remove or rotate before production) ──
export const TEST_CREDENTIALS = [
  { email: 'admin@kbaterjee.clinic', password: 'Test@2026', display_name: 'مدير النظام (تجربة)' },
] as const
export const TEST_COOKIE_NAME = 'dashboard_test_session'
export const TEST_COOKIE_VALUE = 'kbaterjee-admin-2026'

function isTestCredential(email: string, password: string) {
  return TEST_CREDENTIALS.find(c => c.email === email && c.password === password)
}

function setTestSessionCookie() {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${TEST_COOKIE_NAME}=${TEST_COOKIE_VALUE}; path=/; max-age=86400; SameSite=Lax${secure}`
}

function clearTestSessionCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${TEST_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

/**
 * Sign in with email + password via Supabase Auth.
 * Falls through to a static test credential (see TEST_CREDENTIALS) for
 * local/dev access without provisioning a Supabase user.
 * Returns the session on success, or a user-facing error message.
 */
export async function signIn(email: string, password: string): Promise<AuthSession> {
  const test = isTestCredential(email, password)
  if (test) {
    const session: AuthSession = {
      user_id: `test-${test.email}`,
      email: test.email,
      display_name: test.display_name,
      role: 'admin',
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      setTestSessionCookie()
    }
    return session
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    throw new Error(error?.message || 'تعذر تسجيل الدخول')
  }

  const profile = await loadProfile(data.user.id, data.user.email ?? email)
  const session: AuthSession = {
    user_id: data.user.id,
    email: data.user.email ?? email,
    display_name: profile.display_name,
    role: profile.role,
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  return session
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  clearTestSessionCookie()
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession()
  if (!data.session?.user) {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(SESSION_KEY)
      if (cached) {
        try { return JSON.parse(cached) as AuthSession } catch {}
      }
    }
    return null
  }
  const u = data.session.user
  const profile = await loadProfile(u.id, u.email ?? '')
  return {
    user_id: u.id,
    email: u.email ?? '',
    display_name: profile.display_name,
    role: profile.role,
  }
}

export function getCachedSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  const cached = localStorage.getItem(SESSION_KEY)
  if (!cached) return null
  try { return JSON.parse(cached) as AuthSession } catch { return null }
}

/**
 * Supabase Auth server-side check (for Server Components / route handlers).
 * Returns the current user from the request cookie, or null.
 *
 * In a real app you'd use `createServerClient` with cookies(). Here we
 * keep it minimal and rely on the client-side guard in pages.
 */
export async function getServerSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return {
    user_id: data.user.id,
    email: data.user.email ?? '',
    display_name: (data.user.user_metadata?.display_name as string) ?? null,
    role: 'doctor',
  }
}

async function loadProfile(userId: string, email: string): Promise<{ display_name: string | null; role: 'doctor' | 'admin' }> {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('display_name, role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return { display_name: email.split('@')[0], role: 'doctor' }
  }
  return { display_name: data.display_name, role: data.role }
}
