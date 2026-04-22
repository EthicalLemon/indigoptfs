'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Calendar, CreditCard, X, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/types'
import { formatTime, formatDate, formatDuration, formatPrice, STATUS_COLORS } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ManageContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login?redirect=/manage'); return }
      setUser(data.user)
      loadBookings(data.user.id)
    })
  }, [])

  const loadBookings = async (userId: string) => {
    const supabase = supabaseRef.current
    const { data } = await supabase
      .from('bookings')
      .select('*, flight:flights(*, host:profiles!host_id(full_name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setBookings((data as Booking[]) || [])
    setLoading(false)
  }

  const cancelBooking = async (booking: Booking) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    const { error } = await supabaseRef.current.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
    if (!error) {
      toast.success('Booking cancelled successfully')
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b))
    }
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-widest uppercase font-semibold mb-2" style={{ color: 'var(--indigo-accent)' }}>My Account</p>
          <h1 className="font-display font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>My Bookings</h1>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="indigo-card p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>No bookings yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Start your journey with IndiGo Airlines today.</p>
            <a href="/flights" className="indigo-btn indigo-btn-primary">Search Flights →</a>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="indigo-card overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                        <Plane size={18} style={{ color: 'var(--indigo-accent)' }} />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-base" style={{ color: 'var(--indigo-accent)' }}>
                          {booking.booking_ref}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {booking.flight?.flight_number} · {booking.seat_class === 'first' ? 'First Class' : booking.seat_class.charAt(0).toUpperCase() + booking.seat_class.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-badge ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : booking.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                        {booking.status === 'confirmed' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.status === 'confirmed' && booking.flight && new Date(booking.flight.departure_time) > new Date() && (
                        <button onClick={() => cancelBooking(booking)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {booking.flight && (
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                          {formatTime(booking.flight.departure_time)}
                        </div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{booking.flight.departure_code}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{booking.flight.departure_city}</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(booking.flight.duration_minutes)}</div>
                        <div className="w-full flex items-center gap-1">
                          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                          <Plane size={12} style={{ color: 'var(--indigo-accent)' }} />
                          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Direct</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                          {formatTime(booking.flight.arrival_time)}
                        </div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{booking.flight.arrival_code}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{booking.flight.arrival_city}</div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-4" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      {booking.flight ? formatDate(booking.flight.departure_time) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <CreditCard size={14} />
                      {formatPrice(booking.total_price)}
                    </div>
                    {booking.passengers[0] && (
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        👤 {booking.passengers[0].first_name} {booking.passengers[0].last_name}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
