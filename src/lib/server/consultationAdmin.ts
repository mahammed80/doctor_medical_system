import 'server-only'

import { getServiceSupabase, isSupabaseConfigured } from './supabaseServer'
import type { Consultation } from '../supabase'

/**
 * Server-only consultation mutations. Uses the Supabase service-role key
 * so that trusted server contexts (Paymob webhook, admin scripts) can
 * update rows regardless of RLS.
 *
 * NEVER import this from a client component. NEVER expose the service
 * role key to the browser.
 */
export async function updateConsultationAsService(
  id: string,
  updates: Partial<Consultation>
): Promise<Consultation | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('consultations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Consultation
}
