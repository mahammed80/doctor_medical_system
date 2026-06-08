'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { getConsultationById, getConsultationFiles, EnhancedConsultation } from '@/lib/consultationService'
import { DOCTORS } from '@/lib/doctors'
import { ConsultationFile } from '@/lib/supabase'

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  pending_payment: { label: 'في انتظار الدفع', badge: 'badge-gold' },
  pending_booking: { label: 'في انتظار الحجز', badge: 'badge-primary' },
  booked:          { label: 'محجوز', badge: 'badge-ok' },
}

export default function ConsultationDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  
  const [consultation, setConsultation] = useState<EnhancedConsultation | null>(null)
  const [files, setFiles] = useState<ConsultationFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    async function loadData() {
      try {
        const doc = await getConsultationById(id)
        if (!doc) {
          setError(true)
          return
        }
        setConsultation(doc)
        
        const fileList = await getConsultationFiles(id)
        setFiles(fileList)
      } catch (err) {
        console.error('Error loading consultation details:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="geo-bg" style={{ minHeight: '100vh', padding: '3rem 0' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '10rem' }}>
          <div className="card-warm" style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem' }}>
            <span style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid var(--primary-soft)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1.7s linear infinite',
              marginBottom: '1rem',
            }} />
            <p style={{ fontWeight: 700, color: 'var(--fg-muted)' }}>جاري تحميل تفاصيل الاستشارة...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="geo-bg" style={{ minHeight: '100vh', padding: '3rem 0' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '8rem' }}>
          <div className="card-warm" style={{ maxWidth: '450px', margin: '0 auto', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>الاستشارة غير موجودة</h2>
            <p style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              لم نتمكن من العثور على ملف الاستشارة المطلوب. قد يكون قد تم حذفه أو أن الرابط غير صحيح.
            </p>
            <Link href="/dashboard" className="btn-primary" style={{ fontSize: '0.9rem' }}>
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const patientFields = [
    { label: 'الاسم الكامل', value: consultation.patient_name },
    { label: 'رقم الجوال', value: consultation.patient_phone, dir: 'ltr' as const, num: true },
    { label: 'العمر', value: `${consultation.patient_age} سنة`, num: true },
    { label: 'سبب الاستشارة', value: consultation.chief_complaint },
    { label: 'التاريخ المرضي', value: consultation.medical_history || 'لا يوجد' },
    { label: 'الأدوية الحالية', value: consultation.current_medications || 'لا يوجد' },
  ]

  const config = STATUS_CONFIG[consultation.status]
  
  // Find doctor info
  const doctorId = consultation.doctor_id || 'khalid'
  const assignedDoc = DOCTORS.find(d => d.id === doctorId) || DOCTORS[0]

  return (
    <div className="geo-bg" style={{ minHeight: '100vh', padding: '3rem 0', position: 'relative' }}>
      {/* Diamond stamp watermarks */}
      <div className="diamond-stamp" style={{ top: '10%', left: '-10%' }}>◇</div>
      <div className="diamond-stamp" style={{ bottom: '10%', right: '-10%', transform: 'rotate(15deg)' }}>◇</div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Back link */}
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--fg-dim)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '2rem',
            transition: 'color 200ms',
            padding: '0.4rem 0',
          }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1, marginLeft: '0.25rem' }}>→</span>
          العودة للوحة التحكم
        </Link>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ position: 'relative' }}>
            {/* Decorative accent line */}
            <div style={{
              position: 'absolute', right: '-0.75rem', top: '0.25rem',
              width: '4px', height: '28px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, var(--primary), var(--gold))',
            }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', marginRight: '0.75rem' }}>
              تفاصيل استشارة: {consultation.patient_name}
            </h1>
            <div style={{ marginTop: '0.5rem', marginRight: '0.75rem' }}>
              <span className={config?.badge || 'badge-primary'}>
                {config?.label}
              </span>
            </div>
          </div>
          <span className="num" style={{
            fontSize: '0.78rem',
            color: 'var(--fg-dim)',
            direction: 'ltr',
            padding: '0.4rem 0.85rem',
            background: 'var(--bg)',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border-faint)',
            whiteSpace: 'nowrap',
          }}>
            {new Date(consultation.created_at).toLocaleString('ar-SA')}
          </span>
        </div>

        {/* Assigned Doctor Card - visual highlight */}
        <div className="card-warm" style={{
          marginBottom: '1.5rem',
          padding: '1.25rem 1.5rem',
          border: '1.5px solid var(--border-accent)',
          background: 'var(--primary-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle gold decoration */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            opacity: 0.3,
          }} />

          {/* Doctor Avatar */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid var(--primary)',
            position: 'relative',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Image
              src={assignedDoc.image}
              alt={assignedDoc.name}
              fill
              sizes="60px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              الطبيب الاستشاري المعالج
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--fg)', marginTop: '0.15rem' }}>
              {consultation.doctor_name || assignedDoc.name}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', fontWeight: 500, marginTop: '0.1rem' }}>
              {consultation.specialty || assignedDoc.specialty} • {assignedDoc.title}
            </p>
          </div>
          
          {consultation.calendly_event_url && (
            <a
              href={consultation.calendly_event_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{
                marginRight: 'auto',
                fontSize: '0.75rem',
                padding: '0.45rem 1rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                whiteSpace: 'nowrap'
              }}
            >
              رابط موعد Calendly ↗
            </a>
          )}
        </div>

        {/* Patient info */}
        <div className="card-warm" style={{
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            opacity: 0.2,
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '4px',
              height: '20px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, var(--primary) 0%, var(--gold) 100%)',
            }} />
            <h2 style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--fg-muted)',
            }}>
              بيانات المريض والشكوى الطبية
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr',
            gap: '0.5px',
            background: 'var(--border-faint)',
            borderRadius: 'var(--r)',
            overflow: 'hidden',
          }}>
            {patientFields.map(({ label, value, dir, num }) => (
              <div key={label} style={{
                display: 'contents',
              }}>
                <div style={{
                  padding: '0.85rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--fg-dim)',
                  background: 'var(--surface)',
                }}>
                  {label}
                </div>
                <div className={num ? 'num' : ''} style={{
                  padding: '0.85rem 1rem',
                  fontSize: '0.88rem',
                  color: 'var(--fg)',
                  background: 'var(--surface)',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  ...(dir === 'ltr' ? { direction: 'ltr' as const, textAlign: 'left' as const } : {}),
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Files */}
        <div className="card-warm" style={{
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            opacity: 0.2,
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '4px',
              height: '20px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, var(--gold) 0%, var(--primary) 100%)',
            }} />
            <h2 style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--fg-muted)',
            }}>
              الملفات الطبية والأشعة المرفقة
            </h2>
          </div>

          {!files?.length ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--bg)',
              borderRadius: 'var(--r)',
              border: '1px dashed var(--border)',
              transition: 'border-color 300ms',
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <p style={{ color: 'var(--fg-dim)', fontSize: '0.9rem' }}>
                لم يقم المريض بإرفاق أي ملفات طبية.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {files.map((f, i) => (
                <a
                  key={f.id}
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    background: 'var(--bg)',
                    borderRadius: 'var(--r)',
                    textDecoration: 'none',
                    border: '1px solid var(--border-faint)',
                    transition: 'all 250ms var(--ease-spring)',
                    animation: `fadeUp 0.4s var(--ease-out) ${i * 0.05}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.background = 'var(--surface-up)'; e.currentTarget.style.transform = 'translateX(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-faint)'; e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.transform = 'translateX(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', flex: 1 }}>
                    <span style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'var(--primary-soft)',
                      border: '1px solid var(--border-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      flexShrink: 0,
                    }}>
                      {f.file_name.split('.').pop()?.toUpperCase()}
                    </span>
                    <span style={{
                      color: 'var(--fg)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {f.file_name}
                    </span>
                  </div>
                  <span style={{
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    فتح الملف ←
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
