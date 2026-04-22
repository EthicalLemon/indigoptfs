'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plane, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Flight } from '@/types'
import { formatTime, formatDate, formatDuration, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

export default function StatusContent() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    const { data } = await supabase
      .from('flights')
      .select('*, host:profiles!host_id(id, full_name)')
      .ilike('flight_number', `%${query.trim()}%`)
      .order('departure_time', { ascending: false })
      .limit(1)
      .single()
    setResult(data as Flight || null)
    setLoading(false)
  }

  const getProgress = (flight: Flight) => {
    const now = Date.now()
    const dep = new Date(flight.departure_time).getTime()
    const arr = new Date(flight.arrival_time).getTime()
    if (now < dep) return 0
    if (now > arr) return 100
    return Math.round(((now - dep) / (arr - dep)) * 100)
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Real-Time</p>
          <h1 className="font-display font-bold text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Flight <span className="italic font-light">Status</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>Enter a flight number to get live status</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={search} className="indigo-card p-4 flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--indigo-accent)' }} />
            <input type="text" placeholder="Flight number e.g. IGO101" value={query}
              onChange={e => setQuery(e.target.value.toUpperCase())} className="indigo-input pl-10 font-mono" />
          </div>
          <button type="submit" disabled={loading} className="indigo-btn indigo-btn-primary px-6">
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : 'Track'}
          </button>
        </motion.form>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['IGO101', 'IGO202', 'IGO315', 'IGO440'].map(fn => (
            <button key={fn} onClick={() => setQuery(fn)}
              className="px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--indigo-accent)', background: 'var(--bg-secondary)' }}>
              {fn}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="indigo-card p-10 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>Tracking flight...</p>
            </motion.div>
          )}
          {!loading && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="indigo-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="font-mono font-bold text-2xl" style={{ color: 'var(--indigo-accent)' }}>{result.flight_number}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{result.aircraft_type}</div>
                  </div>
                  <span className={`status-badge ${STATUS_COLORS[result.status]}`}>
                    <div className={`w-2 h-2 rounded-full ${['boarding','departed'].includes(result.status) ? 'animate-pulse' : ''}`} style={{ background: 'currentColor' }} />
                    {STATUS_LABELS[result.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <div className="font-display font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>{result.departure_code}</div>
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{result.departure_city}</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--indigo-accent)' }}>{formatTime(result.departure_time)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(result.departure_time)}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(result.duration_minutes)}</div>
                    <div className="w-full relative h-6 flex items-center">
                      <div className="w-full h-px" style={{ background: 'var(--border)' }} />
                      <motion.div className="absolute" style={{ left: `${getProgress(result)}%` }}
                        initial={{ left: 0 }} animate={{ left: `${getProgress(result)}%` }} transition={{ duration: 1.5, ease: 'easeInOut' }}>
                        <Plane size={18} style={{ color: 'var(--indigo-accent)' }} />
                      </motion.div>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Direct</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>{result.arrival_code}</div>
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{result.arrival_city}</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--indigo-accent)' }}>{formatTime(result.arrival_time)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(result.arrival_time)}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>{result.departure_code}</span>
                    <span>{getProgress(result)}% complete</span>
                    <span>{result.arrival_code}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--indigo-primary), var(--indigo-accent))' }}
                      initial={{ width: 0 }} animate={{ width: `${getProgress(result)}%` }} transition={{ duration: 1.2, delay: 0.3 }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {[
                    { label: 'Gate', value: result.gate || 'TBA' },
                    { label: 'Terminal', value: result.terminal || 'TBA' },
                    { label: 'Aircraft', value: result.aircraft_type },
                    { label: 'Host', value: (result as any).host?.full_name || 'IndiGo Airlines' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {result.notes && (
                <div className="indigo-card p-4 flex items-start gap-3" style={{ borderColor: '#f59e0b', background: 'rgba(245,158,11,0.05)' }}>
                  <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.notes}</p>
                </div>
              )}
            </motion.div>
          )}
          {!loading && searched && !result && (
            <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="indigo-card p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Flight Not Found</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No flight matching "{query}". Check the number and try again.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
