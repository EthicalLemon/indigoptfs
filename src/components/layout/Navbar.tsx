'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Menu, X, Home } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import GlassSurface from '@/components/ui/GlassSurface'

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

      <GlassSurface
        width="auto"
        height="auto"
        borderRadius={999}
        borderWidth={0.07}
        brightness={theme === 'dark' ? 20 : 60}
        opacity={0.92}
        blur={14}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={20}
        backgroundOpacity={theme === 'dark' ? 0.08 : 0.15}
        saturation={1.4}
        className="!overflow-visible"
      >
        <div className="flex items-center gap-2 px-4 py-2.5">

          {/* HOME ICON */}
          <DockItem>
            <Link
              href="/"
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
              style={{
                background: pathname === '/'
                  ? 'rgba(99,102,241,1)'
                  : theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                color: pathname === '/' ? '#fff' : theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(30,30,40,0.7)',
                boxShadow: pathname === '/' ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <Home size={17} />
            </Link>
          </DockItem>

          <Divider theme={theme} />

          {/* NAV LINKS */}
          {NAV_LINKS.map(link => {
            const active = pathname === link.href
            return (
              <DockItem key={link.href}>
                <Link
                  href={link.href}
                  className="px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200"
                  style={{
                    background: active ? 'rgba(99,102,241,1)' : 'transparent',
                    color: active
                      ? '#fff'
                      : theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(30,30,40,0.85)',
                    boxShadow: active ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active)(e.currentTarget as HTMLElement).style.background =
                      theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                  }}
                  onMouseLeave={e => {
                    if (!active)(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  {link.label}
                </Link>
              </DockItem>
            )
          })}

          <Divider theme={theme} />

          {/* THEME TOGGLE */}
          <DockItem>
            <button
              onClick={toggle}
              className="p-2 rounded-full transition-all duration-200"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,40,0.7)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background =
                  theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </DockItem>

          {/* AUTH */}
          {user ? (
            <>
              <DockItem>
                <Link href="/staff" className="text-sm font-medium text-indigo-500 dark:text-indigo-400">
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
                <Link
                  href="/auth/login"
                  className="text-sm transition"
                  style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(30,30,40,0.8)' }}
                >
                  Login
                </Link>
              </DockItem>
              <DockItem>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-full text-sm text-white transition-all"
                  style={{
                    background: 'rgba(99,102,241,1)',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
                  }}
                >
                  Book
                </Link>
              </DockItem>
            </>
          )}

          {/* MOBILE MENU BUTTON */}
          <DockItem>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 transition"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,40,0.7)' }}
            >
              {open ? <X /> : <Menu />}
            </button>
          </DockItem>

        </div>
      </GlassSurface>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="mt-3 md:hidden">
          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={16}
            brightness={theme === 'dark' ? 20 : 60}
            opacity={0.95}
            blur={14}
            backgroundOpacity={theme === 'dark' ? 0.08 : 0.15}
            saturation={1.4}
          >
            <div className="px-6 py-4 flex flex-col gap-4 min-w-[180px]">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="transition text-sm"
                  style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(30,30,40,0.85)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </GlassSurface>
        </div>
      )}
    </div>
  )
}

/* DOCK ITEM */
function DockItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.1, transition: { duration: 0.4 } }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 12 }}
    >
      {children}
    </motion.div>
  )
}

/* DIVIDER */
function Divider({ theme }: { theme: string }) {
  return (
    <div
      className="w-px h-6 mx-1"
      style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
    />
  )
}