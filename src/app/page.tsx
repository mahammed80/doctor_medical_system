'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ARTICLES } from '@/lib/articles'

/* ΓöÇΓöÇ DATA ΓöÇΓöÇ */

const stats = [
  { num: '35+', label: '╪│┘å╪⌐ ┘à┘å ╪º┘ä╪«╪¿╪▒╪⌐', desc: '┘ü┘è ╪¼╪▒╪º╪¡╪⌐ ╪º┘ä╪╣╪╕╪º┘à ┘ê╪º┘ä┘à┘ü╪º╪╡┘ä' },
  { num: '100%', label: '╪º╪│╪¬╪┤╪º╪▒╪⌐ ╪ú┘ê┘å ┘ä╪º┘è┘å', desc: '┘à╪▒╪ª┘è╪⌐╪î ╪ó┘à┘å╪⌐ ┘ê┘à╪▒┘è╪¡╪⌐' },
  { num: '1,500+', label: '┘à╪▒┘è╪╢ ╪¬┘à ╪╣┘ä╪º╪¼┘ç┘à', desc: '╪¿┘å╪│╪¿╪⌐ ╪▒╪╢╪º ╪¬┘ü┘ê┘é 98%' },
]

const steps = [
  { step: '01', title: '╪º╪¡╪¼╪▓ ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪⌐', desc: '╪º╪«╪¬╪▒ ╪º┘ä╪¿╪º┘é╪⌐ ╪º┘ä╪╖╪¿┘è╪⌐ ╪º┘ä┘à┘å╪º╪│╪¿╪⌐ ┘ä╪¡╪º┘ä╪¬┘â ┘ä╪¿╪»╪í ╪¡╪¼╪▓ ┘à┘ê╪╣╪»┘â' },
  { step: '02', title: '╪│╪¼┘æ┘ä ╪¿┘è╪º┘å╪º╪¬┘â ╪º┘ä╪╖╪¿┘è╪⌐', desc: '╪º┘à┘ä╪ú ┘à╪╣┘ä┘ê┘à╪º╪¬┘â ╪º┘ä╪┤╪«╪╡┘è╪⌐ ┘ê╪º╪▒┘ü╪╣ ╪º┘ä╪ú╪┤╪╣╪⌐ ┘ê╪º┘ä╪¬╪¡╪º┘ä┘è┘ä ┘ü┘è ╪»┘é╪º╪ª┘é' },
  { step: '03', title: '╪│╪»╪» ╪º┘ä╪▒╪│┘ê┘à ╪¿╪ú┘à╪º┘å', desc: '╪º╪»┘ü╪╣ ╪╣╪¿╪▒ ╪¿┘ê╪º╪¿╪º╪¬ ╪º┘ä╪»┘ü╪╣ ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è ╪º┘ä┘à╪╣╪¬┘à╪»╪⌐ ┘ê╪º┘ä╪│╪▒┘è╪╣╪⌐' },
  { step: '04', title: '╪º╪¡╪¼╪▓ ┘à┘ê╪╣╪»┘â ┘ê╪¬┘ê╪º╪╡┘ä', desc: '╪º╪«╪¬╪▒ ╪º┘ä┘à┘ê╪╣╪» ╪º┘ä┘à┘å╪º╪│╪¿ ┘ä╪¼┘ä╪│╪¬┘â ╪º┘ä┘à╪▒╪ª┘è╪⌐ ╪º┘ä┘à╪¿╪º╪┤╪▒╪⌐ ┘à╪╣ ╪º┘ä╪╖╪¿┘è╪¿' },
]

const services = [
  {
    title: '╪º┘ä┘â╪┤┘ü ╪º┘ä╪ú╪│╪º╪│┘è',
    price: '899',
    period: '╪▒┘è╪º┘ä',
    desc: '╪¼┘ä╪│╪⌐ ╪º╪│╪¬╪┤╪º╪▒┘è╪⌐ ╪┤╪º┘à┘ä╪⌐ ┘ä┘à╪»╪⌐ 30 ╪»┘é┘è┘é╪⌐ ┘à╪╣ ╪º┘ä╪╖╪¿┘è╪¿ ┘ä╪¬┘é┘è┘è┘à ╪¡╪º┘ä╪¬┘â ┘ê╪¬╪┤╪«┘è╪╡┘ç╪º ╪¿╪»┘é╪⌐.',
    features: [
      '┘â╪┤┘ü┘è╪⌐ ╪ú╪│╪º╪│┘è╪⌐ ┘à╪╣ ╪º┘ä╪º╪│╪¬╪┤╪º╪▒┘è',
      '╪╣╪▒╪╢ ┘ê╪¬╪¡┘ä┘è┘ä ╪º┘ä╪ú╪┤╪╣╪⌐ ┘ê╪º┘ä╪¬╪¡╪º┘ä┘è┘ä',
      '╪¬╪┤╪«┘è╪╡ ╪╖╪¿┘è ╪»┘é┘è┘é ┘ä┘ä╪¡╪º┘ä╪⌐',
      '┘à╪»╪⌐ ╪º┘ä╪¼┘ä╪│╪⌐: 30 ╪»┘é┘è┘é╪⌐',
      '┘à╪¬╪º╪¿╪╣╪⌐ ┘à╪¼╪º┘å┘è╪⌐ ┘ä┘à╪»╪⌐ 10 ╪ú┘è╪º┘à',
    ],
    popular: false,
  },
  {
    title: '╪º┘ä┘â╪┤┘ü ╪º┘ä╪┤╪º┘à┘ä ┘ê╪º┘ä╪«╪╖╪⌐ ╪º┘ä╪╣┘ä╪º╪¼┘è╪⌐',
    price: '1,700',
    period: '╪▒┘è╪º┘ä',
    desc: '╪º╪│╪¬╪┤╪º╪▒╪⌐ ┘à┘ê╪│╪╣╪⌐ ┘à╪╣ ╪Ñ╪╣╪»╪º╪» ╪¿╪▒┘å╪º┘à╪¼ ╪╣┘ä╪º╪¼┘è ┘à╪¬┘â╪º┘à┘ä ┘ê╪¬┘é┘è┘è┘à ╪º┘ä╪¡╪º╪¼╪⌐ ┘ä┘ä╪¼╪▒╪º╪¡╪⌐.',
    features: [
      '┘â┘ä ┘à╪º ┘ü┘è ╪º┘ä╪¿╪º┘é╪⌐ ╪º┘ä╪ú╪│╪º╪│┘è╪⌐',
      '╪Ñ╪╣╪»╪º╪» ╪¿╪▒┘å╪º┘à╪¼ ╪╣┘ä╪º╪¼┘è ┘à╪¬┘â╪º┘à┘ä',
      '╪¬┘é┘è┘è┘à ╪º┘ä╪¡╪º╪¼╪⌐ ┘ä┘ä╪¼╪▒╪º╪¡╪⌐',
      '┘à┘å╪º┘é╪┤╪⌐ ╪º┘ä╪«┘è╪º╪▒╪º╪¬ ╪º┘ä╪¿╪»┘è┘ä╪⌐ ┘ê╪º┘ä╪¼╪▒╪º╪¡┘è╪⌐',
      '┘à╪¬╪º╪¿╪╣╪⌐ ╪ú┘ê┘ä┘ë ┘à╪¼╪º┘å┘è╪⌐ ╪¿╪╣╪» ╪º┘ä╪╣┘à┘ä┘è╪⌐',
    ],
    popular: true,
  },
  {
    title: '╪¿╪º┘é╪º╪¬ ╪º┘ä┘à╪¬╪º╪¿╪╣╪⌐ ╪º┘ä┘à╪¬╪╣╪»╪»╪⌐',
    price: '2,500',
    period: '╪▒┘è╪º┘ä',
    desc: '╪¼┘ä╪│╪º╪¬ ┘à╪¬╪╣╪»╪»╪⌐ ╪¿╪│╪╣╪▒ ┘à╪«┘ü┘æ╪╢ ┘ä┘ä┘à╪▒╪╢┘ë ╪º┘ä┘à╪¡╪¬╪º╪¼┘è┘å ┘ä┘à╪¬╪º╪¿╪╣╪⌐ ┘à╪│╪¬┘à╪▒╪⌐ ╪¿╪╣╪» ╪º┘ä╪╣┘à┘ä┘è╪º╪¬.',
    features: [
      '╪¿╪º┘é╪⌐ 3 ╪¼┘ä╪│╪º╪¬ ΓÇö ╪¿┘é┘è┘à╪⌐ 2,500 ╪▒┘è╪º┘ä',
      '╪¿╪º┘é╪⌐ 4 ╪¼┘ä╪│╪º╪¬ ΓÇö ╪¿┘é┘è┘à╪⌐ 3,400 ╪▒┘è╪º┘ä',
      '╪¬┘ê┘ü┘è╪▒ ┘è╪╡┘ä ╪Ñ┘ä┘ë 200 ╪▒┘è╪º┘ä',
      '┘à╪¬╪º╪¿╪╣╪⌐ ┘à╪º ╪¿╪╣╪» ╪º┘ä╪¼╪▒╪º╪¡╪⌐ ┘ê╪Ñ╪╡╪º╪¿╪º╪¬ ╪º┘ä┘à┘ä╪º╪╣╪¿',
      '┘à╪▒┘ê┘å╪⌐ ╪╣╪º┘ä┘è╪⌐ ┘ü┘è ╪¡╪¼╪▓ ╪º┘ä┘à┘ê╪º╪╣┘è╪»',
    ],
    popular: false,
  },
]

