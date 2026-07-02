'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangle, Send } from 'lucide-react'
import { getConsultationById, EnhancedConsultation } from '@/lib/consultationService'
import { subscribeToMessages, sendMessage, markRead, getMessages } from '@/lib/chatService'
import { ConsultationMessage, STATUS_CONFIG, ConsultationStatus } from '@/lib/supabase'

export default function PatientConsultationChat() {
  const params = useParams()
  const consultationId = params?.id as string

  const [consultation, setConsultation] = useState<EnhancedConsultation | null>(null)
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!consultationId) return
    let unsub: (() => void) | null = null
    ;(async () => {
      try {
        const c = await getConsultationById(consultationId)
        if (!c) {
          setError('الاستشارة غير موجودة')
          return
        }
        setConsultation(c)
        unsub = subscribeToMessages(consultationId, setMessages)
        await markRead(consultationId, 'patient')
      } catch {
        setError('تعذر تحميل المحادثة')
      } finally {
        setLoading(false)
      }
    })()
    return () => { if (unsub) unsub() }
  }, [consultationId])

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !consultationId) return
    setSending(true)
    try {
      await sendMessage(consultationId, input, 'patient')
      setInput('')
      const list = await getMessages(consultationId)
      setMessages(list)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="geo-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-warm" style={{ padding: '2rem 3rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--fg-muted)' }}>جاري تحميل المحادثة...</p>
        </div>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="geo-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-warm" style={{ padding: '2rem 3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--err)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={16} /> {error || 'الاستشارة غير موجودة'}
          </p>
          <Link href="/" className="btn-primary">العودة للرئيسية</Link>
        </div>
      </div>
    )
  }

  const status = consultation.status as ConsultationStatus
  const statusInfo = STATUS_CONFIG[status] || { label: status, badge: 'badge-primary' }
  const isClosed = status === 'declined' || status === 'cancelled' || status === 'completed'
  const needsReply = status === 'needs_info'

  return (
    <div className="geo-bg" style={{ minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--fg-dim)', textDecoration: 'none', fontWeight: 600 }}>
            الصفحة الرئيسية →
          </Link>
          <span className={statusInfo.badge}>{statusInfo.label}</span>
        </div>

        <div className="card-warm" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-faint)',
            background: 'linear-gradient(180deg, var(--primary-soft), transparent)',
          }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--fg)' }}>
              محادثة مع {consultation.doctor_name || 'الطبيب'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', marginTop: '0.3rem' }}>
              استشارتك رقم <span className="num" style={{ direction: 'ltr' }}>{consultation.id.slice(0, 8)}</span>
            </p>
          </div>

          {/* Banner: needs more info */}
          {needsReply && (
            <div style={{
              padding: '0.85rem 1.5rem',
              background: 'oklch(95% 0.05 80)',
              borderBottom: '1px solid oklch(70% 0.15 70 / 0.3)',
              fontSize: '0.85rem',
              color: 'oklch(40% 0.15 60)',
              fontWeight: 600,
            }}>
              <Send size={14} style={{ verticalAlign: 'middle', marginInlineEnd: '0.35rem' }} /> الطبيب يطلب منك معلومات إضافية. يرجى الرد أدناه.
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              padding: '1.5rem',
              minHeight: '320px',
              maxHeight: '60vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: 'var(--bg)',
            }}
          >
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--fg-dim)', fontSize: '0.85rem', padding: '2rem 0' }}>
                لا توجد رسائل بعد. سأبدأ أنا بالرد عليك قريباً.
              </p>
            )}

            {messages.map(m => {
              const isPatient = m.sender_role === 'patient'
              const isSystem = m.sender_role === 'system'
              if (isSystem) {
                return (
                  <div key={m.id} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--fg-dim)', padding: '0.4rem 0' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.3rem 0.85rem',
                      background: 'var(--surface)',
                      borderRadius: '9999px',
                      border: '1px solid var(--border-faint)',
                    }}>
                      {m.body}
                    </span>
                  </div>
                )
              }
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isPatient ? 'flex-end' : 'flex-start',
                    maxWidth: '78%',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '14px',
                    background: isPatient ? 'var(--primary)' : 'var(--surface)',
                    color: isPatient ? 'white' : 'var(--fg)',
                    border: isPatient ? 'none' : '1px solid var(--border-faint)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.75, marginBottom: '0.2rem' }}>
                    {isPatient ? 'أنت' : (consultation.doctor_name || 'الطبيب')}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.body}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.3rem' }}>
                    <span className="num" style={{ direction: 'ltr' }}>
                      {new Date(m.created_at).toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Composer */}
          {!isClosed && (
            <form
              onSubmit={handleSend}
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-faint)',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'flex-end',
                background: 'var(--surface)',
              }}
            >
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e as unknown as React.FormEvent)
                  }
                }}
                placeholder="اكتب رسالتك للطبيب..."
                rows={2}
                className="input"
                style={{ resize: 'none', flex: 1 }}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!input.trim() || sending}
                style={{ alignSelf: 'stretch', padding: '0 1.2rem' }}
              >
                {sending ? '...' : 'إرسال'}
              </button>
            </form>
          )}

          {isClosed && (
            <div style={{
              padding: '1rem 1.5rem',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--fg-muted)',
              borderTop: '1px solid var(--border-faint)',
              background: 'var(--bg)',
            }}>
              هذه المحادثة مغلقة.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
