import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'IndiGo Airlines — Staff Portal',
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Navbar visible in staff */}
      <Navbar />

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}