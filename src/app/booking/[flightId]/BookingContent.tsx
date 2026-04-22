'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plane, User, Mail, Phone, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Flight, SeatClass, Passenger } from '@/types'
import { formatTime, formatDate, formatDuration, formatPrice, generateBookingRef } from '@/lib/utils'
import toast from 'react-hot-toast'

type Step = 'details' | 'payment' | 'confirm'

export default function BookingContent() {
  const { flightId } = useParams<{ flightId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedClass = (searchParams.get('class') || 'economy') as SeatClass
  const [flight, setFlight] = useState<Flight | null>(null)
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookingRef, setBookingRef] = useState<string>('')
  const [passenger, setPassenger] = useState<Passenger>({
    first_name: '', last_name: '', email: '', phone: '', passport_number: ''
  })
  const [user, setUser] = useState<any>(null)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.from('flights').select('*, host:profiles!host_id(id, full_name)').eq('id', flightId).single()
      .then(({ data }) => { setFlight(data as Flight); setLoading(false) })
  }, [flightId])

  const priceMap: Record<SeatClass, number> = {
    economy: flight?.price_economy || 0,
    business: flight?.price_business || 0,
    first: flight?.price_first || 0,
  }

  const tax = Math.round((priceMap[selectedClass] || 0) * 0.18)
  const total = (priceMap[selectedClass] || 0) + tax

  const handleBook = async () => {
    if (!user) { router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname)); return }
    if (!flight) return
    setSubmitting(true)
    const supabase = supabaseRef.current
    const ref = generateBookingRef()
    const { error } = await supabase.from('bookings').insert({
      booking_ref: ref,
      user_id: user.id,
      flight_id: flight.id,
      seat_class: selectedClass,
      passengers: [passenger],
      total_price: total,
      status: 'confirmed',
    })

    if (error) {
      toast.error('Booking failed. Please try again.')
      setSubmitting(false)
      return
    }

    // Update seat count
    const seatField = `seats_${selectedClass}_booked`
    await supabase.from('flights').update({
      [seatField]: (flight[`seats_${selectedClass}_booked` as keyof Flight] as number) + 1
    }).eq('id', flight.id)

    toast.success(`Booking confirmed! Ref: ${ref}`)
    setBookingRef(ref)
    setStep('confirm')
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!flight) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Flight not found</h2>
      </div>
    </div>
  )

  if (step === 'confirm') return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="indigo-card p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Booking Confirmed!</h2>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Your flight has been successfully booked.</p>
        <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Booking Reference</p>
          <p className="font-mono font-bold text-2xl" style={{ color: 'var(--indigo-accent)' }}>{bookingRef}</p>
        </div>
        <div className="space-y-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          <p>{flight.departure_city} → {flight.arrival_city}</p>
          <p>{formatDate(flight.departure_time)} • {formatTime(flight.departure_time)}</p>
          <p className="capitalize">{selectedClass} Class • {formatPrice(total)}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/manage')} className="indigo-btn indigo-btn-primary flex-1">View My Bookings</button>
          <button onClick={() => router.push('/flights')} className="indigo-btn indigo-btn-ghost flex-1">Book Another</button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-3xl mb-8" style={{ color: 'var(--text-primary)' }}>
          Complete Your Booking
        </motion.h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[{ id: 'details', label: 'Passenger Details' }, { id: 'payment', label: 'Payment' }].map((s, i) => {
            const isActive = step === s.id
            const isCompleted = step === 'payment' && i === 0
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: isActive ? 'var(--indigo-primary)' : isCompleted ? 'rgba(34,197,94,0.2)' : 'var(--bg-tertiary)',
                    color: isActive ? 'white' : isCompleted ? '#4ade80' : 'var(--text-muted)',
                    border: isCompleted ? '1px solid rgba(34,197,94,0.4)' : 'none',
                  }}
                >
                  {isCompleted ? '✓' : i + 1}
                </div>
                <span className="text-sm font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
                {i < 1 && <div className="w-12 h-px" style={{ background: isCompleted ? 'rgba(34,197,94,0.4)' : 'var(--border)' }} />}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'details' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="indigo-card p-6">
                <h2 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <User size={18} style={{ color: 'var(--indigo-accent)' }} /> Passenger Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', key: 'first_name', type: 'text', placeholder: 'John' },
                    { label: 'Last Name', key: 'last_name', type: 'text', placeholder: 'Doe' },
                    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@example.com' },
                    { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 9876543210' },
                    { label: 'Passport / ID Number', key: 'passport_number', type: 'text', placeholder: 'AB1234567' },
                    { label: 'Date of Birth', key: 'date_of_birth', type: 'date', placeholder: '' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(passenger as any)[field.key] || ''}
                        onChange={e => setPassenger(p => ({ ...p, [field.key]: e.target.value }))}
                        className="indigo-input"
                        required={['first_name', 'last_name', 'email', 'phone'].includes(field.key)}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (!passenger.first_name || !passenger.last_name || !passenger.email || !passenger.phone) {
                      toast.error('Please fill all required fields')
                      return
                    }
                    setStep('payment')
                  }}
                  className="indigo-btn indigo-btn-primary w-full mt-6"
                >
                  Continue to Payment →
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="indigo-card p-6">
                <h2 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CreditCard size={18} style={{ color: 'var(--indigo-accent)' }} /> Payment Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" className="indigo-input" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Expiry</label>
                      <input type="text" placeholder="MM / YY" className="indigo-input" maxLength={7} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>CVV</label>
                      <input type="text" placeholder="•••" className="indigo-input" maxLength={4} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Name on Card</label>
                    <input type="text" placeholder="John Doe" className="indigo-input" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep('details')} className="indigo-btn indigo-btn-ghost flex-1">← Back</button>
                  <button onClick={handleBook} disabled={submitting} className="indigo-btn indigo-btn-primary flex-1">
                    {submitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : `Confirm & Pay ${formatPrice(total)}`}
                  </button>
                </div>
                <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>🔒 Secured by 256-bit SSL encryption</p>
              </motion.div>
            )}
          </div>

          {/* Flight summary */}
          <div>
            <div className="indigo-card p-5 sticky top-24">
              <h3 className="font-semibold text-sm mb-4 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Flight Summary</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                  <Plane size={12} style={{ color: 'var(--indigo-accent)' }} />
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--indigo-accent)' }}>{flight.flight_number}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{formatTime(flight.departure_time)}</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flight.departure_code}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{flight.departure_city}</div>
                </div>
                <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div>{formatDuration(flight.duration_minutes)}</div>
                  <div className="text-xl my-1">→</div>
                  <div>Direct</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{formatTime(flight.arrival_time)}</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flight.arrival_code}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{flight.arrival_city}</div>
                </div>
              </div>
              <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{formatDate(flight.departure_time)} · {flight.aircraft_type}</div>
              <div className="py-1 px-3 rounded-full text-xs font-medium capitalize w-fit mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-accent)' }}>
                {selectedClass === 'first' ? 'First Class' : selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1)}
              </div>
              <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
                {[
                  { label: 'Base Fare', value: formatPrice(priceMap[selectedClass]) },
                  { label: 'Taxes & Fees (18%)', value: formatPrice(tax) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ color: 'var(--indigo-accent)' }}>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
