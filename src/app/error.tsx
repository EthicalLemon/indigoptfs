'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center indigo-card p-10 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="indigo-btn indigo-btn-primary">Try Again</button>
      </div>
    </div>
  )
}
