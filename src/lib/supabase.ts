import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )
}

export const supabase = getSupabase()

// ── Statuses ────────────────────────────────────────────────────────────────
// Pre-consultation flow: submitted -> under_review -> needs_info -> patient_replied -> approved
// Plus payment, booking, decline, cancel, complete.
export type ConsultationStatus =
  | 'pending_payment'   // waiting for paymob payment
  | 'pending_booking'   // paid, choosing appointment
  | 'submitted'         // payment + booking done, awaiting doctor review
  | 'under_review'      // doctor is reviewing
  | 'needs_info'        // doctor asked for more info
  | 'patient_replied'   // patient replied
  | 'approved'          // approved, ready to consult
  | 'declined'          // doctor rejected
  | 'cancelled'         // patient or doctor cancelled
  | 'completed'         // consultation happened
  | 'booked'            // legacy alias for approved

// ── Pain assessment ─────────────────────────────────────────────────────────
export const PAIN_NATURES = [
  'sharp',          // حاد
  'dull',           // باهت
  'burning',        // حارق
  'stabbing',       // طاعن
  'continuous',     // مستمر
  'intermittent',   // متقطع
  'radiating',      // منتشر
] as const
export type PainNature = (typeof PAIN_NATURES)[number]

export const PAIN_LOCATIONS = [
  'neck',           // الرقبة
  'upper_back',     // أعلى الظهر
  'lower_back',     // أسفل الظهر
  'shoulder',       // الكتف
  'knee',           // الركبة
  'hip',            // الورك
  'wrist',          // المعصم
  'ankle',          // الكاحل
  'elbow',          // الكوع
] as const
export type PainLocation = (typeof PAIN_LOCATIONS)[number]

export const SPINAL_AREAS = [
  'cervical',       // فقارات عنقية
  'thoracic',       // فقارات صدرية
  'lumbar',         // فقارات قطنية
] as const
export type SpinalArea = (typeof SPINAL_AREAS)[number]

export const PAIN_NATURE_LABELS_AR: Record<PainNature, string> = {
  sharp:        'حاد',
  dull:         'باهت',
  burning:      'حارق',
  stabbing:     'طاعن',
  continuous:   'مستمر',
  intermittent: 'متقطع',
  radiating:    'منتشر',
}

export const PAIN_LOCATION_LABELS_AR: Record<PainLocation, string> = {
  neck:        'الرقبة',
  upper_back:  'أعلى الظهر',
  lower_back:  'أسفل الظهر',
  shoulder:    'الكتف',
  knee:        'الركبة',
  hip:         'الورك',
  wrist:       'المعصم',
  ankle:       'الكاحل',
  elbow:       'الكوع',
}

export const SPINAL_AREA_LABELS_AR: Record<SpinalArea, string> = {
  cervical: 'الفقرات العنقية',
  thoracic: 'الفقرات الصدرية',
  lumbar:   'الفقرات القطنية',
}

// ── File categories ─────────────────────────────────────────────────────────
export const FILE_CATEGORIES = [
  'mri',           // رنين مغناطيسي
  'xray',          // أشعة
  'ct',            // أشعة مقطعية
  'lab_report',    // تحاليل
  'prescription',  // روشتة
  'other',         // أخرى
] as const
export type FileCategory = (typeof FILE_CATEGORIES)[number]

export const FILE_CATEGORY_LABELS_AR: Record<FileCategory, string> = {
  mri:          'رنين مغناطيسي',
  xray:         'أشعة (X-Ray)',
  ct:           'أشعة مقطعية (CT)',
  lab_report:   'تقرير تحاليل',
  prescription: 'روشتة سابقة',
  other:        'أخرى',
}

// ── Consultation ────────────────────────────────────────────────────────────
export type Consultation = {
  id: string
  patient_name: string
  patient_phone: string
  patient_age: number
  chief_complaint: string
  medical_history: string | null
  current_medications: string | null
  status: ConsultationStatus
  payment_id: string | null
  calendly_event_url: string | null

  doctor_id?: string | null
  doctor_name?: string | null
  specialty?: string | null
  appointment_date?: string | null
  appointment_time?: string | null

  // Pain assessment (new)
  pain_severity?: number | null
  pain_natures?: string[]
  pain_locations?: string[]
  spinal_areas?: string[]
  symptom_start?: string | null
  previous_treatments?: string | null
  previous_surgeries?: string | null
  aggravating_factors?: string | null
  relieving_factors?: string | null

  // Legacy pain fields (kept for back-compat with old mock data)
  pain_duration?: string | null
  pain_type?: string | null
  joint_swelling_stiffness?: string | null

  // Doctor-side fields
  doctor_notes?: string | null
  cancellation_reason?: string | null
  reviewed_at?: string | null
  approved_at?: string | null
  cancelled_at?: string | null
  completed_at?: string | null
  rescheduled_from?: string | null

  created_at: string
}

export type ConsultationFile = {
  id: string
  consultation_id: string
  file_name: string
  file_url: string
  file_type: string | null
  category?: FileCategory | null
  size_bytes?: number | null
  created_at?: string
}

// ── Chat ────────────────────────────────────────────────────────────────────
export type SenderRole = 'patient' | 'doctor' | 'system'

export type MessageAttachment = {
  file_name: string
  file_url: string
  file_type?: string
}

export type ConsultationMessage = {
  id: string
  consultation_id: string
  sender_role: SenderRole
  body: string
  attachments: MessageAttachment[]
  read_by_patient: boolean
  read_by_doctor: boolean
  created_at: string
}

// ── Doctor profile (mirror of auth.users) ───────────────────────────────────
export type DoctorProfile = {
  id: string
  email: string
  display_name: string | null
  role: 'doctor' | 'admin'
  created_at: string
}

// ── Status display config (shared by dashboard + patient chat) ─────────────
export const STATUS_CONFIG: Record<ConsultationStatus, { label: string; badge: string }> = {
  pending_payment: { label: 'في انتظار الدفع', badge: 'badge-gold' },
  pending_booking: { label: 'في انتظار الحجز', badge: 'badge-primary' },
  submitted:       { label: 'بانتظار المراجعة', badge: 'badge-gold' },
  under_review:    { label: 'قيد المراجعة', badge: 'badge-primary' },
  needs_info:      { label: 'يحتاج معلومات', badge: 'badge-warn' },
  patient_replied: { label: 'رد المريض', badge: 'badge-primary' },
  approved:        { label: 'مقبول ومؤكد', badge: 'badge-ok' },
  declined:        { label: 'مرفوض', badge: 'badge-err' },
  cancelled:       { label: 'ملغي', badge: 'badge-err' },
  completed:       { label: 'مكتمل', badge: 'badge-ok' },
  booked:          { label: 'محجوز', badge: 'badge-ok' },
}
