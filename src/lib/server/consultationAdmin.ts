import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './supabaseServer'
import type { Consultation } from '../supabase'

export async function updateConsultationAsService(
  id: string,
  updates: Partial<Consultation>
): Promise<Consultation | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  )
  const { data, error } = await supabase.rpc('admin_update_consultation', {
    p_id: id,
    p_updates: updates,
  })
  if (error || !data) return null
  return data as Consultation
}

/**
 * Resolves a consultation's UUID from Paymob's own order id (stored in the
 * `payment_id` column when the checkout link is created — see
 * createPaymobCheckoutLink). Paymob callbacks identify transactions by their
 * own order id, not by our UUID, so this lookup is required before calling
 * updateConsultationAsService with a Paymob-supplied identifier.
 */
export async function getConsultationIdByPaymentId(paymentId: string): Promise<string | null> {
  if (!isSupabaseConfigured() || !paymentId) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  )
  const { data, error } = await supabase.rpc('get_consultation_id_by_payment_id', {
    p_payment_id: paymentId,
  })
  if (error || !data) return null
  return data as string
}
