'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, Plane, MapPin, UtensilsCrossed,
  Settings, LogOut, Bell, BarChart3,
  ChevronRight, Menu, X, Zap, TrendingUp
} from 'lucide-react'
import { StaffDashboardStats } from './StaffDashboardStats'
import { StaffFlightManager } from './StaffFlightManager'
import { StaffUserManager } from './StaffUserManager'

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'staff' | 'host'
  avatar_url?: string | null
}

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: '#f97316', glow: 'rgba(249,115,22,0.5)' },
  staff: { label: 'Staff', color: '#22d3ee', glow: 'rgba(34,211,238,0.5)' },
  host:  { label: 'Host',  color: '#a78bfa', glow: 'rgba(167,139,250,0.5)' },
}

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',   id: 'overview',   roles: ['admin','staff','host'] },
  { icon: Plane,           label: 'Flights',    id: 'flights',    roles: ['admin','staff','host'] },
  { icon: Users,           label: 'Passengers', id: 'passengers', roles: ['admin','staff']        },
  { icon: MapPin,          label: 'Routes',     id: 'routes',     roles: ['admin','staff','host'] },
  { icon: UtensilsCrossed, label: 'Services',   id: 'services',   roles: ['admin','host']         },
  { icon: BarChart3,       label: 'Analytics',  id: 'analytics',  roles: ['admin']                },
  { icon: Settings,        label: 'Settings',   id: 'settings',   roles: ['admin']                },
]

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: 600 }}>{label}</div>
      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>This section is coming soon</div>
    </div>
  )
}

export default function StaffDashboardClient({ profile }: { profile: Profile }) {
  const [active, setActive] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)

  const rc = ROLE_CONFIG[profile.role]
  const visibleNav = NAV.filter(n => n.roles.includes(profile.role))
  const activeLabel = NAV.find(n => n.id === active)?.label ?? 'Overview'

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase()

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    window.location.href = '/'
  }

  function renderContent() {
    switch (active) {
      case 'overview':   return <StaffDashboardStats profile={profile} />
      case 'flights':    return <StaffFlightManager profile={profile} />
      case 'passengers': return profile.role === 'admin' ? <StaffUserManager /> : <ComingSoon label="Passengers" />
      case 'routes':     return <ComingSoon label="Routes" />
      case 'services':   return <ComingSoon label="Services" />
      case 'analytics':  return <ComingSoon label="Analytics" />
      case 'settings':   return <ComingSoon label="Settings" />
      default:           return <StaffDashboardStats profile={profile} />
    }
  }

  const W = collapsed ? 68 : 232

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#060911',
      fontFamily: "'Outfit', 'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-8%', width: '45%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(34,211,238,0.04) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }} />
      </div>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: W, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        backdropFilter: 'blur(24px)',
        position: 'relative', zIndex: 20,
        transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          <div style={{
            width: 33, height: 33, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 22px rgba(99,102,241,0.55)',
          }}>
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.02em' }}>Staff Portal</div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>IndiGo Airlines</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginLeft: collapsed ? 'auto' : 0,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {collapsed ? <Menu size={11} /> : <X size={11} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {!collapsed && (
            <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 10px 10px' }}>
              Menu
            </div>
          )}
          {visibleNav.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 10, padding: collapsed ? '10px 0' : '9px 11px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 10, marginBottom: 1, cursor: 'pointer',
                  background: isActive ? 'rgba(99,102,241,0.13)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.13s ease', whiteSpace: 'nowrap', position: 'relative',
                }}
                onMouseOver={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' } }}
                onMouseOut={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' } }}
              >
                {isActive && !collapsed && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2.5, borderRadius: 2, background: '#818cf8', boxShadow: '0 0 10px rgba(129,140,248,0.8)' }} />
                )}
                <Icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {isActive && <ChevronRight size={12} style={{ opacity: 0.45 }} />}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* Profile */}
        <div style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.055)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: collapsed ? '10px 0' : '10px 11px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden', whiteSpace: 'nowrap',
          }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>{initials}</div>
            )}
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.full_name || 'Staff Member'}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2,
                    padding: '1px 7px', borderRadius: 20,
                    background: `${rc.color}18`, border: `1px solid ${rc.color}30`,
                    color: rc.color, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: rc.color, boxShadow: `0 0 6px ${rc.glow}` }} />
                    {rc.label}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  style={{ color: 'rgba(255,255,255,0.18)', padding: 4, borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}
                  onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
                >
                  <LogOut size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Topbar */}
        <header style={{
          height: 64, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          background: 'rgba(6,9,17,0.7)',
          backdropFilter: 'blur(24px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.1 }}>
              {activeLabel}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, margin: '3px 0 0' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
              background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)',
              color: 'rgba(34,197,94,0.7)', fontSize: 11,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              All systems operational
            </div>

            <button style={{
              width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.4)', position: 'relative',
            }}>
              <Bell size={14} />
              <span style={{
                position: 'absolute', top: 8, right: 8, width: 6, height: 6,
                borderRadius: '50%', background: '#f59e0b',
                boxShadow: '0 0 8px rgba(245,158,11,0.8)',
              }} />
            </button>

            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              border: '1px solid rgba(99,102,241,0.4)',
              boxShadow: '0 0 16px rgba(99,102,241,0.3)',
            }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '30px 32px' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}