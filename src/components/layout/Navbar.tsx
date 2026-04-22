'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

const NAV_LINKS = [
  { href: '/flights', label: 'Flights' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/routes-network', label: 'Network' },
  { href: '/meals', label: 'Services' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">

      <div className="
        flex items-center gap-3 px-4 py-3
        rounded-full
        backdrop-blur-2xl
        bg-white/70 dark:bg-[#0b1220]/70
        border border-white/10
        shadow-[0_10px_40px_rgba(0,0,0,0.25)]
      ">

        {/* LOGO (HOME) */}
        <DockItem>
          <Link href="/">
            <Image
              src="/planes/logo.jpg"
              alt="logo"
              width={34}
              height={34}
              className="rounded-full object-cover"
              priority
            />
          </Link>
        </DockItem>

        <Divider />

        {/* NAV LINKS */}
        {NAV_LINKS.map(link => {
          const active = pathname === link.href

          return (
            <DockItem key={link.href}>
              <Link
                href={link.href}
                className={`
                  px-4 py-2 rounded-full text-sm whitespace-nowrap
                  transition
                  ${active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'}
                `}
              >
                {link.label}
              </Link>
            </DockItem>
          )
        })}

        <Divider />

        {/* THEME */}
        <DockItem>
          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </DockItem>

        {/* AUTH */}
        {user ? (
          <>
            <DockItem>
              <Link href="/staff" className="text-sm font-medium text-indigo-600">
                Dashboard
              </Link>
            </DockItem>

            <DockItem>
              <button onClick={handleLogout} className="text-sm text-red-500">
                Logout
              </button>
            </DockItem>
          </>
        ) : (
          <>
            <DockItem>
              <Link href="/auth/login" className="text-sm">
                Login
              </Link>
            </DockItem>

            <DockItem>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm"
              >
                Book
              </Link>
            </DockItem>
          </>
        )}

        {/* MOBILE MENU */}
        <DockItem>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            {open ? <X /> : <Menu />}
          </button>
        </DockItem>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="
          mt-3
          rounded-xl
          bg-white/90 dark:bg-[#050816]/90
          backdrop-blur-xl
          border border-gray-200 dark:border-white/10
          px-6 py-4 flex flex-col gap-4 md:hidden
        ">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* 🔥 DOCK ITEM (APPLE ANIMATION) */
function DockItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{
        y: -12,
        scale: 1.1,
        transition: { duration: 0.4 }
      }}
      animate={{ y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 12
      }}
    >
      {children}
    </motion.div>
  )
}

/* Divider */
function Divider() {
  return <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />
}