import { supabase, Consultation, ConsultationFile } from './supabase'
import { DOCTORS } from './doctors'

// Extended type with doctor and specialty info
export type EnhancedConsultation = Consultation & {
  doctor_id?: string
  doctor_name?: string
  specialty?: string
}

const isBrowser = typeof window !== 'undefined'
const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// Initial mock data to seed the dashboard
const MOCK_CONSULTATIONS: EnhancedConsultation[] = [
  {
    id: 'mock-1',
    patient_name: 'أحمد بن علي',
    patient_phone: '0501234567',
    patient_age: 42,
    chief_complaint: 'ألم حاد ومستمر في الركبة اليسرى عند المشي أو صعود الدرج بعد ممارسة رياضة الجري.',
    medical_history: 'لا توجد أمراض مزمنة. إصابة قديمة في الرباط الجانبي قبل ٥ سنوات.',
    current_medications: 'مسكنات ألم (باراسيتامول) عند الحاجة.',
    status: 'booked',
    payment_id: 'pay_mada_8761234',
    calendly_event_url: 'https://calendly.com/events/khalid-batarfi-1',
    doctor_id: 'khalid',
    doctor_name: 'د. خالد بترجي',
    specialty: 'جراحة العظام والمفاصل',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'mock-2',
    patient_name: 'سارة الشمري',
    patient_phone: '0559876543',
    patient_age: 29,
    chief_complaint: 'تصلب وألم في مفاصل أصابع اليدين خاصة في الصباح الباكر، يرافقه تورم خفيف.',
    medical_history: 'تاريخ عائلي للإصابة بالروماتويد.',
    current_medications: 'لا يوجد.',
    status: 'pending_booking',
    payment_id: 'pay_visa_9918273',
    calendly_event_url: null,
    doctor_id: 'sara',
    doctor_name: 'د. سارة المنصور',
    specialty: 'طب المفاصل والروماتيزم',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'mock-3',
    patient_name: 'محمد القحطاني',
    patient_phone: '0534567890',
    patient_age: 51,
    chief_complaint: 'ألم أسفل الظهر يمتد إلى الساق اليمنى مع تنميل وخدر في القدم (أعراض عرق النسا).',
    medical_history: 'ضغط دم مرتفع (مسيطر عليه بالعلاج).',
    current_medications: 'كونكور ٥ ملغ.',
    status: 'pending_payment',
    payment_id: null,
    calendly_event_url: null,
    doctor_id: 'faisal',
    doctor_name: 'د. فيصل الحربي',
    specialty: 'جراحة العمود الفقري',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'mock-4',
    patient_name: 'خالد العتيبي',
    patient_phone: '0567890123',
    patient_age: 34,
    chief_complaint: 'برنامج تأهيلي مقترح بعد فك الجبيرة لعلاج كسر في عظمة الترقوة.',
    medical_history: 'كسر مضاعف في الترقوة تم علاجه تحفظياً بجبيرة لمدة ٦ أسابيع.',
    current_medications: 'فيتامين د وكالسيوم.',
    status: 'booked',
    payment_id: 'pay_apple_4455667',
    calendly_event_url: 'https://calendly.com/events/layla-otaibi-1',
    doctor_id: 'layla',
    doctor_name: 'د. ليلى العتيبي',
    specialty: 'العلاج الطبيعي والتأهيل',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
  }
]

// Fetch all from localStorage (only for client-side demo mode)
function getLocalConsultations(): EnhancedConsultation[] {
  if (!isBrowser) return MOCK_CONSULTATIONS
  const saved = localStorage.getItem('demo_consultations')
  if (!saved) {
    localStorage.setItem('demo_consultations', JSON.stringify(MOCK_CONSULTATIONS))
    return MOCK_CONSULTATIONS
  }
  return JSON.parse(saved)
}

function saveLocalConsultations(list: EnhancedConsultation[]) {
  if (!isBrowser) return
  localStorage.setItem('demo_consultations', JSON.stringify(list))
}

export async function getConsultations(): Promise<EnhancedConsultation[]> {
  if (isDemo) {
    // Return sorted descending by created_at
    return getLocalConsultations().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Supabase fetch failed, falling back to local mock data:', err)
    return getLocalConsultations()
  }
}