const features = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    title: '┘å╪«╪¿╪⌐ ┘à┘å ╪º┘ä╪º╪│╪¬╪┤╪º╪▒┘è┘è┘å',
    desc: '╪¼┘à┘è╪╣ ╪ú╪╖╪¿╪º╪ª┘å╪º ┘è╪¡┘à┘ä┘ê┘å ╪»╪▒╪¼╪º╪¬ ╪º┘ä╪¿┘ê╪▒╪» ┘ê╪º┘ä╪▓┘à╪º┘ä╪º╪¬ ╪º┘ä┘â┘å╪»┘è╪⌐ ┘ê╪º┘ä╪¿╪▒┘è╪╖╪º┘å┘è╪⌐ ┘à╪╣ ╪«╪¿╪▒╪⌐ ╪╖┘ê┘è┘ä╪⌐.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    title: '╪«╪╡┘ê╪╡┘è╪⌐ ╪¬╪º┘à╪⌐ ┘ä┘ä┘à┘ä┘ü╪º╪¬',
    desc: '╪¬╪┤┘ü┘è╪▒ ┘â╪º┘à┘ä ┘ä┘à┘ä┘ü╪º╪¬┘â ┘ê╪ú╪┤╪╣╪º╪¬┘â ╪º┘ä╪╖╪¿┘è╪⌐ ┘ê┘ü┘é╪º┘ï ┘ä╪ú╪╣┘ä┘ë ┘à╪╣╪º┘è┘è╪▒ ╪º┘ä╪ú┘à┘å ╪º┘ä╪│┘è╪¿╪▒╪º┘å┘è ╪º┘ä╪╖╪¿┘è╪⌐.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    title: '╪¼╪»┘ê┘ä╪⌐ ┘à┘ê╪º╪╣┘è╪» ┘ü┘ê╪▒┘è╪⌐',
    desc: '╪º╪«╪¬╪▒ ┘ê┘é╪¬┘â ╪º┘ä┘à┘å╪º╪│╪¿ ┘à╪¿╪º╪┤╪▒╪⌐ ┘à┘å ╪¼╪»┘ê┘ä ╪º┘ä╪╖╪¿┘è╪¿ ╪º┘ä┘à╪¬╪º╪¡ ╪»┘ê┘å ┘ü╪¬╪▒╪º╪¬ ╪º┘å╪¬╪╕╪º╪▒.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    title: '╪»╪╣┘à ╪¼┘à┘è╪╣ ╪º┘ä╪╡┘è╪║ ╪º┘ä╪╖╪¿┘è╪⌐',
    desc: '╪º╪▒┘ü╪╣ ╪¬┘é╪º╪▒┘è╪▒┘â ┘ê╪ú╪┤╪╣╪º╪¬┘â ╪¿╪│┘ç┘ê┘ä╪⌐ ┘ü╪º╪ª┘é╪⌐ ╪¿┘à╪«╪¬┘ä┘ü ╪º┘ä╪╡┘è╪║ ╪º┘ä╪╖╪¿┘è╪⌐ ╪¿┘à╪º ┘ü┘è┘ç╪º ┘à┘ä┘ü╪º╪¬ DICOM.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>,
    title: '╪¬┘ê╪╡┘è┘ä ╪º┘ä┘ê╪╡┘ü╪⌐ ┘ä┘ä┘à┘å╪▓┘ä',
    desc: '┘å┘ê┘ü╪▒ ╪«╪»┘à╪⌐ ╪Ñ╪▒╪│╪º┘ä ┘ê╪╡┘ü╪¬┘â ╪º┘ä╪╖╪¿┘è╪⌐ ╪º┘ä┘à╪╣╪¬┘à╪»╪⌐ ╪▒┘é┘à┘è╪º┘ï ┘ê╪¬┘ê╪╡┘è┘ä ╪º┘ä╪ú╪»┘ê┘è╪⌐ ┘à╪¿╪º╪┤╪▒╪⌐ ┘ä╪¿╪º╪¿ ╪¿┘è╪¬┘â.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    title: '╪¿┘ê╪º╪¿╪⌐ ╪»┘ü╪╣ ╪ó┘à┘å╪⌐ ┘ê┘à╪╣╪¬┘à╪»╪⌐',
    desc: '╪«┘è╪º╪▒╪º╪¬ ╪»┘ü╪╣ ╪│╪╣┘ê╪»┘è╪⌐ ┘à┘ê╪½┘ê┘é╪⌐ ╪¬╪»╪╣┘à ╪¿╪╖╪º┘é╪º╪¬ ┘à╪»┘ë╪î ┘ü┘è╪▓╪º╪î ┘à╪º╪│╪¬╪▒┘â╪º╪▒╪»╪î ┘ê╪ú╪¿┘ä ╪¿╪º┘è.',
  },
]

