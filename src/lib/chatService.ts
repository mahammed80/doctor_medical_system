import { supabase, ConsultationMessage, SenderRole, MessageAttachment } from './supabase'
import { isDemoMode } from './demoMode'

const POLL_INTERVAL_MS = 5000

const isBrowser = typeof window !== 'undefined'
const isDemo = isDemoMode()

// ── Demo storage ────────────────────────────────────────────────────────────
function demoKey(consultationId: string) {
  return `chat_${consultationId}`
}

function getDemoMessages(consultationId: string): ConsultationMessage[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem(demoKey(consultationId))
  return raw ? (JSON.parse(raw) as ConsultationMessage[]) : []
}

function setDemoMessages(consultationId: string, messages: ConsultationMessage[]) {
  if (!isBrowser) return
  localStorage.setItem(demoKey(consultationId), JSON.stringify(messages))
}

function uid() {
  return 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
}

// ── API ─────────────────────────────────────────────────────────────────────
export async function getMessages(consultationId: string): Promise<ConsultationMessage[]> {
  if (isDemo) {
    return getDemoMessages(consultationId).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  const { data, error } = await supabase
    .from('consultation_messages')
    .select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load messages:', error)
    return getDemoMessages(consultationId)
  }
  return (data || []) as ConsultationMessage[]
}

export async function sendMessage(
  consultationId: string,
  body: string,
  sender: SenderRole,
  attachments: MessageAttachment[] = []
): Promise<ConsultationMessage> {
  const trimmed = body.trim()
  if (!trimmed && attachments.length === 0) {
    throw new Error('الرسالة فارغة')
  }

  const message: ConsultationMessage = {
    id: uid(),
    consultation_id: consultationId,
    sender_role: sender,
    body: trimmed,
    attachments,
    read_by_patient: sender === 'patient',
    read_by_doctor: sender === 'doctor' || sender === 'system',
    created_at: new Date().toISOString(),
  }

  if (isDemo) {
    const list = getDemoMessages(consultationId)
    list.push(message)
    setDemoMessages(consultationId, list)
    return message
  }

  const { data, error } = await supabase
    .from('consultation_messages')
    .insert({
      consultation_id: consultationId,
      sender_role: sender,
      body: trimmed,
      attachments,
      read_by_patient: sender === 'patient',
      read_by_doctor: sender === 'doctor' || sender === 'system',
    })
    .select()
    .single()

  if (error || !data) {
    // Fall back to demo store on error
    console.warn('sendMessage failed, stored locally:', error)
    const list = getDemoMessages(consultationId)
    list.push(message)
    setDemoMessages(consultationId, list)
    return message
  }
  return data as ConsultationMessage
}

export async function markRead(consultationId: string, asRole: 'patient' | 'doctor') {
  if (isDemo) {
    const list = getDemoMessages(consultationId)
    list.forEach(m => {
      if (asRole === 'patient') m.read_by_patient = true
      else m.read_by_doctor = true
    })
    setDemoMessages(consultationId, list)
    return
  }

  const col = asRole === 'patient' ? 'read_by_patient' : 'read_by_doctor'
  await supabase
    .from('consultation_messages')
    .update({ [col]: true })
    .eq('consultation_id', consultationId)
    .eq(col, false)
}

/**
 * Polling subscription. Calls `onMessage` whenever a new message arrives.
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  consultationId: string,
  onMessage: (messages: ConsultationMessage[]) => void
): () => void {
  let cancelled = false
  let lastSeenCount = 0

  const tick = async () => {
    if (cancelled) return
    const list = await getMessages(consultationId)
    if (cancelled) return
    if (list.length !== lastSeenCount) {
      lastSeenCount = list.length
      onMessage(list)
    }
  }

  // Fire immediately, then on interval
  tick()
  const handle = setInterval(tick, POLL_INTERVAL_MS)

  // Also re-fetch when the tab becomes visible again
  const onVisible = () => { if (document.visibilityState === 'visible') tick() }
  if (isBrowser) document.addEventListener('visibilitychange', onVisible)

  return () => {
    cancelled = true
    clearInterval(handle)
    if (isBrowser) document.removeEventListener('visibilitychange', onVisible)
  }
}

export const QUICK_REPLY_TEMPLATES = [
  'الرجاء إرفاق صور الرنين المغناطيسي (MRI) إن وجدت.',
  'الرجاء تحديد مكان الألم بدقة (يمين/يسار).',
  'الرجاء توضيح متى بدأت الأعراض بالضبط.',
  'الرجاء إرفاق نتائج آخر تحاليل دم.',
  'هل يمكنك تصوير المنطقة المصابة وإرسال الصورة؟',
  'هل تناولت أي مسكنات للألم مؤخراً؟ ما هي؟',
]
