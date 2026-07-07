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