const faqs = [
  { q: '┘â┘è┘ü ┘è┘à┘â┘å┘å┘è ╪¡╪¼╪▓ ╪º╪│╪¬╪┤╪º╪▒╪⌐ ┘ü┘è ┘à╪▒┘â╪▓ ╪¿╪¬╪▒╪¼┘è╪ƒ', a: '╪º┘ä╪╣┘à┘ä┘è╪⌐ ╪¿╪│┘è╪╖╪⌐ ┘ä┘ä╪║╪º┘è╪⌐ ┘ê╪¬╪│╪¬╪║╪▒┘é ╪ú┘é┘ä ┘à┘å 5 ╪»┘é╪º╪ª┘é: ╪º╪«╪¬╪▒ ╪º┘ä╪¬╪«╪╡╪╡ ┘ê╪º┘ä╪╖╪¿┘è╪¿ ╪º┘ä┘à┘å╪º╪│╪¿ ┘ä╪¡╪º┘ä╪¬┘â╪î ╪º┘à┘ä╪ú ╪¿┘è╪º┘å╪º╪¬┘â ╪º┘ä╪╖╪¿┘è╪⌐ ┘ê╪ú╪▒┘ü┘é ╪º┘ä╪ú╪┤╪╣╪⌐ ╪Ñ┘å ┘ê╪¼╪»╪¬╪î ┘é┘à ╪¿╪│╪»╪º╪» ╪▒╪│┘ê┘à ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪⌐ ╪¿╪ú┘à╪º┘å╪î ╪½┘à ╪º╪«╪¬╪▒ ╪º┘ä┘à┘ê╪╣╪» ╪º┘ä┘à┘å╪º╪│╪¿ ┘ä┘â ┘à┘å ╪¼╪»┘ê┘ä ╪º┘ä╪╖╪¿┘è╪¿ ╪º┘ä┘à╪¿╪º╪┤╪▒ ┘ä╪¬┘ä┘é┘è ╪▒╪º╪¿╪╖ ╪º┘ä╪¼┘ä╪│╪⌐ ╪º┘ä┘à╪▒╪ª┘è╪⌐.' },
  { q: '┘à╪º ┘ç┘è ╪¬┘â┘ä┘ü╪⌐ ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪⌐ ╪º┘ä╪╖╪¿┘è╪⌐╪ƒ', a: '╪¬╪«╪¬┘ä┘ü ╪º┘ä╪¬┘â┘ä┘ü╪⌐ ╪¡╪│╪¿ ┘à╪│╪¬┘ê┘ë ╪º┘ä┘â╪┤┘ü ╪º┘ä┘à╪«╪¬╪º╪▒: ╪º┘ä┘â╪┤┘ü ╪º┘ä╪ú╪│╪º╪│┘è ╪¿┘é┘è┘à╪⌐ 899 ╪▒┘è╪º┘ä╪î ╪º┘ä┘â╪┤┘ü ╪º┘ä╪┤╪º┘à┘ä ┘ê╪Ñ╪╣╪»╪º╪» ╪º┘ä╪«╪╖╪⌐ ╪º┘ä╪╣┘ä╪º╪¼┘è╪⌐ ╪¿┘é┘è┘à╪⌐ 1,700 ╪▒┘è╪º┘ä╪î ┘â┘à╪º ╪¬╪¬┘ê┘ü╪▒ ╪¿╪º┘é╪º╪¬ ┘ä┘ä┘à╪¬╪º╪¿╪╣╪º╪¬ ╪º┘ä┘à╪¬╪╣╪»╪»╪⌐ ╪¬╪¿╪»╪ú ┘à┘å 2,500 ╪▒┘è╪º┘ä ┘ä┘Ç 3 ╪¼┘ä╪│╪º╪¬.' },
  { q: '┘ç┘ä ┘è┘à┘â┘å┘å┘è ┘à╪▒╪º╪¼╪╣╪⌐ ╪º┘ä╪╖╪¿┘è╪¿ ┘à╪¼╪º┘å╪º┘ï ╪¿╪╣╪» ╪º┘ä╪¼┘ä╪│╪⌐╪ƒ', a: '┘å╪╣┘à╪î ╪¬╪┤┘à┘ä ╪¼┘à┘è╪╣ ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ╪º┘ä╪╖╪¿┘è╪⌐ ┘â┘ü╪¬╪▒╪⌐ ┘à╪▒╪º╪¼╪╣╪⌐ (┘à╪¬╪º╪¿╪╣╪⌐ ┘à╪¼╪º┘å┘è╪⌐) ╪╡╪º┘ä╪¡╪⌐ ┘ä┘à╪»╪⌐ 10 ╪ú┘è╪º┘à ┘à┘å ╪¬╪º╪▒┘è╪« ╪º┘ä╪¼┘ä╪│╪⌐ ╪º┘ä╪ú╪│╪º╪│┘è╪⌐ ┘ä┘à┘å╪º┘é╪┤╪⌐ ┘å╪¬╪º╪ª╪¼ ╪º┘ä╪¬╪¡╪º┘ä┘è┘ä ╪ú┘ê ╪¬╪¡╪»┘è╪½ ╪«╪╖╪⌐ ╪º┘ä╪╣┘ä╪º╪¼.' },
  { q: '┘ç┘ä ╪«╪»┘à╪⌐ ╪¬┘ê╪╡┘è┘ä ╪º┘ä╪ú╪»┘ê┘è╪⌐ ┘à╪¬╪º╪¡╪⌐ ┘ä╪¼┘à┘è╪╣ ╪º┘ä┘à╪▒╪╢┘ë╪ƒ', a: '┘å╪╣┘à╪î ╪¿╪╣╪» ╪º╪│╪¬╪┤╪º╪▒╪¬┘â ┘à╪╣ ╪º┘ä╪╖╪¿┘è╪¿╪î ╪Ñ╪░╪º ┘é╪▒╪▒ ┘ä┘â ┘ê╪╡┘ü╪⌐ ╪╣┘ä╪º╪¼┘è╪⌐╪î ┘è╪¬┘à ╪Ñ╪▒╪│╪º┘ä┘ç╪º ┘ä┘â ╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è╪º┘ï╪î ┘ê┘å┘ê┘ü╪▒ ╪«┘è╪º╪▒ ╪¬┘ê╪╡┘è┘ä ╪º┘ä╪ú╪»┘ê┘è╪⌐ ┘ä╪¿╪º╪¿ ┘à┘å╪▓┘ä┘â ╪¿╪º┘ä╪¬╪╣╪º┘ê┘å ┘à╪╣ ┘â╪¿╪▒┘ë ╪º┘ä╪╡┘è╪»┘ä┘è╪º╪¬ ╪º┘ä┘à╪╣╪¬┘à╪»╪⌐.' },
  { q: '┘â┘è┘ü ╪ú╪▒┘ü╪╣ ╪º┘ä┘ü╪¡┘ê╪╡╪º╪¬ ┘ê╪╡┘ê╪▒ ╪º┘ä╪ú╪┤╪╣╪⌐ ╪º┘ä╪«╪º╪╡╪⌐ ╪¿┘è╪ƒ', a: '╪ú╪½┘å╪º╪í ╪¬╪╣╪¿╪ª╪⌐ ┘å┘à┘ê╪░╪¼ ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪⌐╪î ╪│╪¬╪¼╪» ┘à┘å╪╖┘é╪⌐ ┘à╪«╪╡╪╡╪⌐ ┘ä╪▒┘ü╪╣ ╪º┘ä┘à┘ä┘ü╪º╪¬╪î ╪¡┘è╪½ ┘è┘à┘â┘å┘â ╪│╪¡╪¿ ┘ê╪Ñ┘ü┘ä╪º╪¬ ╪º┘ä╪¬┘é╪º╪▒┘è╪▒ ╪º┘ä╪╖╪¿┘è╪⌐ ┘ê╪╡┘ê╪▒ ╪º┘ä╪ú╪┤╪╣╪⌐. ┘è╪»╪╣┘à ┘å╪╕╪º┘à┘å╪º ╪¼┘à┘è╪╣ ╪º┘ä╪╡┘è╪║ ╪º┘ä┘à╪╣╪¬┘à╪»╪⌐ ┘à╪½┘ä PDF ┘êJPG ┘êPNG ╪¿╪º┘ä╪Ñ╪╢╪º┘ü╪⌐ ┘ä╪╡┘è╪║╪⌐ DICOM ┘ä┘ä╪ú╪┤╪╣╪º╪¬ ╪º┘ä┘à╪¬╪«╪╡╪╡╪⌐.' },
]

const testimonials = [
  { text: '╪º┘ä┘à╪▒┘â╪▓ ┘è┘é╪»┘à ╪▒╪╣╪º┘è╪⌐ ┘à┘à╪¬╪º╪▓╪⌐ ╪¼╪»╪º┘ï ┘ê┘å╪«╪¿╪⌐ ┘à┘à┘è╪▓╪⌐ ┘à┘å ╪º┘ä╪ú╪╖╪¿╪º╪í. ╪º╪│╪¬╪┤╪▒╪¬ ╪». ╪«╪º┘ä╪» ╪¿╪¬╪▒╪¼┘è ╪¿╪«╪╡┘ê╪╡ ╪╣┘à┘ä┘è╪⌐ ╪º┘ä╪▒┘â╪¿╪⌐ ┘ê┘â╪º┘å ╪¬╪┤╪«┘è╪╡┘ç ╪»┘é┘è┘é╪º┘ï ╪¼╪»╪º┘ï ┘ê╪ú╪▒╪º╪¡┘å┘è ┘â╪½┘è╪▒╪º┘ï. ┘ê┘ü╪▒ ╪╣┘ä┘è ╪╣┘å╪º╪í ╪º┘ä╪│┘ü╪▒.', name: '╪╣╪¿╪»╪º┘ä╪▒╪¡┘à┘å ╪º┘ä╪╣╪¬┘è╪¿┘è', title: '┘à╪▒┘è╪╢ ΓÇö ╪╣┘è╪º╪»╪⌐ ╪¼╪▒╪º╪¡╪⌐ ╪º┘ä┘à┘ü╪º╪╡┘ä' },
  { text: '╪¬╪¼╪▒╪¿╪⌐ ╪¡╪¼╪▓ ╪│┘ç┘ä╪⌐ ┘ê╪│╪▒┘è╪╣╪⌐ ┘ä┘ä╪║╪º┘è╪⌐╪î ┘ê╪º┘ä╪ú╪▒┘ê╪╣ ┘ç┘ê ╪Ñ┘à┘â╪º┘å┘è╪⌐ ╪▒┘ü╪╣ ╪º┘ä╪ú╪┤╪╣╪⌐ ┘ê┘à┘ä┘ü╪º╪¬ ╪º┘ä╪▒┘å┘è┘å ╪º┘ä┘à╪║┘å╪º╪╖┘è╪│┘è ┘ä╪¬┘é┘ê┘à ╪». ╪│╪º╪▒╪⌐ ╪º┘ä┘à┘å╪╡┘ê╪▒ ╪¿╪¬╪¡┘ä┘è┘ä┘ç╪º ┘ê┘ê╪╡┘ü ╪º┘ä╪╣┘ä╪º╪¼ ╪º┘ä┘à┘å╪º╪│╪¿ ┘ä┘è ╪»┘ê┘å ╪º┘ä╪¡╪º╪¼╪⌐ ┘ä┘à╪║╪º╪»╪▒╪⌐ ╪º┘ä┘à┘å╪▓┘ä.', name: '┘å┘ê╪▒╪⌐ ╪º┘ä╪»┘ê╪│╪▒┘è', title: '┘à╪▒┘è╪╢╪⌐ ΓÇö ╪╣┘è╪º╪»╪⌐ ╪º┘ä╪▒┘ê┘à╪º╪¬┘è╪▓┘à' },
  { text: '╪¿╪╣╪» ╪Ñ╪╡╪º╪¿╪¬┘è ┘ü┘è ╪º┘ä╪▒┘â╪¿╪⌐╪î ╪¬┘ê╪º╪╡┘ä╪¬ ┘à╪╣ ╪». ┘ä┘è┘ä┘ë ╪º┘ä╪╣╪¬┘è╪¿┘è ┘ê╪ú╪╣╪»╪¬ ┘ä┘è ╪¿╪▒┘å╪º┘à╪¼ ╪¬╪ú┘ç┘è┘ä ╪¡╪▒┘â┘è ┘à┘å╪▓┘ä┘è ╪▒╪º╪ª╪╣ ┘ê╪¬╪º╪¿╪╣╪¬ ┘à╪╣┘è ╪«╪╖┘ê╪⌐ ╪¿╪«╪╖┘ê╪⌐ ╪¡╪¬┘ë ╪╣╪»╪¬ ┘ä┘à┘à╪º╪▒╪│╪⌐ ╪º┘ä╪▒┘è╪º╪╢╪⌐ ╪¿╪┤┘â┘ä ╪╖╪¿┘è╪╣┘è.', name: '┘ü┘ç╪» ╪º┘ä╪│╪¿┘è╪╣┘è', title: '┘à╪▒┘è╪╢ ΓÇö ╪╣┘è╪º╪»╪⌐ ╪º┘ä╪╣┘ä╪º╪¼ ╪º┘ä╪╖╪¿┘è╪╣┘è' },
]

