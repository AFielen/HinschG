export default function Loading() {
  return (
    <div className="py-8 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="drk-card animate-pulse">
          <div className="h-6 rounded" style={{ background: 'var(--border)', width: '40%' }} />
          <div className="mt-4 space-y-3">
            <div className="h-4 rounded" style={{ background: 'var(--border)' }} />
            <div className="h-4 rounded" style={{ background: 'var(--border)', width: '80%' }} />
          </div>
        </div>
        <div className="drk-card animate-pulse">
          <div className="h-5 rounded" style={{ background: 'var(--border)', width: '30%' }} />
          <div className="mt-4 space-y-3">
            <div className="h-4 rounded" style={{ background: 'var(--border)', width: '90%' }} />
            <div className="h-4 rounded" style={{ background: 'var(--border)', width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
