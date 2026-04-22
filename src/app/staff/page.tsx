'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Users, BarChart3, Settings, LogOut, Shield, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { StaffFlightManager } from '@/components/staff/StaffFlightManager'
import { StaffUserManager } from '@/components/staff/StaffUserManager'
import { StaffDashboardStats } from '@/components/staff/StaffDashboardStats'

type StaffTab = 'dashboard' | 'flights' | 'users' | 'settings'

export default function StaffPortal() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<StaffTab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login?redirect=/staff'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (!p || !['admin', 'staff', 'host'].includes(p.role)) {
        router.push('/')
        return
      }
      setProfile(p as Profile)
      setLoading(false)
    })
  }, [])

  const signOut = async () => {
    await supabaseRef.current.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--text-muted)' }}>Verifying access...</p>
      </div>
    </div>
  )

  if (!profile) return null

 const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'staff', 'host'] },
  { id: 'flights', label: 'Flights', icon: Plane, roles: ['admin', 'staff', 'host'] },
  { id: 'users', label: 'Users', icon: Users, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'staff', 'host'] },
]

  const ROLE_COLORS: Record<string, string> = {
    admin: '#ef4444',
    staff: '#6366f1',
    host: '#fbbf24',
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center">
            <Plane size={14} className="text-white -rotate-45" />
          </div>
          <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>IndiGo Staff</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Shield size={12} style={{ color: ROLE_COLORS[profile.role] }} />
          <span className="text-xs font-semibold capitalize" style={{ color: ROLE_COLORS[profile.role] }}>
            {profile.role} Access
          </span>
        </div>
      </div>

      {/* Profile */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-sm font-bold">
            {profile.full_name?.[0] || profile.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{profile.full_name || 'Staff'}</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{profile.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id as StaffTab); setSidebarOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  background: tab === t.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: tab === t.id ? 'var(--indigo-accent)' : 'var(--text-secondary)',
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex w-64 flex-col border-r sticky top-0 h-screen"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 w-64 h-full flex flex-col border-r md:hidden"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-30"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center">
              <Plane size={11} className="text-white -rotate-45" />
            </div>
            <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              IndiGo Staff — {TABS.find(t => t.id === tab)?.label}
            </span>
          </div>
        </div>

        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {tab === 'dashboard' && <StaffDashboardStats profile={profile} />}
          {tab === 'flights' && <StaffFlightManager profile={profile} />}
          {tab === 'users' && profile.role === 'admin' && <StaffUserManager />}
          {tab === 'settings' && (
            <div className="indigo-card p-8 text-center">
              <Settings size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Settings</h2>
              <p style={{ color: 'var(--text-muted)' }}>Staff portal settings coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
