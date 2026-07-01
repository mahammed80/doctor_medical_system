import { STEPS } from '../constants'

export function StepIndicator({ step }: { step: number }) {
  const fillWidth = step > 0 ? `${(step / (STEPS.length - 1)) * 84}%` : '0%'

  return (
    <div className="step-indicator" aria-label="مؤشر خطوات الحجز">
      <div className="step-indicator-track" aria-hidden />
      <div className="step-indicator-fill" style={{ width: fillWidth }} aria-hidden />
      {STEPS.map((s, i) => {
        const isCompleted = i < step
        const isActive = i === step
        return (
          <div key={s.label} className="step-node-wrap">
            <div
              className={[
                'step-node',
                isActive && 'step-node-active',
                isCompleted && 'step-node-completed',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted ? (
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
              {isActive && <div className="step-node-ring" aria-hidden />}
            </div>
            <span
              className={[
                'step-label',
                isActive && 'step-label-active',
                isCompleted && 'step-label-completed',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {s.sub}
            </span>
          </div>
        )
      })}
    </div>
  )
}
