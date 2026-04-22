'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

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
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    <nav
      className="
      fixed top-0 w-full z-50
      bg-white/80 dark:bg-[#050816]/80
      backdrop-blur-md
      border-b border-gray-200 dark:border-white/10
    "
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={140} height={40} />
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition ${
                pathname === link.href
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button onClick={toggle}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth UI */}
          {user ? (
            <>
              <Link
                href="/staff"
                className="text-sm text-indigo-600 font-medium"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                Login
              </Link>

              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Book Now
              </Link>
            </>
          )}

          {/* Mobile menu */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  )
}