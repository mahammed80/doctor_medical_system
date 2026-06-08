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
]

export const SPECIALTIES = Array.from(new Set(DOCTORS.map(d => d.specialty)))

