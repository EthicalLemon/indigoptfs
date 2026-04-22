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
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('departure')
  const [classFilter, setClassFilter] = useState<'all' | 'economy' | 'business' | 'first'>('all')
  const [maxPrice, setMaxPrice] = useState(200000)

  // Stable supabase client ref - never recreated
  const supabaseRef = useRef(createClient())

  const from = searchParams.get('from') || ''
  const to   = searchParams.get('to')   || ''
  const date = searchParams.get('date') || ''

  const fetchFlights = async () => {
    setLoading(true)
    setError(null)
    const supabase = supabaseRef.current

    let query = supabase
      .from('flights')
      .select('*, host:profiles!host_id(id, full_name, email, role)')
      .neq('status', 'cancelled')
      .order('departure_time', { ascending: true })

    if (from) query = query.eq('departure_code', from)
    if (to)   query = query.eq('arrival_code', to)
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0)
      const end   = new Date(date); end.setHours(23, 59, 59, 999)
      query = query
        .gte('departure_time', start.toISOString())
        .lte('departure_time', end.toISOString())
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      console.error('Flight fetch error:', fetchError)
      setError(fetchError.message)
      setFlights([])
    } else {
      setFlights((data as Flight[]) || [])
    }
    setLoading(false)
  }

  // Fetch on mount and when search params change
  useEffect(() => {
    fetchFlights()
  }, [from, to, date])

  // Realtime subscription — re-fetch whenever flights table changes
  useEffect(() => {
    const supabase = supabaseRef.current
    const channel = supabase
      .channel('flights-page-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, () => {
        fetchFlights()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [from, to, date])

  const sorted = [...flights]
    .filter(f => {
      const price =
        classFilter === 'economy'  ? f.price_economy  :
        classFilter === 'business' ? f.price_business :
        classFilter === 'first'    ? f.price_first    :
        Math.min(f.price_economy, f.price_business, f.price_first)
      return price <= maxPrice
    })
    .sort((a, b) => {
      if (sortBy === 'price')    return a.price_economy - b.price_economy
      if (sortBy === 'duration') return a.duration_minutes - b.duration_minutes
      return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
    })

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl mb-1" style={{ color: 'var(--text-primary)' }}>
              {from && to
                ? `${AIRPORTS[from]?.city || from} → ${AIRPORTS[to]?.city || to}`
                : 'All Available Flights'}
            </h1>
            {date && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
          <button
            onClick={fetchFlights}
            className="indigo-btn indigo-btn-ghost mt-1 shrink-0"
            title="Refresh flights"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </motion.div>

        {/* Search bar */}
        <div className="mb-6"><FlightSearchBar /></div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-4 rounded-xl border text-sm" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
            ⚠️ Could not load flights: {error}. Check your Supabase connection and RLS policies.
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar filters */}
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-64 shrink-0">
            <div className="indigo-card p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal size={16} style={{ color: 'var(--indigo-accent)' }} />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Filters</h3>
              </div>

              {/* Sort */}
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Sort By</label>
                {[
                  { value: 'departure', label: 'Departure Time' },
                  { value: 'price',     label: 'Lowest Price'   },
                  { value: 'duration',  label: 'Shortest Flight' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setSortBy(opt.value as SortOption)}
                    className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-all text-left w-full mb-1"
                    style={{
                      background: sortBy === opt.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: sortBy === opt.value ? 'var(--indigo-accent)' : 'var(--text-secondary)',
                    }}>
                    <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: sortBy === opt.value ? 'var(--indigo-accent)' : '#6b7280', background: sortBy === opt.value ? 'var(--indigo-accent)' : 'transparent' }} />
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Class */}
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Cabin Class</label>
                {['all', 'economy', 'business', 'first'].map(c => (
                  <button key={c} onClick={() => setClassFilter(c as any)}
                    className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-all text-left w-full mb-1 capitalize"
                    style={{
                      background: classFilter === c ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: classFilter === c ? 'var(--indigo-accent)' : 'var(--text-secondary)',
                    }}>
                    <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: classFilter === c ? 'var(--indigo-accent)' : '#6b7280', background: classFilter === c ? 'var(--indigo-accent)' : 'transparent' }} />
                    {c === 'all' ? 'All Classes' : c === 'first' ? 'First Class' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  Max Price: ₹{maxPrice.toLocaleString()}
                </label>
                <input type="range" min={5000} max={200000} step={1000} value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-indigo-500" />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>₹5,000</span><span>₹2,00,000</span>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Flight list */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="indigo-card p-6 h-36 animate-pulse">
                    <div className="h-4 rounded-lg w-1/3 mb-3" style={{ background: 'var(--bg-tertiary)' }} />
                    <div className="h-3 rounded-lg w-1/2" style={{ background: 'var(--bg-tertiary)' }} />
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="indigo-card p-12 text-center">
                <Plane size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No flights found</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {from || to || date
                    ? 'No flights match your search. Try different dates or routes.'
                    : 'No flights have been created yet. Staff can add flights via the portal.'}
                </p>
                {(from || to || date) && (
                  <a href="/flights" className="indigo-btn indigo-btn-ghost text-sm">Clear filters →</a>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {sorted.length} flight{sorted.length !== 1 ? 's' : ''} found
                </p>
                <AnimatePresence>
                  {sorted.map((flight, i) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.04 }}
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
