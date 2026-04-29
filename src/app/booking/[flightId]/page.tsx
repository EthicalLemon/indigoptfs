import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plane, Clock, Calendar } from 'lucide-react'
import { formatTime, formatDate, formatDuration } from '@/lib/utils'
import BookingForm from './BookingForm'

interface Props {
  params: { flightId: string }
  searchParams: { class?: string }
}

export default async function BookingPage({ params, searchParams }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: flight, error } = await supabase
    .from('flights')
    .select('*')
    .eq('id', params.flightId)
    .single()

  if (error || !flight) {
    return (
      <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✈️</div>
          <h1 className="text-xl font-bold text-white mb-2">Flight Not Found</h1>
          <p className="text-white/50 text-sm mb-6">This flight doesn't exist or is no longer available.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
            <ArrowLeft size={15} /> Back to Flights
          </Link>
        </div>
      </div>
    )
  }

  // Fetch wallet balance to show user
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .maybeSingle()

  const defaultClass = (searchParams.class as 'economy' | 'business' | 'first') || 'economy'

  const prices = {
    economy: flight.price_economy,
    business: flight.price_business,
    first: flight.price_first,
  }

  const seatsLeft = {
    economy: flight.seats_economy - flight.seats_economy_booked,
    business: flight.seats_business - flight.seats_business_booked,
    first: flight.seats_first - flight.seats_first_booked,
  }

  return (
    <div className="min-h-screen bg-[#07070f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <Link
          href="/flights"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Flights
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Complete Your Booking</h1>

        {/* Wallet balance banner */}
        <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 mb-6">
          <span className="text-white/60 text-sm">💰 Wallet Balance</span>
          <span className="text-indigo-300 font-bold">
            ₹{(wallet?.balance ?? 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Flight Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Plane size={13} className="text-white" />
            </div>
            <span className="font-mono text-indigo-400 text-sm font-semibold">{flight.flight_number}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/40 text-xs">{flight.aircraft_type}</span>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-white text-3xl font-bold">{formatTime(flight.departure_time)}</div>
              <div className="text-white font-semibold">{flight.departure_code}</div>
              <div className="text-white/40 text-sm">{flight.departure_city}</div>
            </div>

            <div className="text-center text-white/30 text-xs">
              <Clock size={12} className="mx-auto mb-1" />
              {formatDuration(flight.duration_minutes)}
            </div>

            <div className="text-right">
              <div className="text-white text-3xl font-bold">{formatTime(flight.arrival_time)}</div>
              <div className="text-white font-semibold">{flight.arrival_code}</div>
              <div className="text-white/40 text-sm">{flight.arrival_city}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/40 text-xs border-t border-white/10 pt-4">
            <Calendar size={12} />
            {formatDate(flight.departure_time)}
          </div>
        </div>

        <BookingForm
          flight={flight}
          userId={user.id}
          defaultClass={defaultClass}
          prices={prices}
          seatsLeft={seatsLeft}
          walletBalance={wallet?.balance ?? 0}
        />

      </div>
    </div>
  )
}