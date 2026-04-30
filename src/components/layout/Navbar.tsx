'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Menu, X, Home } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'
import { motion } from 'framer-motion'
import GlassSurface from '@/components/ui/GlassSurface'
import UserMenu from '@/components/UserMenu'
import WalletDisplay from '@/components/WalletDisplay'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/flights',        label: 'Flights'  },
  { href: '/fleet',          label: 'Fleet'    },
  { href: '/routes-network', label: 'Network'  },
  { href: '/meals',          label: 'Services' },
  { href: '/about',          label: 'About'    },
  { href: '/blog',           label: 'Blog'     },
]

// ─── Module-level session cache ────────────────────────────────────────────────
// Shared across all navbar renders so we never hit Supabase more than once
// per browser session. Role is cached too so profile is never re-fetched.
let _cachedUser:   { id: string; email?: string } | null = undefined as any
let _cachedRole:   string | null = null
let _cacheReady:   boolean = false

// ─── Module-level supabase client ─────────────────────────────────────────────
// Created once at module load — never recreated across re-renders or remounts.
const supabase = createClient()

export function Navbar() {
  const [open, setOpen]   = useState(false)
  const [user, setUser]   = useState<{ id: string; email?: string } | null>(null)
  const [role, setRole]   = useState<string | null>(null)
  const [ready, setReady] = useState(false)   // prevents flash of wrong state

  const pathname     = usePathname()
  const isStaffPage  = pathname.startsWith('/staff')
  const { theme, toggle } = useTheme()

  // ── Load session exactly once ───────────────────────────────────────────────
  const loadSession = useCallback(async () => {
    // Already cached from a previous mount — use it instantly
    if (_cacheReady) {
      setUser(_cachedUser)
      setRole(_cachedRole)
      setReady(true)
      return
    }

    // First ever load — one call, cache results
    // Use getUser() not getSession() — getSession() can return null on Vercel edge
    const { data: { user: sessionUser } } = await supabase.auth.getUser()

    if (sessionUser) {
      // Single profile fetch, cached immediately
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionUser.id)
        .maybeSingle()

      _cachedRole = profile?.role ?? null
      _cachedUser = { id: sessionUser.id, email: sessionUser.email }
    } else {
      _cachedRole = null
      _cachedUser = null
    }

    _cacheReady = true
    setUser(_cachedUser)
    setRole(_cachedRole)
    setReady(true)
  }, [])

  useEffect(() => {
    loadSession()

    // Auth state listener — only fires on actual sign-in / sign-out events
    // NOT on every tab focus or token refresh (those use getSession above)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Ignore TOKEN_REFRESHED — no need to re-fetch anything
        if (event === 'TOKEN_REFRESHED') return

        const sessionUser = session?.user ?? null

        if (event === 'SIGNED_OUT' || !sessionUser) {
          _cachedUser  = null
          _cachedRole  = null
          _cacheReady  = true
          setUser(null)
          setRole(null)
          return
        }

        if (event === 'SIGNED_IN') {
          // Fetch role once on sign-in, then cache
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionUser.id)
            .maybeSingle()

          _cachedUser  = { id: sessionUser.id, email: sessionUser.email }
          _cachedRole  = profile?.role ?? null
          _cacheReady  = true
          setUser(_cachedUser)
          setRole(_cachedRole)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadSession])

  const handleLogout = async () => {
    // Clear cache on logout
    _cachedUser = null
    _cachedRole = null
    _cacheReady = false
    await supabase.auth.signOut()
    location.reload()
  }

  const isStaff = ['admin', 'staff', 'host'].includes(role ?? '')

  // Don't render auth-dependent UI until we know the session state
  // This prevents the flicker of "Login" before user loads
  const authReady = ready

  return (
    <>
      {/* TOP RIGHT — wallet + user menu (only when logged in) */}
      {authReady && user && (
  <div className="fixed top-6 right-6 z-50">
    <UserMenu />
  </div>
)}

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

            {/* HOME */}
            <DockItem>
              <Link
                href="/"
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                style={{
                  background: pathname === '/'
                    ? 'rgba(99,102,241,1)'
                    : theme === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.06)',
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
                      color: active ? '#fff' : theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(30,30,40,0.85)',
                      boxShadow: active ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
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
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </DockItem>

            {/* AUTH — hidden until ready to prevent flash */}
            {authReady && (
              user ? (
                <>
                  {isStaff && !isStaffPage && (
                    <DockItem>
                      <Link href="/staff" className="text-sm font-medium text-indigo-500 dark:text-indigo-400">
                        Dashboard
                      </Link>
                    </DockItem>
                  )}
                  <DockItem>
                    <Link
                      href="/flights"
                      className="px-4 py-2 rounded-full text-sm text-white"
                      style={{ background: 'rgba(99,102,241,1)', boxShadow: '0 2px 12px rgba(99,102,241,0.4)' }}
                    >
                      Book
                    </Link>
                  </DockItem>
                </>
              ) : (
                <>
                  <DockItem>
                    <Link
                      href="/auth/login"
                      className="text-sm"
                      style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(30,30,40,0.8)' }}
                    >
                      Login
                    </Link>
                  </DockItem>
                  <DockItem>
                    <Link
                      href="/flights"
                      className="px-4 py-2 rounded-full text-sm text-white"
                      style={{ background: 'rgba(99,102,241,1)', boxShadow: '0 2px 12px rgba(99,102,241,0.4)' }}
                    >
                      Book
                    </Link>
                  </DockItem>
                </>
              )
            )}

            {/* MOBILE MENU TOGGLE */}
            <DockItem>
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2"
                style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,40,0.7)' }}
              >
                {open ? <X /> : <Menu />}
              </button>
            </DockItem>

          </div>
        </GlassSurface>

        {/* MOBILE MENU */}
        {open && (
          <div className="mt-3 md:hidden">
            <GlassSurface borderRadius={16}>
              <div className="px-6 py-4 flex flex-col gap-4">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(30,30,40,0.85)' }}
                  >
                    {link.label}
                  </Link>
                ))}
                {authReady && user && (
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm text-red-400"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </GlassSurface>
          </div>
        )}
      </div>
    </>
  )
}

function DockItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ y: -10, scale: 1.08 }}>
      {children}
    </motion.div>
  )
}

function Divider({ theme }: { theme: string }) {
  return (
    <div
      className="w-px h-6 mx-1"
      style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
    />
  )
}