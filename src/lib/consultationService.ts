import { supabase, Consultation, ConsultationFile, FileCategory, ConsultationStatus } from './supabase'
import { DOCTORS } from './doctors'
import { sendMessage } from './chatService'
import { isDemoMode } from './demoMode'

// Extended type — same shape as Consultation plus legacy local-only props.
export type EnhancedConsultation = Consultation

const isBrowser = typeof window !== 'undefined'
const isDemo = isDemoMode()

// ── Initial mock data ───────────────────────────────────────────────────────
const MOCK_CONSULTATIONS: EnhancedConsultation[] = [
  {
    id: 'mock-1',
    patient_name: 'أحمد بن علي',
    patient_phone: '0501234567',
    patient_age: 42,
    chief_complaint: 'ألم حاد ومستمر في الركبة اليسرى عند المشي أو صعود الدرج بعد ممارسة رياضة الجري.',
    medical_history: 'لا توجد أمراض مزمنة. إصابة قديمة في الرباط الجانبي قبل ٥ سنوات.',
    current_medications: 'مسكنات ألم (باراسيتامول) عند الحاجة.',
    status: 'approved',
    payment_id: 'pay_mada_8761234',
    calendly_event_url: null,
    doctor_id: 'khalid',
    doctor_name: 'د. خالد بترجي',
    specialty: 'جراحة العظام والمفاصل',
    appointment_date: '2026-06-11',
    appointment_time: '10:00',
    pain_severity: 7,
    pain_natures: ['sharp', 'continuous'],
    pain_locations: ['knee'],
    spinal_areas: [],
    symptom_start: 'قبل أسبوعين بعد رياضة الجري',
    previous_treatments: 'مسكنات فقط',
    previous_surgeries: 'لا يوجد',
    aggravating_factors: 'صعود الدرج والجري',
    relieving_factors: 'الراحة والكمادات الباردة',
    doctor_notes: 'يحتاج فحص MRI لتقييم الغضروف.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'mock-2',
    patient_name: 'سارة الشمري',
    patient_phone: '0559876543',
    patient_age: 29,
    chief_complaint: 'خشونة وتورم في مفاصل الركبة وتصلب حركي خاصة في الصباح الباكر.',
    medical_history: 'تاريخ عائلي للإصابة بخشونة المفاصل.',
    current_medications: 'لا يوجد.',
    status: 'under_review',
    payment_id: 'pay_visa_9918273',
    calendly_event_url: null,
    doctor_id: 'khalid',
    doctor_name: 'د. خالد بترجي',
    specialty: 'جراحة العظام والمفاصل',
    appointment_date: '2026-06-12',
    appointment_time: '14:30',
    pain_severity: 5,
    pain_natures: ['dull', 'intermittent'],
    pain_locations: ['knee'],
    spinal_areas: [],
    symptom_start: 'منذ 3 أشهر',
    previous_treatments: 'مسكنات موضعية',
    previous_surgeries: 'لا يوجد',
    aggravating_factors: 'البرودة والجلوس لفترات طويلة',
    relieving_factors: 'التمارين الخفيفة',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'mock-3',
    patient_name: 'محمد القحطاني',
    patient_phone: '0534567890',
    patient_age: 51,
    chief_complaint: 'آلام شديدة في مفاصل الورك والركبة تمنع النوم وتتطلب فحصاً لإمكانية إجراء عملية تبديل مفصل.',
    medical_history: 'ضغط دم مرتفع (مسيطر عليه بالعلاج).',
    current_medications: 'كونكور ٥ ملغ.',
    status: 'pending_payment',
    payment_id: null,
    calendly_event_url: null,
    doctor_id: 'khalid',
    doctor_name: 'د. خالد بترجي',
    specialty: 'جراحة العظام والمفاصل',
    pain_severity: 9,
    pain_natures: ['continuous', 'radiating'],
    pain_locations: ['hip', 'knee'],
    spinal_areas: [],
    symptom_start: 'منذ أكثر من 6 أشهر',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'mock-4',
    patient_name: 'خالد العتيبي',
    patient_phone: '0567890123',
    patient_age: 34,
    chief_complaint: 'برنامج تأهيلي ومتابعة طبية لعلاج كسر في عظمة الترقوة ومفاصل الكتف.',
    medical_history: 'كسر مضاعف في الترقوة تم علاجه تحفظياً بجبيرة لمدة ٦ أسابيع.',
    current_medications: 'فيتامين د وكالسيوم.',
    status: 'declined',
    payment_id: 'pay_apple_4455667',
    calendly_event_url: null,
    doctor_id: 'khalid',
    doctor_name: 'د. خالد بترجي',
    specialty: 'جراحة العظام والمفاصل',
    appointment_date: '2026-06-10',
    appointment_time: '15:00',
    pain_severity: 3,
    pain_natures: ['dull'],
    pain_locations: ['shoulder'],
    spinal_areas: [],
    symptom_start: 'قبل 4 أسابيع (حادث سيارة)',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
]

// ── Local storage helpers ───────────────────────────────────────────────────
function getLocalConsultations(): EnhancedConsultation[] {
  if (!isBrowser) return MOCK_CONSULTATIONS
  const saved = localStorage.getItem('demo_consultations')
  if (!saved) {
    localStorage.setItem('demo_consultations', JSON.stringify(MOCK_CONSULTATIONS))
    return MOCK_CONSULTATIONS
  }
  try { return JSON.parse(saved) as EnhancedConsultation[] } catch { return MOCK_CONSULTATIONS }
}

function saveLocalConsultations(list: EnhancedConsultation[]) {
  if (!isBrowser) return
  localStorage.setItem('demo_consultations', JSON.stringify(list))
}

// ── Read ────────────────────────────────────────────────────────────────────
export async function getConsultations(): Promise<EnhancedConsultation[]> {
  if (isDemo) {
    return getLocalConsultations()
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as EnhancedConsultation[]
  } catch (err) {
    console.error('Supabase fetch failed, falling back to local mock data:', err)
    return getLocalConsultations()
  }
}

export async function getConsultationById(id: string): Promise<EnhancedConsultation | null> {
  if (isDemo || id.startsWith('demo-') || id.startsWith('mock-')) {
    return getLocalConsultations().find(c => c.id === id) || null
  }
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as EnhancedConsultation
  } catch (err) {
    console.error(`Supabase fetch detail failed for ID ${id}, searching locally:`, err)
    return getLocalConsultations().find(c => c.id === id) || null
  }
}

