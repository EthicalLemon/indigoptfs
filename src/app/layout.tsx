export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { DevToolsGuard } from '@/components/ui/DevToolsGuard'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ClientLayout } from '@/components/layout/ClientLayout'

export const metadata: Metadata = {
  title: 'IndiGo Airlines — Fly Beyond',
  description: 'Experience world-class flying with IndiGo Airlines. Book flights, manage bookings, and explore our network.',
  keywords: 'airline, flights, booking, travel, indigo airlines',
  openGraph: {
    title: 'IndiGo Airlines — Fly Beyond',
    description: 'Experience world-class flying with IndiGo Airlines',
    type: 'website',
  },
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <DevToolsGuard />
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontFamily: 'var(--font-body)',
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
