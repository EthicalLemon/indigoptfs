import { Suspense } from 'react'
import StatusContent from './StatusContent'

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--indigo-primary)', borderTopColor: 'transparent' }} /></div>}>
      <StatusContent />
    </Suspense>
  )
}