// ── Create ──────────────────────────────────────────────────────────────────
type CreateInput = Omit<EnhancedConsultation, 'id' | 'created_at' | 'status' | 'payment_id' | 'calendly_event_url' | 'doctor_name' | 'specialty'>
  & { doctor_id: string; pain_type?: string | null; pain_duration?: string | null; joint_swelling_stiffness?: string | null }

export async function createConsultation(data: CreateInput): Promise<EnhancedConsultation> {
  const selectedDoctor = DOCTORS.find(d => d.id === data.doctor_id) || DOCTORS[0]

  const newRecord: EnhancedConsultation = {
    ...data,
    id: 'demo-' + Date.now(),
    status: 'pending_payment',
    doctor_name: selectedDoctor.name,
    specialty: selectedDoctor.specialty,
    created_at: new Date().toISOString(),
    payment_id: null,
    calendly_event_url: null,
  }

  if (isDemo) {
    const list = getLocalConsultations()
    list.push(newRecord)
    saveLocalConsultations(list)
    return newRecord
  }

  try {
    const { data: insertedData, error } = await supabase
      .from('consultations')
      .insert({
        patient_name:        data.patient_name,
        patient_phone:       data.patient_phone,
        patient_age:         data.patient_age,
        chief_complaint:     data.chief_complaint,
        medical_history:     data.medical_history,
        current_medications: data.current_medications,
        doctor_id:           data.doctor_id,
        doctor_name:         selectedDoctor.name,
        specialty:           selectedDoctor.specialty,
        pain_severity:       data.pain_severity ?? null,
        pain_natures:        data.pain_natures ?? [],
        pain_locations:      data.pain_locations ?? [],
        spinal_areas:        data.spinal_areas ?? [],
        symptom_start:       data.symptom_start ?? null,
        previous_treatments: data.previous_treatments ?? null,
        previous_surgeries:  data.previous_surgeries ?? null,
        aggravating_factors: data.aggravating_factors ?? null,
        relieving_factors:   data.relieving_factors ?? null,
        status:              'pending_payment',
      })
      .select()
      .single()

    if (error) throw error
    return { ...newRecord, ...insertedData } as EnhancedConsultation
  } catch (err) {
    console.error('Supabase insert failed, storing locally in demo mode:', err)
    const list = getLocalConsultations()
    list.push(newRecord)
    saveLocalConsultations(list)
    return newRecord
  }
}

