import { STEPS } from '../constants'

export function StepIndicator({ step }: { step: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: '3rem',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '10%',
          right: '10%',
          height: 2,
          background: 'var(--border-faint)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '10%',
          width: step > 0 ? `${(step / (STEPS.length - 1)) * 80}%` : '0%',
          height: 2,
          background: 'linear-gradient(90deg, var(--ok), var(--primary))',
          zIndex: 0,
          transition: 'width 500ms var(--ease-out)',
        }}
      />
      {STEPS.map((s, i) => (
        <div
          key={s.label}
          style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem',
              flex: 'none',
            }}
          >
            <div
              className="num"
              style={{
                width: i === step ? 46 : i < step ? 40 : 38,
                height: i === step ? 46 : i < step ? 40 : 38,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: i === step ? '0.9rem' : i < step ? '0.85rem' : '0.78rem',
                fontWeight: 800,
                transition: 'all 500ms var(--ease-spring)',
                background:
                  i < step
                    ? 'var(--ok)'
                    : i === step
                      ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-down) 100%)'
                      : 'var(--surface)',
                border:
                  i < step
                    ? '2px solid var(--ok)'
                    : i === step
                      ? '2px solid var(--primary)'
                      : '2px solid var(--border)',
                color: i <= step ? 'white' : 'var(--fg-dim)',
                boxShadow:
                  i === step
                    ? '0 0 0 5px var(--primary-soft), 0 4px 20px var(--primary-glow)'
                    : i < step
                      ? '0 0 0 3px var(--ok-soft)'
                      : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {i < step ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
              {i === step && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    border: '1.5px solid var(--gold)',
                    opacity: 0.3,
                    animation: 'pulse-soft 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color:
                  i === step
                    ? 'var(--primary)'
                    : i < step
                      ? 'var(--ok)'
                      : 'var(--fg-dim)',
                fontWeight: i === step ? 700 : i < step ? 600 : 400,
                textAlign: 'center',
                maxWidth: '90px',
                lineHeight: 1.3,
                transition: 'color 400ms',
              }}
            >
              {s.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
