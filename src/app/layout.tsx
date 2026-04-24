export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { BackgroundFX } from '@/components/ui/BackgroundFX'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono-fallback',
})

export const metadata: Metadata = {
  title: 'IndiGo Airlines — Fly Beyond',
  description: 'Experience world-class flying with IndiGo Airlines.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body
        className="
          min-h-screen antialiased
          bg-[#f8fafc] text-gray-900
          dark:bg-[#0a0f1c] dark:text-gray-100
        "
      >
        <ThemeProvider>
          <BackgroundFX />

          <ClientLayout>
            {children}
          </ClientLayout>

          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}