import type { FileWithCategory } from '@/components/CategoryFileDropZone'

export type FormData = {
  patient_name: string
  patient_phone: string
  patient_age: string
  chief_complaint: string
  medical_history: string
  current_medications: string
  id_file: File | null
  has_previous_tests: 'yes' | 'no' | ''
  uploaded_files: FileWithCategory[]
  pain_severity: number
  pain_natures: string[]
  pain_locations: string[]
  spinal_areas: string[]
  symptom_start: string
  previous_treatments: string
  previous_surgeries: string
  aggravating_factors: string
  relieving_factors: string
  pain_duration: string
  joint_swelling_stiffness: string
}

export type StepDef = { label: string; sub: string; description: string }

export const FORM_INITIAL: FormData = {
  patient_name: '',
  patient_phone: '',
  patient_age: '',
  chief_complaint: '',
  medical_history: '',
  current_medications: '',
  id_file: null,
  has_previous_tests: '',
  uploaded_files: [],
  pain_severity: 5,
  pain_natures: [],
  pain_locations: [],
  spinal_areas: [],
  symptom_start: '',
  previous_treatments: '',
  previous_surgeries: '',
  aggravating_factors: '',
  relieving_factors: '',
  pain_duration: 'أقل من أسبوع',
  joint_swelling_stiffness: 'لا',
}
