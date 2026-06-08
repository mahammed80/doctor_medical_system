export type Doctor = {
  id: string
  name: string
  specialty: string
  title: string
  experience: string
  image: string
  bio: string
  calendlyUrl: string
}

export const DOCTORS: Doctor[] = [
  {
    id: 'khalid',
    name: 'د. خالد بترجي',
    specialty: 'جراحة العظام والمفاصل',
    title: 'استشاري جراحة العظام والمفاصل — رئيس المركز',
    experience: '٣٥+ سنة خبرة',
    image: '/doctor-card.png',
    bio: 'استشاري متخصص في جراحات الركبة والمفاصل الصناعية والمناظير وجراحة الحوادث، خبرة طويلة في علاج مشاكل العظام المستعصية.',
    calendlyUrl: 'https://calendly.com/your-doctor-link',
  },
  {
    id: 'sara',
    name: 'د. سارة المنصور',
    specialty: 'طب المفاصل والروماتيزم',
    title: 'استشارية أمراض المفاصل والروماتيزم',
    experience: '١٥+ سنة خبرة',
    image: '/dr_sara.png',
    bio: 'زميلة الكلية الملكية للأطباء والجراحين بكندا، متخصصة في تشخيص وعلاج هشاشة العظام، التهاب المفاصل الروماتويدي، والذئبة الحمراء.',
    calendlyUrl: 'https://calendly.com/your-doctor-link',
  },
  {
    id: 'faisal',
    name: 'د. فيصل الحربي',
    specialty: 'جراحة العمود الفقري',
    title: 'استشاري جراحة العمود الفقري والأعصاب',
    experience: '١٨+ سنة خبرة',
    image: '/dr_faisal.png',
    bio: 'زميل جامعة تورنتو الكندية، متخصص في جراحات العمود الفقري الميكروسكوبية، علاج الانزلاق الغضروفي، وتعديل انحرافات العمود الفقري.',
    calendlyUrl: 'https://calendly.com/your-doctor-link',
  },
  {
    id: 'layla',
    name: 'د. ليلى العتيبي',
    specialty: 'العلاج الطبيعي والتأهيل',
    title: 'أخصائية العلاج الطبيعي والتأهيل الحركي',
    experience: '١٠+ سنوات خبرة',
    image: '/dr_layla.png',
    bio: 'متخصصة في إعداد البرامج التأهيلية بعد العمليات الجراحية الكبرى، وتأهيل إصابات الملاعب للرياضيين لضمان العودة الآمنة للأنشطة.',
    calendlyUrl: 'https://calendly.com/your-doctor-link',
  },
]

export const SPECIALTIES = Array.from(new Set(DOCTORS.map(d => d.specialty)))
