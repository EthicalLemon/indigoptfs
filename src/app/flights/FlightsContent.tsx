'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Plane, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Flight } from '@/types'
import { FlightCard } from '@/components/flights/FlightCard'
import { FlightSearchBar } from '@/components/flights/FlightSearchBar'
import { AIRPORTS } from '@/lib/utils'

type SortOption = 'price' | 'duration' | 'departure'

export default function FlightsContent() {
  const searchParams = useSearchParams()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('departure')
  const [classFilter, setClassFilter] = useState<'all' | 'economy' | 'business' | 'first'>('all')
  const [maxPrice, setMaxPrice] = useState(200000)

  const supabaseRef = useRef(createClient())

  const from = searchParams.get('from') || ''
  const to   = searchParams.get('to')   || ''
  const date = searchParams.get('date') || ''

  const fetchFlights = async () => {
    setLoading(true)

    const { data } = await supabaseRef.current
      .from('flights')
      .select('*')
      .neq('status', 'cancelled')
      .order('departure_time', { ascending: true })

    setFlights((data as Flight[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFlights()
  }, [from, to, date])

  const sorted = [...flights]
    .filter(f => {
      const price = Math.min(f.price_economy, f.price_business, f.price_first)
      // ✅ FIX: actually apply the classFilter that was being ignored before
      const classOk =
        classFilter === 'all' ||
        (f[`seats_${classFilter}` as keyof Flight] as number) > 0
      return price <= maxPrice && classOk
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price_economy - b.price_economy
      if (sortBy === 'duration') return a.duration_minutes - b.duration_minutes
      return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
    })

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[var(--bg-primary)]">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">
              {from && to
                ? `${AIRPORTS[from]?.city || from} → ${AIRPORTS[to]?.city || to}`
                : 'All Flights'}
            </h1>
            {date && (
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {new Date(date).toDateString()}
              </p>
            )}
          </div>

          <button
            onClick={fetchFlights}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--bg-tertiary)] transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <FlightSearchBar />
        </div>

        <div className="flex gap-8">

          {/* SIDEBAR */}
          <div className="w-64 hidden lg:block">

            <div className="sticky top-28 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">

              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={16} />
                <span className="font-medium text-sm">Filters</span>
              </div>

              {/* SORT */}
              <div className="mb-6">
                <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wide">
                  Sort by
                </p>

                {[
                  { value: 'departure', label: 'Departure Time' },
                  { value: 'price', label: 'Lowest Price' },
                  { value: 'duration', label: 'Shortest Flight' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value as SortOption)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition mb-1 ${
                      sortBy === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* CLASS */}
              <div className="mb-6">
                <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wide">
                  Cabin Class
                </p>

                {['all', 'economy', 'business', 'first'].map(c => (
                  <button
                    key={c}
                    onClick={() => setClassFilter(c as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition mb-1 ${
                      classFilter === c
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {c === 'all' ? 'All Classes' : c}
                  </button>
                ))}
              </div>

              {/* PRICE */}
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  Max Price: ₹{maxPrice.toLocaleString()}
                </p>

                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={1000}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

            </div>
          </div>

          {/* RESULTS */}
          <div className="flex-1">

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 rounded-xl bg-[var(--bg-secondary)] animate-pulse border border-[var(--border)]" />
                ))}
              </div>
            ) : sorted.length === 0 ? (

              <div className="text-center py-20 border rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]">
                <Plane size={40} className="mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">No flights found</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Try adjusting filters or selecting another route.
                </p>
              </div>

            ) : (

              <div className="space-y-5">
                <p className="text-sm text-[var(--text-muted)]">
                  {sorted.length} flights found
                </p>

                <AnimatePresence>
                  {sorted.map((flight, i) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <FlightCard flight={flight} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  )
}