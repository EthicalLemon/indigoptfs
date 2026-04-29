'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plane, Clock } from 'lucide-react'
import Link from 'next/link'
import { AIRPORTS } from '@/lib/utils'

/* ── Inlined so it never depends on utils export ── */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

const ROUTES = [
  { from: 'DEL', to: 'DXB', duration: 195, frequency: 'Daily',          price: 18500 },
  { from: 'DEL', to: 'LHR', duration: 510, frequency: '5x Weekly',      price: 52000 },
  { from: 'DEL', to: 'SIN', duration: 345, frequency: 'Daily',          price: 24200 },
  { from: 'DEL', to: 'BKK', duration: 270, frequency: 'Daily',          price: 16800 },
  { from: 'DEL', to: 'NRT', duration: 420, frequency: '4x Weekly',      price: 38900 },
  { from: 'DEL', to: 'JFK', duration: 900, frequency: '3x Weekly',      price: 72000 },
  { from: 'BOM', to: 'DXB', duration: 180, frequency: 'Daily',          price: 15200 },
  { from: 'BOM', to: 'SIN', duration: 330, frequency: 'Daily',          price: 22800 },
  { from: 'BOM', to: 'LHR', duration: 525, frequency: '4x Weekly',      price: 49500 },
  { from: 'BLR', to: 'DXB', duration: 210, frequency: 'Daily',          price: 17100 },
  { from: 'BLR', to: 'SIN', duration: 345, frequency: '5x Weekly',      price: 23600 },
  { from: 'DEL', to: 'BOM', duration: 120, frequency: 'Multiple daily', price:  4200 },
  { from: 'DEL', to: 'BLR', duration: 155, frequency: 'Multiple daily', price:  5100 },
  { from: 'DEL', to: 'MAA', duration: 160, frequency: 'Daily',          price:  5400 },
  { from: 'DEL', to: 'HYD', duration: 130, frequency: 'Daily',          price:  4600 },
  { from: 'DEL', to: 'CCU', duration: 120, frequency: 'Multiple daily', price:  3900 },
  { from: 'DEL', to: 'GOI', duration: 165, frequency: 'Daily',          price:  5800 },
  { from: 'DEL', to: 'COK', duration: 175, frequency: 'Daily',          price:  5600 },
  { from: 'BOM', to: 'BLR', duration:  90, frequency: 'Multiple daily', price:  3500 },
  { from: 'BOM', to: 'MAA', duration: 105, frequency: 'Daily',          price:  3900 },
  { from: 'DEL', to: 'CDG', duration: 480, frequency: '3x Weekly',      price: 48500 },
  { from: 'DEL', to: 'KUL', duration: 360, frequency: '4x Weekly',      price: 26800 },
  { from: 'DEL', to: 'HKG', duration: 390, frequency: '3x Weekly',      price: 32000 },
  { from: 'DEL', to: 'SYD', duration: 660, frequency: '2x Weekly',      price: 68000 },
]

const REGIONS = ['All', 'Domestic', 'Middle East', 'Southeast Asia', 'Europe', 'Americas', 'Pacific']

const REGION_CODES: Record<string, string[]> = {
  Domestic:         ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'GOI', 'COK', 'AMD', 'JAI'],
  'Middle East':    ['DXB'],
  'Southeast Asia': ['SIN', 'BKK', 'KUL', 'HKG'],
  Europe:           ['LHR', 'CDG'],
  Americas:         ['JFK'],
  Pacific:          ['NRT', 'SYD'],
}

// ✅ Helper to safely index AIRPORTS with any string
const getAirport = (code: string) => AIRPORTS[code as keyof typeof AIRPORTS]

export default function RoutesPage() {
  const [region, setRegion] = useState('All')
  const [search, setSearch]   = useState('')

  const filtered = ROUTES.filter(r => {
    const q = search.toLowerCase()
    const matchesSearch =
      q === '' ||
      getAirport(r.from)?.city.toLowerCase().includes(q) ||
      getAirport(r.to)?.city.toLowerCase().includes(q) ||
      r.from.toLowerCase().includes(q) ||
      r.to.toLowerCase().includes(q)

    const matchesRegion =
      region === 'All' ||
      (() => {
        const codes = REGION_CODES[region] ?? []
        if (region === 'Domestic') return codes.includes(r.from) && codes.includes(r.to)
        return codes.includes(r.to) || codes.includes(r.from)
      })()

    return matchesSearch && matchesRegion
  })

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p
            className="text-xs tracking-widest uppercase font-semibold mb-3"
            style={{ color: 'var(--indigo-accent)' }}
          >
            Route Network
          </p>
          <h1
            className="font-display font-bold text-5xl md:text-6xl mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Where We <span className="italic font-light">Fly</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            120+ destinations across 6 continents. Every route, every connection — IndiGo Airlines.
          </p>
        </motion.div>

        {/* World map card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="indigo-card p-8 mb-10 text-center relative overflow-hidden"
          style={{ minHeight: 220 }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, var(--indigo-primary) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative">
            <div className="text-6xl mb-3">🌍</div>
            <h3
              className="font-display font-bold text-2xl mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Global Network
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Connecting {Object.keys(AIRPORTS).length} cities across the world
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {Object.keys(AIRPORTS).slice(0, 12).map(code => (
                <span
                  key={code}
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold"
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-accent)' }}
                >
                  {code}
                </span>
              ))}
              <span className="px-3 py-1 rounded-full text-xs" style={{ color: 'var(--text-muted)' }}>
                +{Object.keys(AIRPORTS).length - 12} more
              </span>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MapPin
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--indigo-accent)' }}
            />
            <input
              type="text"
              placeholder="Search city or airport code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="indigo-input pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: region === r ? 'var(--indigo-primary)' : 'var(--bg-secondary)',
                  color:      region === r ? 'white' : 'var(--text-secondary)',
                  border:     `1px solid ${region === r ? 'var(--indigo-primary)' : 'var(--border)'}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} routes shown
        </p>

        {/* Route table */}
        <div className="indigo-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="indigo-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Duration</th>
                  <th>Frequency</th>
                  <th>From Price</th>
                  <th>Book</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((route, i) => (
                  <motion.tr
                    key={`${route.from}-${route.to}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <Plane size={14} className="-rotate-45" style={{ color: 'var(--indigo-accent)' }} />
                        <div>
                          <div className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {route.from}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {getAirport(route.from)?.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        <div>
                          <div className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {route.to}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {getAirport(route.to)?.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className="flex items-center gap-1 text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Clock size={12} />
                        {formatDuration(route.duration)}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {route.frequency}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-sm" style={{ color: 'var(--indigo-accent)' }}>
                        ₹{route.price.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/flights?from=${route.from}&to=${route.to}`}
                        className="indigo-btn indigo-btn-primary text-xs px-3 py-1.5"
                      >
                        Search →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}