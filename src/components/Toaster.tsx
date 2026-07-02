'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangle, Check, Info, X } from 'lucide-react'

export type ToastVariant = 'info' | 'success' | 'error' | 'warn'

export type Toast = {
  id: number
  message: string
  variant: ToastVariant
  durationMs: number
}

type ToastContextValue = {
  push: (message: string, variant?: ToastVariant, durationMs?: number) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; color: string; icon: ReactNode }> = {
  info:    { bg: 'var(--surface)',     border: 'var(--primary)',  color: 'var(--primary)',  icon: <Info size={14} /> },
  success: { bg: 'var(--ok-soft)',     border: 'var(--ok)',       color: 'var(--ok)',       icon: <Check size={14} /> },
  error:   { bg: 'var(--err-soft)',    border: 'var(--err)',      color: 'var(--err)',      icon: <X size={14} /> },
  warn:    { bg: 'var(--gold-soft)',   border: 'var(--gold)',     color: 'var(--gold)',     icon: <AlertTriangle size={14} /> },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
    const handle = timersRef.current.get(id)
    if (handle) {
      clearTimeout(handle)
      timersRef.current.delete(id)
    }
  }, [])

  const push = useCallback<ToastContextValue['push']>(
    (message, variant = 'info', durationMs = 5000) => {
      const id = ++idRef.current
      setToasts((current) => [...current, { id, message, variant, durationMs }])
      if (durationMs > 0) {
        const handle = setTimeout(() => dismiss(id), durationMs)
        timersRef.current.set(id, handle)
      }
    },
    [dismiss],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const handle of timers.values()) clearTimeout(handle)
      timers.clear()
    }
  }, [])

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="إشعارات"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          insetInlineStart: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 100,
          maxWidth: 'min(420px, calc(100vw - 2rem))',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const styles = VARIANT_STYLES[toast.variant]
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: styles.bg,
                border: `1.5px solid ${styles.border}`,
                borderRadius: 'var(--r-lg)',
                color: styles.color,
                fontSize: '0.88rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-lg)',
                pointerEvents: 'auto',
                animation: 'scaleIn 0.25s var(--ease-out)',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: styles.border,
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
                aria-hidden
              >
                {styles.icon}
              </span>
              <span style={{ flex: 1, color: 'var(--fg)' }}>{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="إغلاق"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--fg-dim)',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: '0 0.25rem',
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToasts(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToasts must be used inside <ToastProvider>')
  }
  return ctx
}
