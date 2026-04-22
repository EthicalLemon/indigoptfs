'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'

const NAV_LINKS = [
  { href: '/flights', label: 'Flights' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/routes-network', label: 'Network' },
  { href: '/meals', label: 'Services' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <nav className="
      fixed top-0 w-full z-50
      bg-white/80 dark:bg-[#050816]/80
      backdrop-blur-md
      border-b border-gray-200 dark:border-white/10
    ">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={140}
            height={40}
          />
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex gap-8">
          {NAV_LINKS.map(link => (
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
          <button onClick={toggle}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-300">
            Login
          </Link>

          <Link
            href="/auth/signup"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            Book Now
          </Link>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  )
}