// ── Update ──────────────────────────────────────────────────────────────────
export async function updateConsultation(
  id: string,
  updates: Partial<EnhancedConsultation>
): Promise<EnhancedConsultation | null> {
  if (isDemo || id.startsWith('demo-') || id.startsWith('mock-')) {
    const list = getLocalConsultations()
    const index = list.findIndex(c => c.id === id)
    if (index === -1) return null
    list[index] = { ...list[index], ...updates }
    saveLocalConsultations(list)
    return list[index]
  }

  try {
    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as EnhancedConsultation
  } catch (err) {
    console.error(`Supabase update failed for ID ${id}, updating locally:`, err)
    const list = getLocalConsultations()
    const index = list.findIndex(c => c.id === id)
    if (index === -1) return null
    list[index] = { ...list[index], ...updates }
    saveLocalConsultations(list)
    return list[index]
  }
}

/**
 * Update consultation status with the appropriate side-effects
 * (timestamps, system chat message, etc.) so the rest of the app
 * doesn't have to know about the timestamps.
 */
export async function transitionStatus(
  id: string,
  next: ConsultationStatus,
  extra: Partial<EnhancedConsultation> = {},
  systemMessage?: string
): Promise<EnhancedConsultation | null> {
  const now = new Date().toISOString()
  const patches: Partial<EnhancedConsultation> = { ...extra, status: next }

  if (next === 'under_review') patches.reviewed_at = now
  if (next === 'approved')      patches.approved_at = now
  if (next === 'cancelled')     patches.cancelled_at = now
  if (next === 'completed')     patches.completed_at = now

  const updated = await updateConsultation(id, patches)

  if (systemMessage) {
    try {
      await sendMessage(id, systemMessage, 'system')
    } catch (e) {
      console.warn('Failed to post system message:', e)
    }
  }
  return updated
}

// ── Files ───────────────────────────────────────────────────────────────────
export async function getConsultationFiles(consultationId: string): Promise<ConsultationFile[]> {
  if (isDemo || consultationId.startsWith('demo-') || consultationId.startsWith('mock-')) {
    if (isBrowser) {
      const savedFiles = localStorage.getItem(`files_${consultationId}`)
      if (savedFiles) return JSON.parse(savedFiles) as ConsultationFile[]
    }
    if (consultationId === 'mock-1') {
      return [
        { id: 'file-1', consultation_id: 'mock-1', file_name: 'MRI_Knee.pdf', file_url: '#', file_type: 'application/pdf', category: 'mri' },
        { id: 'file-2', consultation_id: 'mock-1', file_name: 'X-Ray_Left_Knee.png', file_url: '#', file_type: 'image/png', category: 'xray' },
      ]
    }
    return []
  }

  try {
    const { data, error } = await supabase
      .from('consultation_files')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data || []) as ConsultationFile[]
  } catch (err) {
    console.error(`Supabase files fetch failed for consultation ${consultationId}:`, err)
    return []
  }
}

