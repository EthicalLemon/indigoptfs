import type { Metadata } from 'next'
import './globals.css'

import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { BackgroundFX } from '@/components/ui/BackgroundFX'

// ✅ Optimized fonts (fixes preload + performance issues)
import {
  Cormorant_Garamond,
  DM_Sans,
  JetBrains_Mono,
} from 'next/font/google'

const fontDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
})

const fontBody = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'IndiGo Airlines — Fly Beyond',
  description: 'Experience world-class flying with IndiGo Airlines.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body
        className="
          min-h-screen antialiased
          bg-[#f8fafc] text-gray-900
          dark:bg-[#0a0f1c] dark:text-gray-100
        "
      >
        <ThemeProvider>
          {/* Background effects */}
          <BackgroundFX />

          {/* Main layout */}
          <ClientLayout>
            {children}
          </ClientLayout>

          {/* Toast notifications */}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}