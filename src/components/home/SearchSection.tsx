'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plane, Calendar, Users, ArrowLeftRight, Search } from 'lucide-react'
import { AIRPORTS } from '@/lib/utils'
import { format } from 'date-fns'

type TripType = 'one-way' | 'round-trip'

export function SearchSection() {
  const router = useRouter()
  const [tripType, setTripType] = useState<TripType>('one-way')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(1)

  const swap = () => {
    const tmp = from
    setFrom(to)
    setTo(tmp)
  }

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({ from, to, date, passengers: String(passengers) })
    if (tripType === 'round-trip' && returnDate) params.set('returnDate', returnDate)
    router.push(`/flights?${params.toString()}`)
  }

  const airportOptions = Object.entries(AIRPORTS).map(([code, { city }]) => ({ code, city }))

  return (
    <section className="relative -mt-16 z-10 px-4 sm:px-6 mb-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="indigo-card p-6 md:p-8 shadow-2xl"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1)' }}
        >
          {/* Trip type tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: 'var(--bg-tertiary)' }}>
            {(['one-way', 'round-trip'] as TripType[]).map(t => (
              <button
                key={t}
                onClick={() => setTripType(t)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all capitalize"
                style={{
                  background: tripType === t ? 'var(--indigo-primary)' : 'transparent',
                  color: tripType === t ? 'white' : 'var(--text-muted)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={search}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* From */}
              <div className="relative">
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>From</label>
                <div className="relative">
                  <Plane size={16} className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-45" style={{ color: 'var(--indigo-accent)' }} />
                  <select
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="indigo-input pl-9 appearance-none"
                    required
                  >
                    <option value="">Select city</option>
                    {airportOptions.map(a => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap + To */}
              <div className="relative">
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>To</label>
                <div className="relative">
                  <Plane size={16} className="absolute left-3 top-1/2 -translate-y-1/2 rotate-45" style={{ color: 'var(--indigo-accent)' }} />
                  <select
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="indigo-input pl-9 appearance-none"
                    required
                  >
                    <option value="">Select city</option>
                    {airportOptions.map(a => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={swap}
                    className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:rotate-180"
                    style={{ background: 'var(--indigo-primary)', color: 'white', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}
                  >
                    <ArrowLeftRight size={14} />
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  {tripType === 'round-trip' ? 'Depart' : 'Date'}
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--indigo-accent)' }} />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="indigo-input pl-9"
                    required
                  />
                </div>
              </div>

              {/* Return date or passengers */}
              {tripType === 'round-trip' ? (
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Return</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--indigo-accent)' }} />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      min={date}
                      className="indigo-input pl-9"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Passengers</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--indigo-accent)' }} />
                    <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="indigo-input pl-9 appearance-none">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ✈ 120+ destinations worldwide • Best price guarantee
              </p>
              <button type="submit" className="indigo-btn indigo-btn-primary px-8 py-3 text-base group">
                <Search size={18} />
                Search Flights
                <motion.div
                  className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)' }}
                />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