const qualifications = [
  { year: '1991', title: '╪¬╪ú╪│┘è╪│ ┘à╪▒┘â╪▓ ╪¿╪¬╪▒╪¼┘è ╪º┘ä╪╖╪¿┘è', inst: '╪▒╪ñ┘è╪⌐ ┘ä╪¬┘é╪»┘è┘à ╪ú┘ü╪╢┘ä ╪º┘ä╪«╪»┘à╪º╪¬ ╪º┘ä╪╖╪¿┘è╪⌐ ╪º┘ä╪¬╪«╪╡╪╡┘è╪⌐' },
  { year: '2012', title: '╪Ñ╪╖┘ä╪º┘é ╪º┘ä╪╣┘è╪º╪»╪º╪¬ ╪º┘ä┘à╪¬┘â╪º┘à┘ä╪⌐', inst: '╪¬┘ê╪│╪╣╪⌐ ╪º┘ä╪ú┘é╪│╪º┘à ┘ä╪¬╪┤┘à┘ä ╪º┘ä╪╣┘à┘ê╪» ╪º┘ä┘ü┘é╪▒┘è ┘ê╪º┘ä╪▒┘ê┘à╪º╪¬┘è╪▓┘à ┘ê╪º┘ä╪¬╪ú┘ç┘è┘ä' },
  { year: '2020', title: '╪º┘ä╪¬┘â╪º┘à┘ä ╪º┘ä╪▒┘é┘à┘è ╪º┘ä┘â╪º┘à┘ä', inst: '╪¬╪¡┘ê┘è┘ä ╪¼┘à┘è╪╣ ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ╪Ñ┘ä┘ë ╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ┘à╪▒┘å┘è╪⌐ ╪¬┘ü╪º╪╣┘ä┘è╪⌐ ╪╣┘å ╪¿╪╣╪»' },
  { year: '2026', title: '┘å╪╕╪º┘à ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ╪º┘ä┘à╪╖┘ê╪▒', inst: '╪Ñ╪╖┘ä╪º┘é ╪º┘ä┘à┘å╪╡╪⌐ ╪º┘ä╪¼╪»┘è╪»╪⌐ ┘ê╪¬┘ü╪╣┘è┘ä ┘à┘è╪▓╪º╪¬ ╪º┘ä╪¬╪«╪▓┘è┘å ╪º┘ä╪╖╪¿┘è ╪º┘ä╪ó┘à┘å ┘ê╪¬┘ê╪╡┘è┘ä ╪º┘ä╪ú╪»┘ê┘è╪⌐' },
]



/* ΓöÇΓöÇ COMPONENTS ΓöÇΓöÇ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
      color: 'var(--primary)',
      padding: '0.35rem 1rem', borderRadius: '9999px',
      border: '1px solid var(--border-accent)',
      background: 'var(--primary-subtle)', marginBottom: '1.25rem',
    }}>
      <span style={{ fontSize: '0.55rem' }}>Γùç</span>
      {children}
    </div>
  )
}

function SectionDivider() {
  return (
    <div className="section-divider">
      <span className="diamond" />
      <span className="diamond" style={{ width: '6px', height: '6px', opacity: 0.25 }} />
      <span className="diamond" />
    </div>
  )
}

function ScrollReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect() } },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const el = ref.current
    if (!el) return
    let current = 0
    const step = Math.max(1, Math.floor(end / 60))
    const interval = setInterval(() => {
      current += step
      if (current >= end) { current = end; clearInterval(interval) }
      const numStr = current.toLocaleString('en-US')
      el.textContent = numStr + suffix
    }, 25)
    return () => clearInterval(interval)
  }, [started, end, suffix])

  return <span ref={ref} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>0{suffix}</span>
}

const ORB_COLORS = [
  'radial-gradient(circle, oklch(46% 0.19 260 / 0.12) 0%, transparent 70%)',
  'radial-gradient(circle, oklch(68% 0.17 70 / 0.08) 0%, transparent 70%)',
  'radial-gradient(circle, oklch(50% 0.15 155 / 0.06) 0%, transparent 70%)',
]

function FloatingOrbs() {
  const orbs = [
    { size: '400px', top: '10%', right: '-5%', anim: 'floatOrb 18s ease-in-out infinite', color: ORB_COLORS[0] },
    { size: '300px', top: '50%', left: '-8%', anim: 'floatOrb2 22s ease-in-out infinite', color: ORB_COLORS[1] },
    { size: '200px', top: '70%', right: '15%', anim: 'floatOrb 15s ease-in-out infinite reverse', color: ORB_COLORS[2] },
    { size: '500px', top: '-15%', left: '20%', anim: 'floatOrb2 25s ease-in-out infinite', color: ORB_COLORS[0] },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: orb.size,
          height: orb.size,
          top: orb.top,
          [orb.left ? 'left' : 'right']: orb.left || orb.right,
          borderRadius: '50%',
          background: orb.color,
          animation: orb.anim,
          willChange: 'transform',
        }} />
      ))}
    </div>
  )
}

function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!ref.current) return
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      ref.current.style.background = `radial-gradient(600px at ${x * 100}% ${y * 100}%, oklch(46% 0.19 260 / 0.04) 0%, transparent 70%)`
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div ref={ref} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
      transition: 'background 0.4s',
    }} />
  )
}

function DiamondShower() {
  const diamonds = [
    { left: '8%', size: '6px', delay: '2s', duration: '22s', color: 'var(--primary)' },
    { left: '22%', size: '10px', delay: '6s', duration: '28s', color: 'var(--gold)' },
    { left: '38%', size: '5px', delay: '1s', duration: '18s', color: 'var(--ok)' },
    { left: '52%', size: '8px', delay: '9s', duration: '24s', color: 'var(--primary)' },
    { left: '68%', size: '12px', delay: '4s', duration: '30s', color: 'var(--gold)' },
    { left: '82%', size: '7px', delay: '11s', duration: '20s', color: 'var(--ok)' },
    { left: '15%', size: '9px', delay: '14s', duration: '26s', color: 'var(--gold)' },
    { left: '45%', size: '11px', delay: '3s', duration: '32s', color: 'var(--primary)' },
    { left: '75%', size: '5px', delay: '8s', duration: '17s', color: 'var(--ok)' },
    { left: '90%', size: '14px', delay: '12s', duration: '34s', color: 'var(--primary)' },
    { left: '60%', size: '7px', delay: '16s', duration: '23s', color: 'var(--gold)' },
    { left: '35%', size: '9px', delay: '5s', duration: '19s', color: 'var(--ok)' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {diamonds.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: '-20px', left: d.left,
          width: d.size, height: d.size,
          background: d.color,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          opacity: 0,
          animation: `driftDiamond ${d.duration} ${d.delay} linear infinite`,
        }} />
      ))}
    </div>
  )
}

/* ΓöÇΓöÇ PAGE ΓöÇΓöÇ */