export async function addConsultationFile(
  consultationId: string,
  fileName: string,
  fileUrl: string,
  fileType: string,
  category: FileCategory = 'other',
  sizeBytes?: number
): Promise<ConsultationFile | null> {
  const record: ConsultationFile = {
    id: 'file-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    consultation_id: consultationId,
    file_name: fileName,
    file_url: fileUrl,
    file_type: fileType,
    category,
    size_bytes: sizeBytes,
    created_at: new Date().toISOString(),
  }

  if (isDemo || consultationId.startsWith('demo-') || consultationId.startsWith('mock-')) {
    if (isBrowser) {
      const key = `files_${consultationId}`
      const existing = localStorage.getItem(key)
      const list: ConsultationFile[] = existing ? JSON.parse(existing) : []
      list.push(record)
      localStorage.setItem(key, JSON.stringify(list))
    }
    return record
  }

  try {
    const { data, error } = await supabase
      .from('consultation_files')
      .insert({
        consultation_id: consultationId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        category,
        size_bytes: sizeBytes ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return data as ConsultationFile
  } catch (err) {
    console.error('File insert failed, saving locally:', err)
    if (isBrowser) {
      const key = `files_${consultationId}`
      const existing = localStorage.getItem(key)
      const list: ConsultationFile[] = existing ? JSON.parse(existing) : []
      list.push(record)
      localStorage.setItem(key, JSON.stringify(list))
    }
    return record
  }
}

// Backwards-compatible wrapper — preserves the old call signature.
export async function saveLocalUploadedFile(
  consultationId: string,
  fileName: string,
  fileType: string
) {
  return addConsultationFile(consultationId, fileName, '#', fileType)
}

// ── Scheduling ──────────────────────────────────────────────────────────────
export type DoctorScheduleSettings = {
  workingDays: number[]
  startTime: string
  endTime: string
  slotDuration: number
  lunchStart: string
  lunchEnd: string
}

const DEFAULT_SETTINGS: DoctorScheduleSettings = {
  workingDays: [0, 1, 2, 3, 4],
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  lunchStart: '12:00',
  lunchEnd: '13:00',
}

export async function getDoctorSettings(doctorId: string): Promise<DoctorScheduleSettings> {
  if (isDemo) {
    if (!isBrowser) return DEFAULT_SETTINGS
    const saved = localStorage.getItem(`doctor_settings_${doctorId}`)
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  }
  try {
    const { data, error } = await supabase
      .from('doctor_settings')
      .select('*')
      .eq('doctor_id', doctorId)
      .single()
    if (error) throw error
    return (data?.settings as DoctorScheduleSettings) || DEFAULT_SETTINGS
  } catch {
    if (isBrowser) {
      const saved = localStorage.getItem(`doctor_settings_${doctorId}`)
      if (saved) return JSON.parse(saved) as DoctorScheduleSettings
    }
    return DEFAULT_SETTINGS
  }
}

export async function saveDoctorSettings(doctorId: string, settings: DoctorScheduleSettings): Promise<DoctorScheduleSettings> {
  if (isDemo) {
    if (isBrowser) {
      localStorage.setItem(`doctor_settings_${doctorId}`, JSON.stringify(settings))
    }
    return settings
  }
  try {
    const { error } = await supabase
      .from('doctor_settings')
      .upsert({ doctor_id: doctorId, settings, updated_at: new Date().toISOString() })
    if (error) throw error
    return settings
  } catch (err) {
    console.warn('Failed to save to Supabase doctor_settings, saving to localStorage:', err)
    if (isBrowser) {
      localStorage.setItem(`doctor_settings_${doctorId}`, JSON.stringify(settings))
    }
    return settings
  }
}

export type TimeSlot = {
  time: string
  available: boolean
  status: 'available' | 'pending_approval' | 'approved' | 'declined' | 'booked' | 'needs_info' | 'under_review' | 'submitted' | 'patient_replied'
  consultationId?: string
}

export async function getDoctorSlots(doctorId: string, dateStr: string): Promise<TimeSlot[]> {
  const settings = await getDoctorSettings(doctorId)
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()
  if (!settings.workingDays.includes(dayOfWeek)) return []

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const minutesToTime = (m: number) => {
    const h = Math.floor(m / 60)
    const min = m % 60
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
  }

  const startMin = timeToMinutes(settings.startTime)
  const endMin = timeToMinutes(settings.endTime)
  const lunchStartMin = timeToMinutes(settings.lunchStart)
  const lunchEndMin = timeToMinutes(settings.lunchEnd)
  const duration = settings.slotDuration

  const slots: TimeSlot[] = []
  for (let m = startMin; m + duration <= endMin; m += duration) {
    if (m >= lunchStartMin && m < lunchEndMin) continue
    slots.push({ time: minutesToTime(m), available: true, status: 'available' })
  }

  const consultations = await getConsultations()
  const dayConsultations = consultations.filter(c =>
    (c.doctor_id || 'khalid') === doctorId &&
    c.appointment_date === dateStr &&
    (c.status === 'booked' || c.status === 'submitted' || c.status === 'approved')
  )

  slots.forEach(slot => {
    const match = dayConsultations.find(c => c.appointment_time === slot.time)
    if (match) {
      slot.available = false
      slot.status = match.status === 'submitted' ? 'submitted' : 'booked'
      slot.consultationId = match.id
    }
  })

  return slots
}
