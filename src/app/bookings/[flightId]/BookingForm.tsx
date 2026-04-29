'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type SeatClass = 'economy' | 'business' | 'first'

interface Props {
  flight: any
  userId: string
  defaultClass: SeatClass
  prices: Record<SeatClass, number>
  seatsLeft: Record<SeatClass, number>
}

const classLabel: Record<SeatClass, string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First Class',
}

function generateRef() {
  return 'IND-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function BookingForm({ flight, userId, defaultClass, prices, seatsLeft }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [selectedClass, setSelectedClass] = useState<SeatClass>(defaultClass)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

// ✅ Check if already booked
const { data: existing } = await supabase
  .from('bookings')
  .select('id')
  .eq('user_id', userId)
  .eq('flight_id', flight.id)
  .maybeSingle()

if (existing) {
  router.push(`/bookings/${existing.id}`)
  return
}

const bookingRef = generateRef()

const { data, error: bookingError } = await supabase
  .from('bookings')
  .insert({
    user_id: userId,
    flight_id: flight.id,
    booking_ref: bookingRef,
    seat_class: selectedClass,
    total_price: prices[selectedClass],
    status: 'confirmed',
    passengers: [
      {
        first_name: firstName,
        last_name: lastName,
        email: email,
      }
    ]
  })
  .select('id')
  .single()

if (bookingError || !data) {
  console.error(bookingError)
  setError(bookingError?.message || 'Something went wrong.')
  setLoading(false)
  return
}

router.push(`/bookings/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Class Selector */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Select Cabin Class</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['economy', 'business', 'first'] as SeatClass[]).map(cls => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              disabled={seatsLeft[cls] === 0}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedClass === cls
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/10 hover:border-white/20'
              } ${seatsLeft[cls] === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="text-white font-semibold text-sm mb-1">{classLabel[cls]}</div>
              <div className="text-indigo-400 font-bold">{formatPrice(prices[cls])}</div>
              <div className={`text-xs mt-1 ${seatsLeft[cls] < 5 ? 'text-red-400' : 'text-white/40'}`}>
                {seatsLeft[cls] === 0 ? 'Sold out' : `${seatsLeft[cls]} seats left`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Passenger Details */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Passenger Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white/50 text-xs mb-1.5">First Name</label>
            <input
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Last Name</label>
            <input
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-white/50 text-xs mb-1.5">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/50 text-sm">{classLabel[selectedClass]} fare</span>
          <span className="text-white font-semibold">{formatPrice(prices[selectedClass])}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <span className="text-white font-bold">Total</span>
          <span className="text-white font-bold text-xl">{formatPrice(prices[selectedClass])}</span>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Confirming...</>
        ) : (
          `Confirm Booking — ${formatPrice(prices[selectedClass])}`
        )}
      </button>
    </form>
  )
}