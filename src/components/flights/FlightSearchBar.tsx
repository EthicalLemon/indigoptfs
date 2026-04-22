'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plane, Calendar, ArrowLeftRight } from 'lucide-react'
import { AIRPORTS } from '@/lib/utils'

export function FlightSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [from, setFrom] = useState(searchParams.get('from') || '')
  const [to, setTo] = useState(searchParams.get('to') || '')
  const [date, setDate] = useState(searchParams.get('date') || '')

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (date) params.set('date', date)
    router.push(`/flights?${params.toString()}`)
  }

  const airportOptions = Object.entries(AIRPORTS)

  return (
    <form onSubmit={search} className="indigo-card p-4 flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1">
        <label className="block text-xs tracking-widest uppercase font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>From</label>
        <div className="relative">
          <Plane size={14} className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-45" style={{ color: 'var(--indigo-accent)' }} />
          <select value={from} onChange={e => setFrom(e.target.value)} className="indigo-input pl-8 appearance-none text-sm">
            <option value="">Any origin</option>
            {airportOptions.map(([code, { city }]) => (
              <option key={code} value={code}>{city} ({code})</option>
            ))}
          </select>
        </div>
      </div>
      <button type="button" onClick={() => { const t = from; setFrom(to); setTo(t) }} className="p-2.5 rounded-lg flex-shrink-0 mb-0.5" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
        <ArrowLeftRight size={16} />
      </button>
      <div className="flex-1">
        <label className="block text-xs tracking-widest uppercase font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>To</label>
        <div className="relative">
          <Plane size={14} className="absolute left-3 top-1/2 -translate-y-1/2 rotate-45" style={{ color: 'var(--indigo-accent)' }} />
          <select value={to} onChange={e => setTo(e.target.value)} className="indigo-input pl-8 appearance-none text-sm">
            <option value="">Any destination</option>
            {airportOptions.map(([code, { city }]) => (
              <option key={code} value={code}>{city} ({code})</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1">
        <label className="block text-xs tracking-widest uppercase font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--indigo-accent)' }} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="indigo-input pl-8 text-sm" />
        </div>
      </div>
      <button type="submit" className="indigo-btn indigo-btn-primary py-3 px-6 text-sm flex-shrink-0">
        Search
      </button>
    </form>
  )
}