export default function Home() {
  return (
    <main
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}
    >
      <div className="geo-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <FloatingOrbs />
      <DiamondShower />
      <MouseGlow />

      {/* ΓöÇΓöÇ HERO ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '5rem 0 6rem' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '85%',
          background: 'linear-gradient(170deg, oklch(97% 0.008 85) 0%, var(--bg) 40%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '4rem',
            alignItems: 'stretch',
          }}>
            {/* Hero Text */}
            <div>
              <div className="anim-fade" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em',
                color: 'var(--gold)',
                padding: '0.45rem 1.25rem', borderRadius: '9999px',
                border: '1px solid oklch(68% 0.17 70 / 0.25)',
                background: 'var(--gold-soft)', marginBottom: '2rem',
                boxShadow: '0 0 20px var(--gold-glow)',
              }}>
                <span style={{
                  display: 'inline-block',
                  animation: 'pulse-soft 2s ease-in-out infinite',
                  fontSize: '0.7rem',
                }}>Γ£ª</span>
                ┘à╪▒┘â╪▓ ╪¿╪¬╪▒╪¼┘è ┘ä┘ä╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ╪º┘ä╪╖╪¿┘è╪⌐ ╪º┘ä╪¬╪«╪╡╪╡┘è╪⌐
              </div>

              <h1 className="anim-fade-1" style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: 'var(--fg)',
                marginBottom: '1.5rem',
              }}>
                ╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ╪». ╪«╪º┘ä╪» ╪¿╪¬╪▒╪¼┘è{' '}
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, oklch(55% 0.22 260) 50%, var(--primary-down) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 4s ease-in-out infinite',
                  display: 'inline-block',
                  paddingTop: '10px',
                }}>
                  ╪º╪│╪¬╪┤╪º╪▒┘è ╪¼╪▒╪º╪¡╪⌐ ╪º┘ä╪╣╪╕╪º┘à ┘ê╪º┘ä┘à┘ü╪º╪╡┘ä
                </span>
                <span style={{
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
                  fontWeight: 500,
                  color: 'var(--fg-muted)',
                  display: 'block',
                  marginTop: '0.75rem',
                  letterSpacing: '-0.01em',
                }}>
                  ╪▒╪╣╪º┘è╪⌐ ╪╖╪¿┘è╪⌐ ┘ü╪º╪ª┘é╪⌐ ┘ä╪¼╪▒╪º╪¡╪º╪¬ ╪º┘ä╪▒┘â╪¿╪⌐ ┘ê╪º┘ä┘à┘ü╪º╪╡┘ä ╪º┘ä╪╡┘å╪º╪╣┘è╪⌐ ┘ê╪º┘ä┘à┘å╪º╪╕┘è╪▒ ╪ú┘ê┘å┘ä╪º┘è┘å ┘à┘å ┘à┘å╪▓┘ä┘â
                </span>
              </h1>

              <p className="anim-fade-2" style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                lineHeight: 1.9,
                marginBottom: '2.5rem',
                maxWidth: '540px',
              }}>
                ╪ú┘ê┘ä ┘à┘å╪╡╪⌐ ╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ╪╖╪¿┘è╪⌐ ┘à╪¬┘â╪º┘à┘ä╪⌐ ╪¬╪¼┘à╪╣ ╪¿┘è┘å ╪«╪¿╪▒╪⌐ ╪º┘ä╪º╪│╪¬╪┤╪º╪▒┘è┘è┘å ┘ê╪│┘ç┘ê┘ä╪⌐ ╪º┘ä╪¬┘é┘å┘è╪⌐. ╪º╪¡╪¼╪▓ ╪º╪│╪¬╪┤╪º╪▒╪¬┘â ╪º┘ä┘à╪▒╪ª┘è╪⌐ ┘ü┘è ╪»┘é╪º╪ª┘é╪î ┘ê╪º╪▒┘ü╪╣ ┘ü╪¡┘ê╪╡╪º╪¬┘â ┘ê╪¬┘é╪º╪▒┘è╪▒┘â ╪¿╪«╪╡┘ê╪╡┘è╪⌐ ╪¬╪º┘à╪⌐ ┘ê╪¬┘ä┘é┘ë ╪º┘ä╪¬╪┤╪«┘è╪╡ ┘ê╪º┘ä╪«╪╖╪⌐ ╪º┘ä╪╣┘ä╪º╪¼┘è╪⌐ ┘à┘å ┘à┘å╪▓┘ä┘â.
              </p>

              <div className="anim-fade-2" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/consultation/new" className="btn-primary" style={{
                  fontSize: '1.1rem',
                  padding: '1.1rem 2.8rem',
                  gap: '0.75rem',
                  borderRadius: 'var(--r-lg)',
                }}>
                  ╪º╪¿╪»╪ú ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪⌐ ╪º┘ä╪ó┘å
                  <span style={{ fontSize: '1.2rem', lineHeight: 1, display: 'inline-block', transform: 'translateX(0)', transition: 'transform 200ms' }}
                  >ΓåÉ</span>
                </Link>
                <Link href="#about-section" className="btn-ghost" style={{ fontSize: '0.95rem', padding: '0.9rem 1.75rem' }}>
                  ╪¬╪╣╪▒┘æ┘ü ╪╣┘ä┘ë ╪º┘ä╪»┘â╪¬┘ê╪▒
                </Link>
              </div>


            </div>

            {/* Doctor Photo Column */}
            <div className="anim-scale" style={{
              width: '100%',
              height: '100%',
              minHeight: '520px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div className="photo-frame" style={{
                width: '70%',
                height: '70%',
                position: 'relative',
                boxShadow: '0 16px 64px oklch(0% 0 0 / 0.1), 0 4px 16px oklch(60% 0.08 60 / 0.08)',
                transform: 'perspective(1000px) rotateY(-2deg)',
                transition: 'transform 500ms var(--ease-out)',
                flexGrow: 1,
              }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(0deg)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(-2deg)'}
              >
                <div style={{
                  position: 'absolute', inset: 2,
                  background: 'linear-gradient(180deg, transparent 40%, oklch(15% 0.015 265 / 0.35) 100%)',
                  pointerEvents: 'none', zIndex: 2, borderRadius: 'var(--r-xl)',
                }} />
                
                <Image
                  src="/main_image.jpeg"
                  alt="╪». ╪«╪º┘ä╪» ╪¿╪¬╪▒╪¼┘è"
                  fill
                  sizes="(max-width: 900px) 100vw, 550px"
                  style={{ objectFit: 'cover', scale: '1.02', borderRadius: 'var(--r-xl)' }}
                  priority
                />

                <div style={{
                  position: 'absolute', bottom: 2, left: 2, right: 2, height: '4px',
                  background: 'linear-gradient(90deg, var(--gold) 0%, oklch(68% 0.17 70 / 0.4) 50%, var(--primary) 100%)',
                  zIndex: 3, borderRadius: '0 0 var(--r-xl) var(--r-xl)',
                }} />
                
                {/* Decorative gold corner accents */}
                <div style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 3,
                  width: '20px', height: '20px',
                  borderTop: '2px solid var(--gold)',
                  borderRight: '2px solid var(--gold)',
                  opacity: 0.4,
                  borderRadius: '0 4px 0 0',
                }} />
                <div style={{
                  position: 'absolute', bottom: '1.25rem', left: '1.25rem', zIndex: 3,
                  width: '20px', height: '20px',
                  borderBottom: '2px solid var(--gold)',
                  borderLeft: '2px solid var(--gold)',
                  opacity: 0.4,
                  borderRadius: '0 0 0 4px',
                }} />

                {/* Floating Profile Card */}
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  textAlign: 'center',
                  padding: '1.1rem 1.5rem',
                  background: 'oklch(100% 0 0 / 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--border-faint)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 4,
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)' }}>╪». ╪«╪º┘ä╪» ╪¿╪¬╪▒╪¼┘è</div>
                  <div style={{
                    fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '0.2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--ok)', display: 'inline-block',
                      animation: 'pulse-soft 2s ease-in-out infinite',
                      boxShadow: '0 0 6px var(--ok-soft)',
                    }} />
                    ╪▒╪ª┘è╪│ ┘à╪¼┘ä╪│ ╪Ñ╪»╪º╪▒╪⌐ ╪º┘ä┘à╪▒┘â╪▓ ΓÇö ┘à╪¬╪º╪¡ ┘ä┘ä╪¡╪¼╪▓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇ HERO STATS SECTION ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 3, padding: '1.5rem 0 3rem' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{
              background: 'linear-gradient(135deg, oklch(100% 0 0 / 0.8) 0%, oklch(98.5% 0.004 85 / 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1.5px solid var(--border-accent)',
              borderRadius: 'var(--r-2xl)',
              boxShadow: 'var(--shadow-lg), 0 20px 50px oklch(60% 0.08 60 / 0.04)',
              padding: '3rem 2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2.5rem',
            }}>
              {stats.map(({ num, label, desc }, idx) => (
                <div key={label} style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  paddingLeft: idx < 2 ? '2.5rem' : '0',
                  borderLeft: idx < 2 ? '1px solid var(--border-faint)' : 'none',
                }}>
                  <div className="num" style={{
                    fontSize: 'clamp(3.5rem, 6vw, 4.8rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.0,
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}>
                    {num}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--fg)', marginBottom: '0.35rem' }}>{label}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--fg-muted)', lineHeight: 1.4, maxWidth: '280px' }}>{desc}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ΓöÇΓöÇ EXPERTISE BAR ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '0 0 5rem' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '2.5rem 4rem',
              padding: '2rem 2.5rem',
              background: 'oklch(100% 0 0 / 0.7)',
              backdropFilter: 'blur(16px)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border-faint)',
              boxShadow: 'var(--shadow-warm)',
            }}>
              {['╪¼╪▒╪º╪¡╪⌐ ╪º┘ä╪╣╪╕╪º┘à ┘ê╪º┘ä┘à┘ü╪º╪╡┘ä', '╪º┘ä┘à┘å╪º╪╕┘è╪▒ ╪º┘ä╪¼╪▒╪º╪¡┘è╪⌐', '╪╣┘ä╪º╪¼ ╪º┘ä╪ó┘ä╪º┘à ╪º┘ä┘à╪▓┘à┘å╪⌐', '╪¬╪ú┘ç┘è┘ä ┘à╪º ╪¿╪╣╪» ╪º┘ä╪╣┘à┘ä┘è╪º╪¬', '╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ╪ú┘ê┘å ┘ä╪º┘è┘å'].map((item, i) => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--fg-muted)',
                  transition: 'color 200ms',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: i === 0 ? 'var(--primary)' : 'var(--gold)',
                    flexShrink: 0,
                    animation: i === 0 ? 'shimmerGlow 3s ease-in-out infinite' : 'none',
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ ACHIEVEMENT COUNTERS ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '5rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              padding: '3rem',
              background: 'linear-gradient(135deg, oklch(46% 0.19 260 / 0.03), oklch(68% 0.17 70 / 0.03))',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border-accent)',
            }}>
              {[
                { end: 1500, label: '┘à╪▒┘è╪╢', suffix: '+', sub: '╪¬┘à╪¬ ╪º╪│╪¬╪┤╪º╪▒╪¬┘ç┘à' },
                { end: 35, label: '╪╣╪º┘à╪º┘ï', suffix: '+', sub: '╪«╪¿╪▒╪⌐ ┘ü┘è ╪º┘ä┘à╪¼╪º┘ä ╪º┘ä╪╖╪¿┘è' },
                { end: 98, label: '┘¬', suffix: '', sub: '┘å╪│╪¿╪⌐ ╪▒╪╢╪º ╪º┘ä┘à╪▒╪╢┘ë' },
                { end: 24, label: '╪│╪º╪╣╪⌐', suffix: '', sub: '╪º┘ä╪▒╪» ╪╣┘ä┘ë ╪º┘ä╪º╪│╪¬┘ü╪│╪º╪▒╪º╪¬' },
              ].map((c, i) => (
                <div key={c.label} style={{
                  textAlign: 'center',
                  padding: '1rem',
                  animation: `counterPop 0.5s var(--ease-out) ${0.15 * i}s both`,
                }}>
                  <div className="num" style={{
                    fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.15rem',
                    lineHeight: 1.1,
                  }}>
                    <AnimatedCounter end={c.end} suffix={c.suffix} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', marginTop: '0.05rem' }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ DOCTOR QUALIFICATIONS ΓöÇΓöÇ */}
      <section id="about-section" style={{ position: 'relative', zIndex: 2, padding: '5rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <ScrollReveal>
              <div>
                <SectionLabel>╪º┘ä┘à╪ñ┘ç┘ä╪º╪¬ ╪º┘ä╪╣┘ä┘à┘è╪⌐</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  ╪«╪¿╪▒╪⌐ ╪¬┘à╪¬╪» ┘ä╪ú┘â╪½╪▒ ┘à┘å <span style={{ color: 'var(--primary)' }}>╪½┘ä╪º╪½╪⌐ ╪╣┘é┘ê╪»</span>
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.9,
                  marginBottom: '2.5rem',
                }}>
                  ┘è╪¬┘à╪¬╪╣ ╪º┘ä╪»┘â╪¬┘ê╪▒ ╪«╪º┘ä╪» ╪¿╪¬╪▒╪¼┘è ╪¿╪│┘è╪▒╪⌐ ╪░╪º╪¬┘è╪⌐ ╪¡╪º┘ü┘ä╪⌐ ╪¿╪º┘ä╪Ñ┘å╪¼╪º╪▓╪º╪¬ ╪º┘ä╪ú┘â╪º╪»┘è┘à┘è╪⌐ ┘ê╪º┘ä╪╣┘à┘ä┘è╪⌐ ┘ü┘è ┘à╪¼╪º┘ä ╪¼╪▒╪º╪¡╪⌐ ╪º┘ä╪╣╪╕╪º┘à ┘ê╪º┘ä┘à┘ü╪º╪╡┘ä╪î ┘à╪╣ ╪ú┘â╪½╪▒ ┘à┘å 35 ╪╣╪º┘à╪º┘ï ┘à┘å ╪º┘ä╪«╪¿╪▒╪⌐ ╪º┘ä┘à╪¬╪▒╪º┘â┘à╪⌐.
                </p>
                <Link href="/consultation/new" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.85rem 1.75rem' }}>
                  ╪º╪¡╪¼╪▓ ╪º╪│╪¬╪┤╪º╪▒╪¬┘â
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {qualifications.map(q => (
                  <div key={q.title} style={{
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    padding: '1.25rem 1.5rem',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--border-faint)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 300ms var(--ease-spring), box-shadow 300ms',
                    cursor: 'default',
                  }}
                    onMouseOver={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(-6px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                    }}
                    onMouseOut={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)';
                    }}
                  >
                    <div style={{
                      minWidth: '3.5rem', textAlign: 'center',
                      padding: '0.35rem 0.5rem',
                      background: 'var(--primary-subtle)',
                      borderRadius: 'var(--r)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}>
                      {q.year}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.15rem' }}>{q.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--fg-dim)' }}>{q.inst}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ HOW IT WORKS ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>╪«╪╖┘ê╪º╪¬ ╪º┘ä╪¡╪¼╪▓</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '0.75rem',
            }}>
              ┘â┘è┘ü ╪¬╪╣┘à┘ä ╪º┘ä╪«╪»┘à╪⌐╪ƒ
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--fg-muted)',
              maxWidth: '520px',
              margin: '0 auto 4rem',
              lineHeight: 1.8,
            }}>
              ┘à┘å ╪º┘ä╪¬╪│╪¼┘è┘ä ╪Ñ┘ä┘ë ╪º┘ä╪¼┘ä╪│╪⌐ ┘à╪╣ ╪º┘ä╪»┘â╪¬┘ê╪▒ ┘ü┘è 4 ╪«╪╖┘ê╪º╪¬ ╪¿╪│┘è╪╖╪⌐
            </p>
          </ScrollReveal>

          <div className="steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '2.5rem', left: 'calc(12.5% + 1.5rem)',
              right: 'calc(12.5% + 1.5rem)', height: '2px',
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--border) 50%, var(--border) 100%)',
              zIndex: 0,
            }} />

            {steps.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <div style={{
                    width: '5rem', height: '5rem',
                    borderRadius: '50%',
                    background: i === 0 ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)' : 'var(--surface)',
                    border: i === 0 ? 'none' : '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: i === 0 ? 'white' : 'var(--fg-dim)',
                    boxShadow: i === 0 ? '0 4px 20px var(--primary-glow)' : 'var(--shadow-sm)',
                    transition: 'all 400ms var(--ease-spring)',
                    position: 'relative',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'scale(1.1)'
                      if (i !== 0) { el.style.borderColor = 'var(--primary)'; el.style.color = 'var(--primary)'; el.style.boxShadow = '0 4px 20px var(--primary-glow)' }
                    }}
                    onMouseOut={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'scale(1)'
                      if (i !== 0) { el.style.borderColor = 'var(--border)'; el.style.color = 'var(--fg-dim)'; el.style.boxShadow = 'var(--shadow-sm)' }
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.35rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--fg-dim)', lineHeight: 1.7, maxWidth: '220px', margin: '0 auto' }}>{item.desc}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ SERVICES ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, var(--bg) 0%, oklch(97% 0.008 85) 50%, var(--bg) 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>╪º┘ä╪¿╪º┘é╪º╪¬ ┘ê╪º┘ä╪ú╪│╪╣╪º╪▒</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '0.75rem',
            }}>
              ╪º╪«╪¬╪▒ ╪º┘ä╪¿╪º┘é╪⌐ ╪º┘ä┘à┘å╪º╪│╪¿╪⌐ ┘ä┘â
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--fg-muted)',
              maxWidth: '520px',
              margin: '0 auto 4rem',
              lineHeight: 1.8,
            }}>
              ╪º╪│╪¬╪┤╪º╪▒╪º╪¬ ┘à╪▒┘å╪⌐ ╪¿╪ú╪│╪╣╪º╪▒ ╪¬┘å╪º┘ü╪│┘è╪⌐ ╪¬┘å╪º╪│╪¿ ╪¼┘à┘è╪╣ ╪º┘ä╪¡╪º┘ä╪º╪¬
            </p>
          </ScrollReveal>

          <div className="pricing-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}>
            {services.map((svc, i) => (
              <ScrollReveal key={svc.title} delay={i * 100}>
                <div style={{
                  background: 'var(--surface)',
                  border: svc.popular ? '2px solid var(--primary)' : '1px solid var(--border-faint)',
                  borderRadius: 'var(--r-xl)',
                  padding: svc.popular ? '2.5rem 2rem' : '2rem',
                  boxShadow: svc.popular ? '0 8px 40px var(--primary-glow), 0 4px 16px oklch(0% 0 0 / 0.04)' : 'var(--shadow-warm)',
                  textAlign: 'right',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 400ms var(--ease-spring), box-shadow 400ms',
                }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-8px)'
                    el.style.boxShadow = svc.popular ? '0 12px 48px var(--primary-glow), 0 4px 16px oklch(0% 0 0 / 0.04)' : '0 12px 40px oklch(0% 0 0 / 0.1)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = svc.popular ? '0 8px 40px var(--primary-glow), 0 4px 16px oklch(0% 0 0 / 0.04)' : 'var(--shadow-warm)'
                  }}
                >
                  {/* Gold decorative corner */}
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    width: '24px', height: '24px',
                    borderTop: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderRight: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderRadius: '0 6px 0 0',
                    opacity: svc.popular ? 0.5 : 0.15,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '1rem', left: '1rem',
                    width: '24px', height: '24px',
                    borderBottom: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderLeft: svc.popular ? '2px solid var(--gold)' : '1px solid var(--border)',
                    borderRadius: '0 0 0 6px',
                    opacity: svc.popular ? 0.5 : 0.15,
                    pointerEvents: 'none',
                  }} />

                  {svc.popular && (
                    <>
                      <div style={{
                        position: 'absolute', top: '1.5rem', left: '-2.75rem',
                        transform: 'rotate(-45deg)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                        color: 'white', fontSize: '0.65rem', fontWeight: 700,
                        padding: '0.25rem 3.5rem', letterSpacing: '0.08em',
                      }}>
                        ╪º┘ä╪ú┘â╪½╪▒ ╪╖┘ä╪¿╪º┘ï
                      </div>
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        width: '120px', height: '120px',
                        background: 'radial-gradient(circle at top right, oklch(46% 0.19 260 / 0.06), transparent 70%)',
                        pointerEvents: 'none',
                      }} />
                    </>
                  )}
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
                    marginBottom: '0.5rem', letterSpacing: '0.05em',
                  }}>
                    {svc.popular ? 'ΓÇö ┘à╪╖┘ê┘æ╪▒' : 'ΓÇö ╪¿╪º┘é╪⌐'}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--fg)', marginBottom: '0.3rem' }}>{svc.title}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1rem', direction: 'ltr' }}>
                    <span className="num" style={{
                      fontSize: '2.8rem', fontWeight: 900,
                      letterSpacing: '-0.03em',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}>{svc.price}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--fg-dim)', fontWeight: 600 }}>{svc.period}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{svc.desc}</p>
                  <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '1.25rem', marginBottom: '1.75rem' }}>
                    {svc.features.map((f) => (
                      <div key={f} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        fontSize: '0.82rem', color: 'var(--fg-muted)',
                        padding: '0.35rem 0',
                      }}>
                        <span style={{ color: svc.popular ? 'var(--primary)' : 'var(--gold)', fontSize: '0.6rem', marginTop: '0.3rem' }}>Γùê</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/consultation/new"
                    className={svc.popular ? 'btn-primary' : 'btn-ghost'}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.9rem' }}
                  >
                    {svc.popular ? '╪º╪¡╪¼╪▓ ╪º┘ä╪ó┘å' : '╪º╪«╪¬╪▒ ╪º┘ä╪¿╪º┘é╪⌐'}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ WHY CHOOSE US ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container">
          <div className="features-layout" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <ScrollReveal>
              <div>
                <SectionLabel>┘ä┘à╪º╪░╪º ╪». ╪«╪º┘ä╪» ╪¿╪¬╪▒╪¼┘è╪ƒ</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  ╪▒╪╣╪º┘è╪⌐ ╪╖╪¿┘è╪⌐ ╪¿┘à╪╣╪º┘è┘è╪▒ ╪╣╪º┘ä┘à┘è╪⌐ ΓÇö ┘à┘å ┘à┘å╪▓┘ä┘â
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.9,
                  marginBottom: '2.5rem',
                }}>
                  ┘å╪╢╪╣┘â ┘ü┘è ┘é┘ä╪¿ ╪º┘ä╪▒╪╣╪º┘è╪⌐ ╪º┘ä╪╡╪¡┘è╪⌐. ┘à┘å╪╡╪⌐ ┘à╪¬┘â╪º┘à┘ä╪⌐ ╪¬╪¼┘à╪╣ ╪¿┘è┘å ╪º┘ä╪«╪¿╪▒╪⌐ ╪º┘ä╪╖╪¿┘è╪⌐ ┘ê╪º┘ä╪¬┘é┘å┘è╪⌐ ╪º┘ä╪¡╪»┘è╪½╪⌐ ┘ä╪¬┘ê┘ü┘è╪▒ ╪¬╪¼╪▒╪¿╪⌐ ╪º╪│╪¬╪┤╪º╪▒┘è╪⌐ ╪│┘ä╪│╪⌐ ┘ê╪ó┘à┘å╪⌐.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href="/consultation/new" className="btn-primary" style={{ fontSize: '0.95rem', padding: '0.9rem 2rem' }}>
                    ╪º╪¿╪»╪ú ╪º┘ä╪ó┘å
                  </Link>
                </div>

                <div className="mini-stats" style={{
                  marginTop: '3rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                }}>
                  {[
                    { num: '1,500+', label: '┘à╪▒┘è╪╢' },
                    { num: '98%', label: '╪▒╪╢╪º ╪º┘ä┘à╪▒╪╢┘ë' },
                    { num: '24', label: '╪│╪º╪╣╪⌐ ┘ä┘ä╪▒╪»' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: '1.25rem', textAlign: 'center',
                      background: 'var(--surface)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border-faint)',
                      transition: 'transform 300ms var(--ease-spring)',
                    }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                    >
                      <div className="num" style={{
                        fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)',
                        marginBottom: '0.15rem',
                        fontFamily: 'var(--font-inter), sans-serif',
                      }}>{s.num}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--fg-dim)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
            }}>
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={(i % 4) * 80}>
                  <div style={{
                    padding: '1.5rem',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--border-faint)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 350ms var(--ease-spring), box-shadow 350ms, border-color 350ms',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(-6px)'
                      el.style.boxShadow = 'var(--shadow-md)'
                      el.style.borderColor = 'var(--border-accent)'
                    }}
                    onMouseOut={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(0)'
                      el.style.boxShadow = 'var(--shadow-sm)'
                      el.style.borderColor = 'var(--border-faint)'
                    }}
                  >
                    {/* Hover shimmer overlay */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(135deg, transparent 0%, var(--primary-subtle) 50%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 500ms',
                      pointerEvents: 'none',
                      borderRadius: 'var(--r-lg)',
                    }}
                      onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                      onMouseOut={e => (e.currentTarget.style.opacity = '0')}
                    />
                    <div style={{
                      width: '2.75rem', height: '2.75rem',
                      borderRadius: 'var(--r)',
                      background: 'linear-gradient(135deg, var(--primary-subtle) 0%, oklch(46% 0.19 260 / 0.08) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--primary)',
                      marginBottom: '0.75rem',
                      position: 'relative',
                    }}>
                      {f.icon}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.3rem', position: 'relative' }}>{f.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--fg-dim)', lineHeight: 1.7, position: 'relative' }}>{f.desc}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ TESTIMONIALS ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, var(--bg) 0%, oklch(97% 0.008 85) 50%, var(--bg) 100%)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <ScrollReveal>
            <SectionLabel>╪ó╪▒╪º╪í ╪º┘ä┘à╪▒╪╢┘ë</SectionLabel>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              marginBottom: '3rem',
            }}>
              ┘à╪º╪░╪º ┘è┘é┘ê┘ä ┘à╪▒╪╢╪º┘å╪º╪ƒ
            </h2>
          </ScrollReveal>

          <div className="testimonials-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}>
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 120}>
                <div style={{
                  padding: '2rem',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--border-faint)',
                  boxShadow: 'var(--shadow-warm)',
                  textAlign: 'right',
                  position: 'relative',
                  transition: 'transform 350ms var(--ease-spring), box-shadow 350ms, border-color 350ms',
                }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'oklch(68% 0.17 70 / 0.2)';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-warm)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)';
                  }}
                >
                  {/* Gold accent top border */}
                  <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                    opacity: 0.3,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', top: '1rem', left: '1.5rem',
                    fontSize: '4rem', lineHeight: 0.8,
                    color: 'var(--primary-soft)',
                    fontWeight: 900,
                    fontFamily: 'serif',
                    opacity: 0.5,
                  }}>
                    &quot;
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.9,
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {t.text}
                  </p>
                  <div style={{
                    borderTop: '1px solid var(--border-faint)',
                    paddingTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}>
                    <div style={{
                      width: '2.75rem', height: '2.75rem',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}>
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--fg)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--fg-dim)' }}>{t.title}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ HEALTH RESOURCES ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <SectionLabel>╪º┘ä┘à┘â╪¬╪¿╪⌐ ╪º┘ä╪╖╪¿┘è╪⌐</SectionLabel>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: '0.75rem',
              }}>
                ┘à┘ê╪º╪▒╪» ╪╡╪¡┘è╪⌐ ┘ä┘â
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--fg-muted)',
                maxWidth: '520px',
                margin: '0 auto 4rem',
                lineHeight: 1.8,
              }}>
                ┘à┘é╪º┘ä╪º╪¬ ┘ê╪Ñ╪▒╪┤╪º╪»╪º╪¬ ╪╖╪¿┘è╪⌐ ┘à┘å ╪Ñ╪╣╪»╪º╪» ╪». ╪«╪º┘ä╪» ╪¿╪¬╪▒╪¼┘è ┘ä┘à╪│╪º╪╣╪»╪¬┘â ┘ü┘è ╪▒╪¡┘ä╪⌐ ╪╣┘ä╪º╪¼┘â
              </p>
            </div>
          </ScrollReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}>
            {ARTICLES.map((r, i) => (
              <ScrollReveal key={r.title} delay={i * 100}>
                <Link href={`/articles/${r.slug}`} style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '2rem',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--border-faint)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'right',
                  transition: 'transform 350ms var(--ease-spring), box-shadow 350ms, border-color 350ms',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-6px)'
                    el.style.boxShadow = 'var(--shadow-md)'
                    el.style.borderColor = 'var(--border-accent)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'var(--shadow-sm)'
                    el.style.borderColor = 'var(--border-faint)'
                  }}
                >
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)',
                    padding: '0.2rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-accent)',
                    background: 'var(--primary-subtle)',
                    display: 'inline-block',
                    marginBottom: '1rem',
                  }}>
                    {r.tag}
                  </div>
                  <div style={{
                    fontSize: '1rem', fontWeight: 800, color: 'var(--fg)',
                    marginBottom: '0.5rem', lineHeight: 1.4,
                  }}>
                    {r.title}
                  </div>
                  <p style={{
                    fontSize: '0.82rem', color: 'var(--fg-muted)',
                    lineHeight: 1.7, marginBottom: '1.25rem',
                  }}>
                    {r.summary}
                  </p>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--fg-dim)',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 700 }}>{r.readTime}</span> ╪»┘é╪º╪ª┘é ┘é╪▒╪º╪í╪⌐
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ FAQ ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 0%, oklch(97% 0.008 85) 50%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="faq-layout" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '3rem',
            alignItems: 'start',
          }}>
            <ScrollReveal>
              <div>
                <SectionLabel>╪º┘ä╪ú╪│╪ª┘ä╪⌐ ╪º┘ä╪┤╪º╪ª╪╣╪⌐</SectionLabel>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  ┘â┘ä ┘à╪º ╪¬╪▒┘è╪» ┘à╪╣╪▒┘ü╪¬┘ç ╪╣┘å ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪⌐
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.8,
                }}>
                  ╪Ñ╪¼╪º╪¿╪º╪¬ ╪│╪▒┘è╪╣╪⌐ ╪╣┘å ╪ú┘â╪½╪▒ ╪º┘ä╪ú╪│╪ª┘ä╪⌐ ╪┤┘è┘ê╪╣╪º┘ï. ╪Ñ┘å ┘â╪º┘å ┘ä╪»┘è┘â ╪│╪ñ╪º┘ä ╪ó╪«╪▒╪î ┘ä╪º ╪¬╪¬╪▒╪»╪» ┘ü┘è ╪º┘ä╪¬┘ê╪º╪╡┘ä ┘à╪╣┘å╪º.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {faqs.map(item => (
                  <details key={item.q} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-faint)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0',
                    overflow: 'hidden',
                    transition: 'box-shadow 300ms, border-color 300ms',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <summary style={{
                      padding: '1.35rem 1.5rem',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--fg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      listStyle: 'none',
                    }}>
                      {item.q}
                      <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--primary)',
                        transition: 'transform 300ms var(--ease-spring)',
                        flexShrink: 0,
                        fontWeight: 700,
                      }}>
                        +
                      </span>
                    </summary>
                    <div style={{
                      padding: '0 1.5rem 1.35rem',
                      fontSize: '0.87rem',
                      color: 'var(--fg-muted)',
                      lineHeight: 1.9,
                      borderTop: '1px solid var(--border-faint)',
                      paddingTop: '1rem',
                      marginTop: '0',
                    }}>
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ΓöÇΓöÇ FINAL CTA ΓöÇΓöÇ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '6rem 0' }}>
        <div className="container" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div style={{
              padding: '5rem 4rem',
              borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-up) 50%, oklch(35% 0.22 260) 100%)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 64px var(--primary-glow)',
            }}>
              <div style={{
                position: 'absolute', top: '-40%', right: '-10%',
                width: '400px', height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, oklch(100% 0 0 / 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'floatOrb 20s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', bottom: '-30%', left: '-5%',
                width: '300px', height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, oklch(100% 0 0 / 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'floatOrb2 25s ease-in-out infinite',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'oklch(100% 0 0 / 0.8)',
                  padding: '0.4rem 1.1rem', borderRadius: '9999px',
                  border: '1px solid oklch(100% 0 0 / 0.2)',
                  background: 'oklch(100% 0 0 / 0.08)',
                  marginBottom: '1.5rem',
                }}>
                  <span style={{ fontSize: '0.6rem', animation: 'pulse-soft 2s ease-in-out infinite' }}>Γùç</span>
                  ╪º╪¿╪»╪ú ╪▒╪¡┘ä╪⌐ ╪╣┘ä╪º╪¼┘â ╪º┘ä┘è┘ê┘à
                </div>
                <h2 style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  color: 'white',
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                }}>
                  ╪º╪│╪¬╪┤╪▒ ┘å╪«╪¿╪⌐ ╪º┘ä╪ú╪╖╪¿╪º╪í ┘à┘å ┘à┘å╪▓┘ä┘â ╪º┘ä┘è┘ê┘à
                </h2>
                <p style={{
                  fontSize: '1.05rem',
                  color: 'oklch(100% 0 0 / 0.75)',
                  lineHeight: 1.8,
                  maxWidth: '520px',
                  margin: '0 auto 2rem',
                }}>
                  ╪º╪¡╪¼╪▓ ╪º╪│╪¬╪┤╪º╪▒╪¬┘â ╪º┘ä╪ó┘å ╪«┘ä╪º┘ä ╪»┘é╪º╪ª┘é ┘ê╪º╪«╪¬╪▒ ╪╖╪¿┘è╪¿┘â ╪º┘ä╪º╪│╪¬╪┤╪º╪▒┘è ╪º┘ä┘à┘ü╪╢┘ä. ╪▒╪╣╪º┘è╪⌐ ╪╖╪¿┘è╪⌐ ╪¬╪«╪╡╪╡┘è╪⌐ ╪¿┘à╪╣╪º┘è┘è╪▒ ╪╣╪º┘ä┘à┘è╪⌐ ┘ü┘è ┘à╪¬┘å╪º┘ê┘ä ┘è╪»┘â.
                </p>
                <Link
                  href="/consultation/new"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1.1rem 3rem',
                    borderRadius: 'var(--r-lg)',
                    background: 'white',
                    color: 'var(--primary)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-tajawal), sans-serif',
                    boxShadow: '0 4px 14px oklch(0% 0 0 / 0.15)',
                    transition: 'transform 300ms var(--ease-spring), box-shadow 300ms',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px oklch(0% 0 0 / 0.2)';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px oklch(0% 0 0 / 0.15)';
                  }}
                >
                  ╪º╪¿╪»╪ú ╪º┘ä╪º╪│╪¬╪┤╪º╪▒╪⌐
                  <span style={{ fontSize: '1.2rem', lineHeight: 1, display: 'inline-block', transition: 'transform 200ms' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(-4px)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'}
                  >ΓåÉ</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </main>
  )
}
