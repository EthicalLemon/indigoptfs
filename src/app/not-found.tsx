import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-gradient">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-float inline-block">✈️</div>
        <h1 className="font-display font-bold text-6xl mb-4" style={{ color: 'var(--text-primary)' }}>404</h1>
        <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--text-secondary)' }}>
          You've flown off the map
        </h2>
        <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="indigo-btn indigo-btn-primary px-8 py-3">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
