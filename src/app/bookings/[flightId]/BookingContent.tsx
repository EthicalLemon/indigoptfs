import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Plane, Calendar, User, CreditCard, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: { flightId: string } // ✅ FIXED
}

export default async function BookingConfirmationPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // ✅ SAFE param extraction
  const bookingId = params?.flightId

  if (!bookingId) {
    redirect('/bookings')
  }

  // ✅ FETCH booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights (
        flight_number,
        departure_city,
        departure_code,
        arrival_city,
        arrival_code,
        departure_time,
        arrival_time,
        aircraft_type,
        gate,
        terminal,
        status
      )
    `)
    .eq('id', bookingId) // ✅ FIXED
    .eq('user_id', user.id)
    .single()

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-white mb-2">Booking Not Found</h1>
          <p className="text-white/50 text-sm mb-6">
            This booking doesn't exist or doesn't belong to your account.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const flight = booking.flight ?? {}
  const passenger = booking.passengers?.[0] ?? {}

  // ✅ STABLE formatters (no hydration issues)
  const formatDateTime = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const formatTime = (iso?: string) => {
    if (!iso) return '--:--'
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const durationMs =
    flight?.arrival_time && flight?.departure_time
      ? new Date(flight.arrival_time).getTime() -
        new Date(flight.departure_time).getTime()
      : 0

  const durationHr = Math.floor(durationMs / 3600000)
  const durationMin = Math.floor((durationMs % 3600000) / 60000)

  const classLabel: Record<string, string> = {
    economy: 'Economy',
    business: 'Business',
    first: 'First Class',
  }

  return (
    <div className="min-h-screen bg-[#07070f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="relative max-w-2xl mx-auto px-4 py-12">

        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> My Bookings
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h1>
          <p className="text-white/40 text-sm">
            Your boarding pass has been sent to your Discord DM.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

          <div className="p-6 flex justify-between">
            <div>
              <div className="text-white/40 text-xs mb-1">Booking Ref</div>
              <div className="text-white font-mono font-bold text-lg">
                {booking.booking_ref}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs mb-1">Class</div>
              <div className="text-indigo-400 text-sm">
                {classLabel[booking.seat_class] ?? booking.seat_class}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-white text-2xl">{flight.departure_code}</div>
                <div className="text-white/40 text-sm">{flight.departure_city}</div>
                <div className="text-white/30 text-xs">{formatTime(flight.departure_time)}</div>
              </div>

              <div className="text-center text-white/30 text-xs">
                {durationHr}h {durationMin}m
              </div>

              <div className="text-right">
                <div className="text-white text-2xl">{flight.arrival_code}</div>
                <div className="text-white/40 text-sm">{flight.arrival_city}</div>
                <div className="text-white/30 text-xs">{formatTime(flight.arrival_time)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <Calendar size={12} />
                <div className="text-xs text-white/40">Departure</div>
                <div className="text-white text-sm">{formatDateTime(flight.departure_time)}</div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <Plane size={12} />
                <div className="text-xs text-white/40">Flight</div>
                <div className="text-white text-sm">{flight.flight_number}</div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <User size={12} />
                <div className="text-xs text-white/40">Passenger</div>
                <div className="text-white text-sm">
                  {passenger.first_name ?? ''} {passenger.last_name ?? ''}
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <CreditCard size={12} />
                <div className="text-xs text-white/40">Amount</div>
                <div className="text-white text-sm">
                  ₹{Number(booking.total_price).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link href="/" className="flex-1 text-center py-3 bg-white/10 rounded-lg text-white">
            Home
          </Link>
          <Link href="/bookings" className="flex-1 text-center py-3 bg-indigo-600 rounded-lg text-white">
            My Bookings
          </Link>
        </div>

      </div>
    </div>
  )
}