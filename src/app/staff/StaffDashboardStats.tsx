'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plane, Users, TrendingUp, CheckCircle, ArrowUpRight, Clock, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Flight, Profile } from '@/types'
import { formatTime, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

const STATUS_PILL: Record<string, { bg: string; color: string; dot: string }> = {
  scheduled: { bg: 'rgba(99,102,241,0.1)',  color: '#818cf8', dot: '#6366f1' },
  boarding:  { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', dot: '#f59e0b' },
  departed:  { bg: 'rgba(34,211,238,0.1)',  color: '#22d3ee', dot: '#06b6d4' },
  arrived:   { bg: 'rgba(34,197,94,0.1)',   color: '#4ade80', dot: '#22c55e' },
  delayed:   { bg: 'rgba(249,115,22,0.1)',  color: '#fb923c', dot: '#f97316' },
  cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', dot: '#ef4444' },
}

export function StaffDashboardStats({ profile }: { profile: Profile }) {
  const [stats, setStats] = useState({ flights: 0, bookings: 0, users: 0, revenue: 0 })
  const [recentFlights, setRecentFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const sb = createClient()
      const [
        { count: flightCount },
        { count: bookingCount },
        { count: userCount },
        { data: bookingData },
        { data: flights },
      ] = await Promise.all([
        sb.from('flights').select('*', { count: 'exact', head: true }),
        sb.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        sb.from('profiles').select('*', { count: 'exact', head: true }),
        sb.from('bookings').select('total_price').eq('status', 'confirmed'),
        sb.from('flights')
          .select('*, host:profiles!host_id(full_name)')
          .order('created_at', { ascending: false })
          .limit(6),
      ])
      const revenue = (bookingData || []).reduce((s: number, b: any) => s + (b.total_price || 0), 0)
      setStats({ flights: flightCount || 0, bookings: bookingCount || 0, users: userCount || 0, revenue })
      setRecentFlights(flights || [])
      setLoading(false)
    })()
  }, [])

  const cards = [
    { icon: Plane,       label: 'Total Flights',     value: stats.flights,  color: '#818cf8', glow: 'rgba(99,102,241,0.35)',  format: (v: number) => v.toLocaleString() },
    { icon: CheckCircle, label: 'Confirmed Bookings', value: stats.bookings, color: '#4ade80', glow: 'rgba(34,197,94,0.35)',  format: (v: number) => v.toLocaleString() },
    { icon: Users,       label: 'Registered Users',   value: stats.users,    color: '#fbbf24', glow: 'rgba(245,158,11,0.35)', format: (v: number) => v.toLocaleString() },
    { icon: TrendingUp,  label: 'Total Revenue',      value: stats.revenue,  color: '#f472b6', glow: 'rgba(236,72,153,0.35)', format: (v: number) => `₹${(v / 100000).toFixed(1)}L` },
  ]

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{
          color: '#fff', fontWeight: 800, fontSize: 26, letterSpacing: '-0.03em', margin: 0,
          background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.5))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Good {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Staff'} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 6 }}>
          Here's what's happening at IndiGo Airlines today.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '20px 22px',
                position: 'relative', overflow: 'hidden',
                cursor: 'default',
              }}
            >
              {/* Subtle corner glow */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 80, height: 80,
                background: `radial-gradient(circle at top right, ${card.glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color={card.color} />
                </div>
                <ArrowUpRight size={13} style={{ color: 'rgba(255,255,255,0.18)', marginTop: 2 }} />
              </div>

              <div style={{ color: '#fff', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {loading ? (
                  <div style={{ width: 60, height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                ) : card.format(card.value)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 5 }}>{card.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent flights table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} style={{ color: '#818cf8' }} />
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Recent Flights</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Latest 6</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Flight', 'Route', 'Departure', 'Status', 'Host'].map(h => (
                  <th key={h} style={{
                    padding: '10px 24px', textAlign: 'left',
                    color: 'rgba(255,255,255,0.25)', fontSize: 10,
                    fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                    Loading...
                  </td>
                </tr>
              ) : recentFlights.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                    No flights yet
                  </td>
                </tr>
              ) : recentFlights.map((flight, idx) => {
                const sp = STATUS_PILL[flight.status] ?? STATUS_PILL.scheduled
                return (
                  <tr
                    key={flight.id}
                    style={{
                      borderBottom: idx < recentFlights.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.13s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 24px' }}>
                      <span style={{ color: '#818cf8', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>
                        {flight.flight_number}
                      </span>
                    </td>
                    <td style={{ padding: '13px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>{flight.departure_code}</span>
                        <Plane size={11} style={{ color: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' }} />
                        <span style={{ fontWeight: 600 }}>{flight.arrival_code}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 24px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                        {formatDate(flight.departure_time)}
                        <span style={{ marginLeft: 6, color: 'rgba(255,255,255,0.25)' }}>
                          {formatTime(flight.departure_time)}
                        </span>
                      </span>
                    </td>
                    <td style={{ padding: '13px 24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 9px', borderRadius: 20,
                        background: sp.bg, color: sp.color, fontSize: 11, fontWeight: 600,
                      }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: sp.dot }} />
                        {STATUS_LABELS[flight.status] ?? flight.status}
                      </span>
                    </td>
                    <td style={{ padding: '13px 24px', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                      {(flight as any).host?.full_name || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}