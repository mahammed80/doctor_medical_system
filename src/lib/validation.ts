import { z } from 'zod'

export const PatientInfoSchema = z.object({
  patient_name: z.string().trim().min(2, 'الاسم مطلوب (حرفان على الأقل)').max(80),
  patient_phone: z
    .string()
    .trim()
    .regex(/^(\+?966|0)?5\d{8}$/, 'رقم الجوال السعودي يجب أن يكون 10 أرقام ويبدأ بـ 05'),
  patient_age: z
    .string()
    .regex(/^\d{1,3}$/, 'العمر يجب أن يكون رقماً')
    .refine((v) => {
      const n = Number(v)
      return n >= 1 && n <= 120
    }, 'العمر يجب أن يكون بين 1 و 120'),
})

export const ComplaintSchema = z.object({
  chief_complaint: z.string().trim().min(10, 'الرجاء شرح الشكوى بـ 10 أحرف على الأقل'),
  pain_natures: z.array(z.string()).min(1, 'اختر طبيعة واحدة على الأقل للألم'),
  pain_locations: z.array(z.string()).min(1, 'حدد مكان الألم على الخريطة'),
  pain_severity: z.number().int().min(0).max(10),
})

export const FileUploadMetaSchema = z.object({
  file_name: z.string().min(1),
  file_url: z.string().min(1),
  file_type: z.string().optional(),
  category: z.enum(['mri', 'xray', 'ct', 'lab_report', 'prescription', 'other']),
  size_bytes: z.number().int().nonnegative().optional(),
})

export type PatientInfoInput = z.infer<typeof PatientInfoSchema>
export type ComplaintInput = z.infer<typeof ComplaintSchema>
export type FileUploadMetaInput = z.infer<typeof FileUploadMetaSchema>
