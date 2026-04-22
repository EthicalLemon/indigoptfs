'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plane, ChevronDown, Users, Wifi, Utensils } from 'lucide-react'
import type { Flight, SeatClass } from '@/types'
import { formatTime, formatDate, formatDuration, formatPrice, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

export function FlightCard({ flight }: { flight: Flight }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedClass, setSelectedClass] = useState<SeatClass>('economy')

  const prices: Record<SeatClass, number> = {
    economy: flight.price_economy,
    business: flight.price_business,
    first: flight.price_first,
  }

  const seatsLeft: Record<SeatClass, number> = {
    economy: flight.seats_economy - flight.seats_economy_booked,
    business: flight.seats_business - flight.seats_business_booked,
    first: flight.seats_first - flight.seats_first_booked,
  }

  return (
    <div className="indigo-card overflow-hidden">
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Flight info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center">
                <Plane size={14} className="text-white -rotate-45" />
              </div>
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--indigo-accent)' }}>
                {flight.flight_number}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{flight.aircraft_type}</span>
              <span className={`status-badge text-xs ${STATUS_COLORS[flight.status]}`}>
                {STATUS_LABELS[flight.status]}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="text-center">
                <div className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
                  {formatTime(flight.departure_time)}
                </div>
                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{flight.departure_code}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{flight.departure_city}</div>
              </div>

              {/* Route line */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(flight.duration_minutes)}</div>
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <Plane size={14} className="-rotate-0" style={{ color: 'var(--indigo-accent)' }} />
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Direct</div>
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
                  {formatTime(flight.arrival_time)}
                </div>
                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{flight.arrival_code}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{flight.arrival_city}</div>
              </div>
            </div>
          </div>

          {/* Price & Book */}
          <div className="md:border-l md:pl-5 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3" style={{ borderColor: 'var(--border)' }}>
            <div className="text-right">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Economy from</div>
              <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                {formatPrice(flight.price_economy)}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>per person</div>
            </div>
            <Link
              href={`/booking/${flight.id}`}
              className="indigo-btn indigo-btn-primary text-sm px-5 py-2.5"
              onClick={e => e.stopPropagation()}
            >
              Book Now
            </Link>
          </div>

          <button
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse flight details' : 'Expand flight details'}
          >
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Class selector */}
              <div className="md:col-span-2">
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Select Class</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(['economy', 'business', 'first'] as SeatClass[]).map(cls => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`p-3 rounded-xl border text-left transition-all ${selectedClass === cls ? 'border-indigo-500 bg-indigo-500/10' : 'hover:border-indigo-500/30'}`}
                      style={{ borderColor: selectedClass === cls ? 'var(--indigo-primary)' : 'var(--border)' }}
                    >
                      <div className="font-semibold text-sm capitalize mb-1" style={{ color: 'var(--text-primary)' }}>
                        {cls === 'first' ? 'First Class' : cls.charAt(0).toUpperCase() + cls.slice(1)}
                      </div>
                      <div className="font-bold text-base" style={{ color: 'var(--indigo-accent)' }}>{formatPrice(prices[cls])}</div>
                      <div className="text-xs mt-1" style={{ color: seatsLeft[cls] < 5 ? '#f87171' : 'var(--text-muted)' }}>
                        {seatsLeft[cls]} seats left
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flight details */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Flight Details</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Date', value: formatDate(flight.departure_time) },
                    { label: 'Gate', value: flight.gate || 'TBA' },
                    { label: 'Terminal', value: flight.terminal || 'TBA' },
                    { label: 'Aircraft', value: flight.aircraft_type },
                    { label: 'Duration', value: formatDuration(flight.duration_minutes) },
                    { label: 'Host', value: flight.host?.full_name || 'IndiGo Airlines' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Wifi size={14} style={{ color: 'var(--indigo-accent)' }} />
                  <Utensils size={14} style={{ color: 'var(--indigo-accent)' }} />
                  <Users size={14} style={{ color: 'var(--indigo-accent)' }} />
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 flex justify-end">
              <Link
                href={`/booking/${flight.id}?class=${selectedClass}`}
                className="indigo-btn indigo-btn-primary"
              >
                Book {selectedClass === 'first' ? 'First Class' : selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1)} — {formatPrice(prices[selectedClass])}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
