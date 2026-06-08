import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )
}

export const supabase = getSupabase()

export type Consultation = {
  id: string
  patient_name: string
  patient_phone: string
  patient_age: number
  chief_complaint: string
  medical_history: string
  current_medications: string
  status: 'pending_payment' | 'pending_booking' | 'booked'
  payment_id: string | null
  calendly_event_url: string | null
  created_at: string
}

export type ConsultationFile = {
  id: string
  consultation_id: string
  file_name: string
  file_url: string
  file_type: string
}
