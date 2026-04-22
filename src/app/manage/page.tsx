import { Suspense } from 'react'
import ManageContent from './ManageContent'

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--indigo-primary)', borderTopColor: 'transparent' }} /></div>}>
      <ManageContent />
    </Suspense>
  )
}
