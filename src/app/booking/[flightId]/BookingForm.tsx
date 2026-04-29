'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Loader2, AlertCircle } from 'lucide-react'

type SeatClass = 'economy' | 'business' | 'first'

interface Props {
  flight: any
  userId: string
  defaultClass: SeatClass
  prices: Record<SeatClass, number>
  seatsLeft: Record<SeatClass, number>
  walletBalance: number
}

const classLabel: Record<SeatClass, string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First Class',
}

function generateRef() {
  return 'IND-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function BookingForm({
  flight,
  userId,
  defaultClass,
  prices,
  seatsLeft,
  walletBalance,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [selectedClass, setSelectedClass] = useState<SeatClass>(defaultClass)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = prices[selectedClass]
  const insufficientFunds = walletBalance < price

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (walletBalance < price) {
      setError('Insufficient wallet balance.')
      setLoading(false)
      return
    }

    const bookingRef = generateRef()

    // 1. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        flight_id: flight.id,
        booking_ref: bookingRef,
        seat_class: selectedClass,
        total_price: price,
        status: 'confirmed',
        passengers: [
          {
            first_name: firstName,
            last_name: lastName,
            email: email,
          },
        ],
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      setError('Failed to create booking. Please try again.')
      setLoading(false)
      return
    }

    // 2. Deduct from wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: walletBalance - price })
      .eq('user_id', userId)

    if (walletError) {
      // Booking created but wallet failed — still proceed, log it
      console.error('Wallet deduction failed:', walletError)
    }

    // 3. Insert wallet transaction record
    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      amount: -price,
      type: 'spend',
      description: `✈️ Flight ${flight.flight_number} — ${flight.departure_code} → ${flight.arrival_code} (${classLabel[selectedClass]})`,
    })

    // 4. Redirect to confirmation
    router.push(`/bookings/${booking.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Class Selector */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Select Cabin Class</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['economy', 'business', 'first'] as SeatClass[]).map((cls) => {
            const isSelected = selectedClass === cls
            const soldOut = seatsLeft[cls] === 0
            const cantAfford = walletBalance < prices[cls]

            return (
              <button
                key={cls}
                type="button"
                disabled={soldOut}
                onClick={() => setSelectedClass(cls)}
                className="p-4 rounded-xl border text-left transition-all duration-200"
                style={{
                  borderColor: isSelected
                    ? '#6366f1'
                    : 'rgba(255,255,255,0.1)',
                  background: isSelected
                    ? 'rgba(99,102,241,0.15)'
                    : 'rgba(255,255,255,0.03)',
                  opacity: soldOut ? 0.4 : 1,
                  cursor: soldOut ? 'not-allowed' : 'pointer',
                  boxShadow: isSelected
                    ? '0 0 0 1px #6366f1'
                    : 'none',
                }}
              >
                <div className="text-white font-semibold text-sm mb-1">
                  {classLabel[cls]}
                </div>
                <div
                  className="font-bold text-base"
                  style={{ color: isSelected ? '#818cf8' : 'rgba(255,255,255,0.5)' }}
                >
                  {formatPrice(prices[cls])}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{
                    color: soldOut
                      ? '#f87171'
                      : cantAfford
                      ? '#fbbf24'
                      : seatsLeft[cls] < 5
                      ? '#f87171'
                      : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {soldOut
                    ? 'Sold out'
                    : cantAfford
                    ? 'Insufficient balance'
                    : `${seatsLeft[cls]} seats left`}
                </div>
              </button>
            )
          })}
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
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Last Name</label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/50 text-sm">{classLabel[selectedClass]} fare</span>
          <span className="text-white font-semibold">{formatPrice(price)}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/50 text-sm">Wallet balance after</span>
          <span
            className="font-semibold text-sm"
            style={{ color: insufficientFunds ? '#f87171' : '#4ade80' }}
          >
            {insufficientFunds
              ? '—'
              : `₹${(walletBalance - price).toLocaleString('en-IN')}`}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <span className="text-white font-bold">Total</span>
          <span className="text-white font-bold text-xl">{formatPrice(price)}</span>
        </div>
      </div>

      {/* Insufficient funds warning */}
      {insufficientFunds && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">
            Not enough balance. You need{' '}
            <span className="font-bold">
              ₹{(price - walletBalance).toLocaleString('en-IN')}
            </span>{' '}
            more. Earn coins via <span className="font-mono">/daily</span> on Discord.
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || insufficientFunds}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Confirming...
          </>
        ) : (
          `Confirm Booking — ${formatPrice(price)}`
        )}
      </button>
    </form>
  )
}