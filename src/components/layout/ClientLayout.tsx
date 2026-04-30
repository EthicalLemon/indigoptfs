'use client'
import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AuthProvider } from '@/components/AuthProvider'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStaff = pathname.startsWith('/staff')

  return (
    // AuthProvider wraps everything — one subscription, never unmounts
    <AuthProvider>
      {!isStaff && <Navbar />}
      <main className={isStaff ? '' : 'min-h-screen'}>
        {children}
      </main>
      {!isStaff && <Footer />}
    </AuthProvider>
  )
}