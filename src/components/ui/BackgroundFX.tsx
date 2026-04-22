'use client'

export function BackgroundFX() {
  return (
    <div className="fixed inset-0 -z-10">

      {/* Light */}
      <div className="absolute inset-0 bg-[#f8fafc]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_60%)]" />

      {/* Dark */}
      <div className="absolute inset-0 hidden dark:block bg-[#0a0f1c]" />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />

    </div>
  )
}