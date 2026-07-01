import type { StepDef } from './types'

export const STEPS: readonly StepDef[] = [
  { label: 'بياناتك والتحقق', sub: 'المعلومات الشخصية والهوية', description: 'أدخل معلوماتك الأساسية لبدء الاستشارة' },
  { label: 'الشكوى الطبية',  sub: 'تفاصيل الحالة الصحية',     description: 'صف حالتك الصحية بدقة حتى يساعدك الطبيب بشكل أفضل' },
  { label: 'الأشعة والتحاليل', sub: 'المستندات والفحوصات',    description: 'ارفع ملفاتك الطبية إن وجدت (اختياري)' },
  { label: 'الدفع',          sub: 'رسوم الاستشارة',            description: 'ادفع رسوم الاستشارة' },
  { label: 'الموعد',         sub: 'اختر وقتك',                 description: 'اختر الموعد المناسب من الأوقات المتاحة' },
] as const

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
] as const

export const ARABIC_WEEKDAYS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'] as const

export const PAIN_DURATIONS = [
  'أقل من أسبوع',
  'من أسبوع إلى شهر',
  'من شهر إلى 6 أشهر',
  'أكثر من 6 أشهر',
] as const
