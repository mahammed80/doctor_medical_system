export default function DashboardLoading() {
  return (
    <div className="dash-loading" aria-busy="true" aria-live="polite">
      <div className="dash-loading-side" />
      <div className="dash-loading-main">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="dash-skel dash-skel-line" style={{ width: 160, height: 10 }} />
          <div className="dash-skel dash-skel-line" style={{ width: 320, height: 26, marginBottom: '0.8rem' }} />
          <div className="dash-skel dash-skel-line" style={{ width: 260, height: 12 }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem', margin: '2rem 0' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="dash-skel dash-skel-block" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>

          <div className="dash-skel" style={{ height: 56, borderRadius: 16, marginBottom: '1rem' }} />
          <div className="dash-skel" style={{ height: 320, borderRadius: 18 }} />
        </div>
      </div>
    </div>
  )
}