export async function getConsultationById(id: string): Promise<EnhancedConsultation | null> {
  if (isDemo || id.startsWith('demo-') || id.startsWith('mock-')) {
    const list = getLocalConsultations()
    return list.find(c => c.id === id) || null
  }

  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error(`Supabase fetch detail failed for ID ${id}, searching locally:`, err)
    return getLocalConsultations().find(c => c.id === id) || null
  }
}

export async function createConsultation(data: Omit<EnhancedConsultation, 'id' | 'created_at' | 'status' | 'payment_id' | 'calendly_event_url'> & { doctor_id: string }): Promise<EnhancedConsultation> {
  const selectedDoctor = DOCTORS.find(d => d.id === data.doctor_id) || DOCTORS[0]
  
  const newRecord: EnhancedConsultation = {
    ...data,
    id: 'demo-' + Date.now(),
    status: 'pending_payment',
    doctor_name: selectedDoctor.name,
    specialty: selectedDoctor.specialty,
    created_at: new Date().toISOString(),
    payment_id: null,
    calendly_event_url: null
  }

  if (isDemo) {
    const list = getLocalConsultations()
    list.push(newRecord)
    saveLocalConsultations(list)
    return newRecord
  }

  try {
    // Insert into Supabase (will ignore doctor_id / doctor_name / specialty if they don't exist in SQL schema yet)
    // To ensure compatibility, we insert standard fields and store doctor info if schema matches
    const supabasePayload: any = {
      patient_name: data.patient_name,
      patient_phone: data.patient_phone,
      patient_age: data.patient_age,
      chief_complaint: data.chief_complaint,
      medical_history: data.medical_history,
      current_medications: data.current_medications,
      status: 'pending_payment',
    }

    // Try sending doctor info. Supabase will ignore if columns don't exist yet (or fail if strict)
    // We add them dynamically:
    try {
      supabasePayload.doctor_id = data.doctor_id
      supabasePayload.doctor_name = selectedDoctor.name
      supabasePayload.specialty = selectedDoctor.specialty
    } catch {}

    const { data: insertedData, error } = await supabase
      .from('consultations')
      .insert(supabasePayload)
      .select()
      .single()

    if (error) throw error
    
    // Merge the local properties just in case the Supabase table doesn't have the columns yet
    return {
      ...newRecord,
      ...insertedData
    }
  } catch (err) {
    console.error('Supabase insert failed, storing locally in demo mode:', err)
    const list = getLocalConsultations()
    list.push(newRecord)
    saveLocalConsultations(list)
    return newRecord
  }
}

export async function updateConsultation(id: string, updates: Partial<EnhancedConsultation>): Promise<EnhancedConsultation | null> {
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
    return data
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

export async function getConsultationFiles(consultationId: string): Promise<ConsultationFile[]> {
  if (isDemo || consultationId.startsWith('demo-') || consultationId.startsWith('mock-')) {
    // Mock files stored in session or static mock
    if (isBrowser) {
      const savedFiles = localStorage.getItem(`files_${consultationId}`)
      if (savedFiles) return JSON.parse(savedFiles)
    }
    
    // Static mock files for mock-1
    if (consultationId === 'mock-1') {
      return [
        {
          id: 'file-1',
          consultation_id: 'mock-1',
          file_name: 'التقرير_الطبي_الركبة.pdf',
          file_url: '#',
          file_type: 'application/pdf'
        },
        {
          id: 'file-2',
          consultation_id: 'mock-1',
          file_name: 'أشعة_رنين_مغناطيسي_MRI.png',
          file_url: '#',
          file_type: 'image/png'
        }
      ]
    }
    return []
  }

  try {
    const { data, error } = await supabase
      .from('consultation_files')
      .select('*')
      .eq('consultation_id', consultationId)

    if (error) throw error
    return data || []
  } catch (err) {
    console.error(`Supabase files fetch failed for consultation ${consultationId}:`, err)
    return []
  }
}

export async function saveLocalUploadedFile(consultationId: string, fileName: string, fileType: string) {
  if (!isBrowser) return
  const key = `files_${consultationId}`
  const existingRaw = localStorage.getItem(key)
  const existing = existingRaw ? JSON.parse(existingRaw) : []
  
  const newFile: ConsultationFile = {
    id: 'file-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    consultation_id: consultationId,
    file_name: fileName,
    file_url: '#', // mock url
    file_type: fileType
  }
  
  existing.push(newFile)
  localStorage.setItem(key, JSON.stringify(existing))
}
