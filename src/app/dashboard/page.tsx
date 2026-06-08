'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getConsultations, EnhancedConsultation } from '@/lib/consultationService'
import { DOCTORS } from '@/lib/doctors'

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  pending_payment: { label: 'في انتظار الدفع', badge: 'badge-gold' },
  pending_booking: { label: 'في انتظار الحجز', badge: 'badge-primary' },
  booked:          { label: 'محجوز', badge: 'badge-ok' },
}

export default function Dashboard() {
  const [consultations, setConsultations] = useState<EnhancedConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getConsultations()
        setConsultations(data)
      } catch (err) {
        console.error('Error loading consultations:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate status counts based on loaded data
  const statusCounts = (['pending_payment', 'pending_booking', 'booked'] as const).map(s => ({
    status: s,
    count: consultations.filter(c => c.status === s).length,
    ...STATUS_CONFIG[s],
  }))

  // Filter logic
  const filteredConsultations = consultations.filter(c => {
    const matchesSearch = c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.patient_phone.includes(searchQuery) ||
                          (c.chief_complaint || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    // Support fallback for older data that doesn't have doctor_id
    const doctorId = c.doctor_id || 'khalid'
    const matchesDoctor = selectedDoctorFilter === 'all' || doctorId === selectedDoctorFilter
    
    const matchesStatus = selectedStatusFilter === 'all' || c.status === selectedStatusFilter

    return matchesSearch && matchesDoctor && matchesStatus
  })

  // Loading Skeleton
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
            <p style={{ fontWeight: 700, color: 'var(--fg-muted)', fontFamily: 'var(--font-tajawal)' }}>جاري تحميل الاستشارات...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="geo-bg" style={{ minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container">

        {/* Header with decorative accent */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', right: '-0.75rem', top: '0.25rem',
              width: '4px', height: '28px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, var(--primary), var(--gold))',
            }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', marginRight: '0.75rem' }}>
              لوحة التحكم المشتركة
            </h1>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', marginTop: '0.2rem', marginRight: '0.75rem' }}>
              مركز بترجي للاستشارات الطبية — متابعة طلبات وحجوزات الاستشارات
            </p>
          </div>
          <div style={{
            fontSize: '0.72rem', color: 'var(--fg-dim)',
            padding: '0.4rem 0.85rem',
            background: 'var(--surface)',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border-faint)',
          }}>
            إجمالي: {consultations.length} استشارة
          </div>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {statusCounts.map(({ status, count, label }, i) => (
            <div
              key={status}
              className="card-warm"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.1rem',
                animation: `fadeUp 0.5s var(--ease-out) ${i * 0.1}s both`,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 300ms var(--ease-spring), box-shadow 300ms',
              }}
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === status ? 'all' : status)}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-warm)' }}
            >
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '3px',
                background: status === 'pending_payment'
                  ? 'linear-gradient(90deg, var(--gold), oklch(68% 0.17 70 / 0.3))'
                  : status === 'pending_booking'
                  ? 'linear-gradient(90deg, var(--primary), oklch(46% 0.19 260 / 0.3))'
                  : 'linear-gradient(90deg, var(--ok), oklch(50% 0.15 155 / 0.3))',
              }} />
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: status === 'pending_payment' ? 'var(--gold-soft)' : status === 'pending_booking' ? 'var(--primary-soft)' : 'var(--ok-soft)',
                border: `1px solid ${
                  status === 'pending_payment' ? 'oklch(68% 0.17 70 / 0.25)' :
                  status === 'pending_booking' ? 'var(--border-accent)' :
                  'oklch(50% 0.15 155 / 0.25)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                // Highlight active status filter
                boxShadow: selectedStatusFilter === status ? `0 0 12px ${status === 'pending_payment' ? 'var(--gold)' : status === 'pending_booking' ? 'var(--primary)' : 'var(--ok)'}` : 'none'
              }}>
                <span className="num" style={{
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  color: status === 'pending_payment' ? 'var(--gold)' : status === 'pending_booking' ? 'var(--primary)' : 'var(--ok)',
                }}>
                  {count}
                </span>
              </div>
              <div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--fg)',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--fg-dim)',
                  marginTop: '0.05rem',
                }}>
                  {count === 0 ? 'لا توجد' : count === 1 ? 'استشارة واحدة' : `${count} استشارات`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className="card-warm" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Search box */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <input
              className="input"
              placeholder="ابحث باسم المريض، الجوال، أو سبب الشكوى..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--fg-dim)',
              pointerEvents: 'none'
            }}>
              🔍
            </span>
          </div>

          {/* Selector filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--fg-muted)' }}>الطبيب الاستشاري:</span>
              <select
                className="input"
                style={{ width: '160px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                value={selectedDoctorFilter}
                onChange={e => setSelectedDoctorFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                {DOCTORS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--fg-muted)' }}>الحالة:</span>
              <select
                className="input"
                style={{ width: '150px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="pending_payment">في انتظار الدفع</option>
                <option value="pending_booking">في انتظار الحجز</option>
                <option value="booked">محجوز</option>
              </select>
            </div>

            {(searchQuery || selectedDoctorFilter !== 'all' || selectedStatusFilter !== 'all') && (
              <button
                className="btn-ghost"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDoctorFilter('all')
                  setSelectedStatusFilter('all')
                }}
                style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
              >
                إعادة ضبط
              </button>
            )}
          </div>
        </div>

        {/* Table card */}
        <div className="card-warm" style={{
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Subtle top border accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
            opacity: 0.15,
          }} />
          {!filteredConsultations.length ? (
            <div style={{
              padding: '5rem 2rem',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg)',
                border: '1px solid var(--border-faint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--fg-dim)',
                fontSize: '1.5rem',
              }}>
                —
              </div>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                لا توجد استشارات مطابقة لمعايير البحث
              </p>
              <p style={{ color: 'var(--fg-dim)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
                جرب تعديل خيارات التصفية أو البحث في الأعلى
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['المريض', 'الطبيب المختص', 'سبب الاستشارة', 'الحالة', 'التاريخ', ''].map(h => (
                      <th key={h} style={{
                        padding: '1rem 1.25rem',
                        textAlign: 'right',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--fg-dim)',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                        background: 'oklch(97% 0.004 85)',
                        textTransform: 'uppercase',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredConsultations.map((c, i) => {
                    const config = STATUS_CONFIG[c.status]
                    
                    // Match assigned doctor
                    const doctorId = c.doctor_id || 'khalid'
                    const assignedDoc = DOCTORS.find(d => d.id === doctorId) || DOCTORS[0]
                    
                    return (
                      <tr key={c.id} style={{
                        borderBottom: i < filteredConsultations.length - 1 ? '1px solid var(--border-faint)' : 'none',
                        transition: 'background 200ms',
                        animation: `fadeUp 0.4s var(--ease-out) ${i * 0.03}s both`,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'oklch(97% 0.004 85)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                        
                        {/* Patient */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--fg)' }}>
                            {c.patient_name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--fg-dim)', direction: 'ltr', textAlign: 'right', marginTop: '0.15rem' }}>
                            {c.patient_phone} • {c.patient_age} سنة
                          </div>
                        </td>

                        {/* Doctor */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '1px solid var(--border)',
                              position: 'relative',
                              flexShrink: 0
                            }}>
                              <Image
                                src={assignedDoc.image}
                                alt={assignedDoc.name}
                                fill
                                sizes="28px"
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--fg)' }}>
                                {c.doctor_name || assignedDoc.name}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 500 }}>
                                {c.specialty || assignedDoc.specialty}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Complaint */}
                        <td style={{
                          padding: '1rem 1.25rem',
                          color: 'var(--fg-muted)',
                          fontSize: '0.82rem',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {c.chief_complaint}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={config?.badge || 'badge-primary'}>
                            {config?.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="num" style={{
                          padding: '1rem 1.25rem',
                          color: 'var(--fg-dim)',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          direction: 'ltr',
                        }}>
                          {new Date(c.created_at).toLocaleDateString('ar-SA')}
                        </td>

                        {/* View Button */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <Link
                            href={`/dashboard/${c.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: 'var(--primary)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              padding: '0.4rem 0.85rem',
                              borderRadius: 'var(--r-sm)',
                              background: 'var(--primary-soft)',
                              border: '1px solid var(--border-accent)',
                              transition: 'all 250ms var(--ease-spring)',
                            }}
                          >
                            عرض التفاصيل
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
