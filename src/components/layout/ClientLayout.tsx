'use client'
import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStaff = pathname.startsWith('/staff')
  
  return (
    <>
      {!isStaff && <Navbar />}
      <main className={isStaff ? '' : 'min-h-screen'}>
        {children}
      </main>
      {!isStaff && <Footer />}
    </>
  )
}
