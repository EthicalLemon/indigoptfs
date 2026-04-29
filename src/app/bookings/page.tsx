import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Plane } from 'lucide-react'

export default async function BookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_ref,
      total_price,
      seat_class,
      created_at,
      flight:flights (
        flight_number,
        departure_city,
        departure_code,
        arrival_city,
        arrival_code,
        departure_time
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const classLabel: Record<string, string> = {
    economy: 'Economy',
    business: 'Business',
    first: 'First Class',
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#07070f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 py-12">

        <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-white/40 text-sm mb-8">All your confirmed flight bookings</p>

        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-white font-semibold mb-2">No bookings yet</h2>
            <p className="text-white/40 text-sm mb-6">Book your first flight to get started.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              Browse Flights
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => {
              const flight = b.flight ?? {}
              return (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="group p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-white tracking-wide">
                      {b.booking_ref}
                    </span>
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                      {classLabel[b.seat_class] ?? b.seat_class}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <div className="text-white text-xl font-semibold">{flight.departure_code}</div>
                      <div className="text-white/40 text-xs">{flight.departure_city}</div>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-px bg-white/10" />
                      <Plane size={14} className="text-white/30" />
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <div className="text-right">
                      <div className="text-white text-xl font-semibold">{flight.arrival_code}</div>
                      <div className="text-white/40 text-xs">{flight.arrival_city}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-white/40 text-xs">{formatDate(flight.departure_time)}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium text-sm">
                        ₹{Number(b.total_price).toLocaleString('en-IN')}
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-white/30 group-hover:text-white/60 transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}