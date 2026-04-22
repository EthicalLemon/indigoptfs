'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, User, LogOut, ChevronDown, Plane } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ui/ThemeProvider'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/flights', label: 'Flights' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/routes-network', label: 'Network' },
  { href: '/meals', label: 'Services' },
  { href: '/status', label: 'Flight Status' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const supabaseRef = useRef(createClient())
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const supabase = supabaseRef.current
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      } else {
        setProfile(null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) setProfile(null)
      else {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabaseRef.current.auth.signOut()
    setProfile(null)
    setUserMenu(false)
    router.push('/')
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'py-3 glass-dark shadow-2xl' : 'py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300">
            <Plane size={18} className="text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          <div>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>IndiGo</span>
            <span className="font-display font-light text-xl" style={{ color: 'var(--indigo-accent)' }}> Airlines</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {profile ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                  {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {profile.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown size={14} className={cn('text-[var(--text-muted)] transition-transform', userMenu && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 indigo-card p-2"
                  >
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Signed in as</p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{profile.email}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 capitalize">{profile.role}</span>
                    </div>
                    <Link href="/manage" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors mt-1" style={{ color: 'var(--text-secondary)' }} onClick={() => setUserMenu(false)}>
                      <User size={14} /> My Bookings
                    </Link>
                    {['admin', 'staff', 'host'].includes(profile.role) && (
                      <Link href="/staff" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }} onClick={() => setUserMenu(false)}>
                        <Plane size={14} /> Staff Portal
                      </Link>
                    )}
                    <button onClick={signOut} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-red-500/10 text-red-400 transition-colors mt-1">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="indigo-btn indigo-btn-ghost text-sm px-4 py-2">Login</Link>
              <Link href="/auth/signup" className="indigo-btn indigo-btn-primary text-sm px-4 py-2">Book Now</Link>
            </>
          )}
        </div>

        {/* Mobile menu btn */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setOpen(!open)} style={{ color: 'var(--text-primary)' }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t mt-3 overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5" style={{ color: 'var(--text-secondary)' }} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-3 mt-1 flex gap-2" style={{ borderColor: 'var(--border)' }}>
                {profile ? (
                  <button onClick={signOut} className="indigo-btn indigo-btn-ghost w-full">Sign Out</button>
                ) : (
                  <>
                    <Link href="/auth/login" className="indigo-btn indigo-btn-ghost flex-1 text-center" onClick={() => setOpen(false)}>Login</Link>
                    <Link href="/auth/signup" className="indigo-btn indigo-btn-primary flex-1 text-center" onClick={() => setOpen(false)}>Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
