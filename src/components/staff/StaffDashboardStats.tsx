'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plane, Users, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Flight, Profile } from '@/types'
import { formatTime, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

export function StaffDashboardStats({ profile }: { profile: Profile }) {
  const [stats, setStats] = useState({ flights: 0, bookings: 0, users: 0, revenue: 0 })
  const [recentFlights, setRecentFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const [{ count: flightCount }, { count: bookingCount }, { count: userCount }, { data: bookingData }, { data: flights }] = await Promise.all([
        supabase.from('flights').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_price').eq('status', 'confirmed'),
        supabase.from('flights').select('*, host:profiles!host_id(full_name)').order('created_at', { ascending: false }).limit(5),
      ])
      const revenue = (bookingData || []).reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
      setStats({ flights: flightCount || 0, bookings: bookingCount || 0, users: userCount || 0, revenue })
      setRecentFlights(flights || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { icon: Plane, label: 'Total Flights', value: stats.flights, color: '#6366f1', suffix: '' },
    { icon: CheckCircle, label: 'Confirmed Bookings', value: stats.bookings, color: '#22c55e', suffix: '' },
    { icon: Users, label: 'Registered Users', value: stats.users, color: '#f59e0b', suffix: '' },
    { icon: TrendingUp, label: 'Total Revenue', value: stats.revenue, color: '#ec4899', suffix: '', isCurrency: true },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
          Welcome, {profile.full_name?.split(' ')[0] || 'Staff'} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Here's what's happening at IndiGo Airlines today.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="indigo-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20` }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
              </div>
              <div className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
                {loading ? '—' : card.isCurrency ? `₹${(card.value / 100000).toFixed(1)}L` : card.value.toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent flights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="indigo-card overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Flights</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="indigo-table">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Status</th>
                <th>Host</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : recentFlights.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No flights yet</td></tr>
              ) : recentFlights.map(flight => (
                <tr key={flight.id}>
                  <td><span className="font-mono font-bold text-sm" style={{ color: 'var(--indigo-accent)' }}>{flight.flight_number}</span></td>
                  <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{flight.departure_code} → {flight.arrival_code}</span></td>
                  <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(flight.departure_time)} {formatTime(flight.departure_time)}</span></td>
                  <td><span className={`status-badge text-xs ${STATUS_COLORS[flight.status]}`}>{STATUS_LABELS[flight.status]}</span></td>
                  <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{flight.host?.full_name || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
