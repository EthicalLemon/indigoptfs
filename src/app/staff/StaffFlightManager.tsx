'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Save, Plane, AlertTriangle, RefreshCw, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Flight, FlightStatus } from '@/types'
import { formatTime, formatDate, STATUS_LABELS, AIRPORTS } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── FIX: never cache a module-level supabase client.
// The old _client singleton caused "stuck at saving" because it held
// a stale auth session after token refresh. Always create fresh.
const getClient = () => createClient()

const EMPTY: any = {
  flight_number: '', departure_city: '', departure_code: '', arrival_city: '',
  arrival_code: '', departure_time: '', arrival_time: '', duration_minutes: 0,
  aircraft_type: '', aircraft_id: '', status: 'scheduled',
  price_economy: 5000, price_business: 15000, price_first: 40000,
  seats_economy: 150, seats_business: 24, seats_first: 8,
  seats_economy_booked: 0, seats_business_booked: 0, seats_first_booked: 0,
  gate: '', terminal: '', notes: '',
}

const STATUSES: FlightStatus[] = ['scheduled','boarding','departed','arrived','delayed','cancelled']

const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' },
  boarding:  { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  departed:  { bg: 'rgba(34,211,238,0.12)',  color: '#22d3ee' },
  arrived:   { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  delayed:   { bg: 'rgba(249,115,22,0.12)',  color: '#fb923c' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
}

export function StaffFlightManager({ profile }: { profile: Profile }) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [display, setDisplay]  = useState<Flight[]>([])
  const [loading, setLoading]  = useState(true)
  const [search, setSearch]    = useState('')
  const [statusF, setStatusF]  = useState('all')
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState<Flight | null>(null)
  const [form, setForm]             = useState<any>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getClient()
    let q = sb.from('flights')
      .select('*, host:profiles!host_id(id, full_name, email, role)')
      .order('departure_time', { ascending: false })
    if (profile?.role === 'host') q = q.eq('host_id', profile.id)
    const { data, error } = await q
    if (error) toast.error('Failed to load: ' + error.message)
    else setFlights((data as Flight[]) || [])
    setLoading(false)
  }, [profile?.id, profile?.role])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let r = [...flights]
    if (statusF !== 'all') r = r.filter(f => f.status === statusF)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(f =>
        f.flight_number.toLowerCase().includes(q) ||
        f.departure_code.toLowerCase().includes(q) ||
        f.arrival_code.toLowerCase().includes(q)
      )
    }
    setDisplay(r)
  }, [flights, search, statusF])

  const canEdit   = (f: Flight) => profile?.role === 'admin' || profile?.role === 'staff' || (profile?.role === 'host' && f.host_id === profile.id)
  const canDelete = () => profile?.role === 'admin'
  const canCreate = ['admin','staff','host'].includes(profile?.role)

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit   = (f: Flight) => {
    setEditing(f)
    setForm({
      flight_number: f.flight_number, departure_city: f.departure_city,
      departure_code: f.departure_code, arrival_city: f.arrival_city,
      arrival_code: f.arrival_code,
      departure_time: f.departure_time.slice(0, 16),
      arrival_time:   f.arrival_time.slice(0, 16),
      duration_minutes: f.duration_minutes, aircraft_type: f.aircraft_type,
      aircraft_id: f.aircraft_id || '', status: f.status,
      price_economy: f.price_economy, price_business: f.price_business, price_first: f.price_first,
      seats_economy: f.seats_economy, seats_business: f.seats_business, seats_first: f.seats_first,
      seats_economy_booked: f.seats_economy_booked, seats_business_booked: f.seats_business_booked,
      seats_first_booked: f.seats_first_booked,
      gate: f.gate || '', terminal: f.terminal || '', notes: f.notes || '',
    })
    setShowModal(true)
  }

  const calcDur = (dep: string, arr: string) =>
    dep && arr ? Math.max(0, Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000)) : 0

  const save = async () => {
    const missing: string[] = []
    if (!form.flight_number.trim()) missing.push('Flight Number')
    if (!form.departure_code)       missing.push('Departure Airport')
    if (!form.arrival_code)         missing.push('Arrival Airport')
    if (!form.departure_time)       missing.push('Departure Time')
    if (!form.arrival_time)         missing.push('Arrival Time')
    if (!form.aircraft_type.trim()) missing.push('Aircraft Type')
    if (missing.length) { toast.error('Missing: ' + missing.join(', ')); return }
    if (form.departure_code === form.arrival_code) { toast.error('Departure and arrival must differ'); return }
    if (new Date(form.arrival_time) <= new Date(form.departure_time)) { toast.error('Arrival must be after departure'); return }

    setSaving(true)

    // CRITICAL FIX: create a fresh client here — never reuse a cached one.
    // Stale sessions cause insert to silently hang forever.
    const sb = getClient()

    const airports = AIRPORTS as Record<string, { city: string }>
    const payload: Record<string, any> = {
      flight_number:         form.flight_number.toUpperCase().trim(),
      departure_city:        form.departure_city || airports[form.departure_code]?.city || form.departure_code,
      departure_code:        form.departure_code.toUpperCase(),
      arrival_city:          form.arrival_city   || airports[form.arrival_code]?.city   || form.arrival_code,
      arrival_code:          form.arrival_code.toUpperCase(),
      departure_time:        new Date(form.departure_time).toISOString(),
      arrival_time:          new Date(form.arrival_time).toISOString(),
      duration_minutes:      calcDur(form.departure_time, form.arrival_time),
      aircraft_type:         form.aircraft_type.trim(),
      aircraft_id:           form.aircraft_type.replace(/\s+/g, '-').toLowerCase(),
      status:                form.status,
      price_economy:         Number(form.price_economy),
      price_business:        Number(form.price_business),
      price_first:           Number(form.price_first),
      seats_economy:         Number(form.seats_economy),
      seats_business:        Number(form.seats_business),
      seats_first:           Number(form.seats_first),
      seats_economy_booked:  editing ? Number(form.seats_economy_booked)  : 0,
      seats_business_booked: editing ? Number(form.seats_business_booked) : 0,
      seats_first_booked:    editing ? Number(form.seats_first_booked)    : 0,
      gate:                  form.gate     || null,
      terminal:              form.terminal || null,
      notes:                 form.notes    || null,
    }

    try {
      if (editing) {
        const { error } = await sb.from('flights').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success(`✅ ${payload.flight_number} updated`)
      } else {
        payload.host_id    = profile.id
        payload.created_by = profile.id
        const { data, error } = await sb.from('flights').insert(payload).select().single()
        if (error) throw error
        toast.success(`✅ ${data.flight_number} created`)
      }
      setShowModal(false)
      setEditing(null)
      await load()
    } catch (err: any) {
      console.error('Save error:', err)
      toast.error(err?.message || err?.details || 'Save failed — check console')
    } finally {
      setSaving(false)
    }
  }

  const deleteFlight = async (id: string) => {
    const { error } = await getClient().from('flights').delete().eq('id', id)
    if (error) { toast.error('Delete failed: ' + error.message); return }
    toast.success('Flight deleted')
    setDeleteId(null)
    await load()
  }

  const airportOpts = Object.entries(AIRPORTS as Record<string, { city: string }>)

  // Reusable input styles
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
    color: '#fff', outline: 'none', boxSizing: 'border-box',
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )

  const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} style={{ ...inputStyle, opacity: props.disabled ? 0.5 : 1 }} />
  )

  const Sel = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
    <select {...props} style={{ ...inputStyle, opacity: props.disabled ? 0.5 : 1 }} />
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em', margin: 0 }}>Flight Manager</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>
            {profile.role === 'host' ? 'Your assigned flights' : 'All flights'} — <span style={{ color: '#818cf8' }}>{display.length}</span> shown
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={load}
            style={{
              width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
          {canCreate && (
            <button
              onClick={openCreate}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 38,
                borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)', border: 'none',
              }}
            >
              <Plus size={15} /> New Flight
            </button>
          )}
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 12px', borderRadius: 10, height: 38,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Search size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <input
            placeholder="Search flight number, route…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }}
          />
          {search && <button onClick={() => setSearch('')} style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={12} /></button>}
        </div>
        <select
          value={statusF}
          onChange={e => setStatusF(e.target.value)}
          style={{
            padding: '0 12px', height: 38, borderRadius: 10, fontSize: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer', minWidth: 130,
          }}
        >
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.065)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
                {['Flight', 'Route', 'Departure', 'Arrival', 'Status', 'Seats (E/B/F)', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '11px 20px', textAlign: 'left',
                    color: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.09em', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Loading flights…</span>
                </td></tr>
              ) : display.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                  <Plane size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
                  {flights.length === 0 ? 'No flights yet' : 'No flights match filters'}
                </td></tr>
              ) : display.map((flight, idx) => {
                const sp = STATUS_PILL[flight.status] ?? STATUS_PILL.scheduled
                return (
                  <tr
                    key={flight.id}
                    style={{ borderBottom: idx < display.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.1s' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: '#818cf8', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{flight.flight_number}</span>
                      {flight.gate && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 2 }}>Gate {flight.gate}{flight.terminal ? ` · T${flight.terminal}` : ''}</div>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                        {flight.departure_code}
                        <Plane size={11} style={{ color: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' }} />
                        {flight.arrival_code}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 2 }}>{flight.aircraft_type}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{formatDate(flight.departure_time)}</span>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{formatTime(flight.departure_time)}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{formatDate(flight.arrival_time)}</span>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{formatTime(flight.arrival_time)}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20,
                        background: sp.bg, color: sp.color, fontSize: 11, fontWeight: 600,
                      }}>
                        {STATUS_LABELS[flight.status] ?? flight.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      <div><span style={{ color: '#818cf8' }}>E</span> {flight.seats_economy - flight.seats_economy_booked}/{flight.seats_economy}</div>
                      <div><span style={{ color: '#fbbf24' }}>B</span> {flight.seats_business - flight.seats_business_booked}/{flight.seats_business}</div>
                      <div><span style={{ color: '#f472b6' }}>F</span> {flight.seats_first - flight.seats_first_booked}/{flight.seats_first}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {canEdit(flight) && (
                          <button
                            onClick={() => openEdit(flight)}
                            style={{
                              width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8',
                            }}
                          ><Edit2 size={13} /></button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => setDeleteId(flight.id)}
                            style={{
                              width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171',
                            }}
                          ><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              style={{ background: '#0f1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={18} style={{ color: '#f87171' }} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Delete Flight</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 3 }}>This action cannot be undone.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13 }}
                >Cancel</button>
                <button
                  onClick={() => deleteFlight(deleteId)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
            onClick={() => !saving && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
              style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, width: '100%', maxWidth: 640, marginBottom: 24 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plane size={15} style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{editing ? 'Edit Flight' : 'New Flight'}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 1 }}>
                      {editing ? `Editing ${editing.flight_number}` : 'Fields marked * are required'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => !saving && setShowModal(false)}
                  disabled={saving}
                  style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Flight Number" required>
                    <Inp value={form.flight_number} onChange={e => setForm((f: any) => ({ ...f, flight_number: e.target.value }))} placeholder="e.g. 6E-201" disabled={saving} />
                  </Field>
                  <Field label="Status">
                    <Sel value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))} disabled={saving}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </Sel>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Departure Airport" required>
                    <Sel value={form.departure_code} onChange={e => {
                      const code = e.target.value
                      setForm((f: any) => ({ ...f, departure_code: code, departure_city: (AIRPORTS as any)[code]?.city || code }))
                    }} disabled={saving}>
                      <option value="">Select airport…</option>
                      {airportOpts.map(([code, info]) => <option key={code} value={code}>{code} — {info.city}</option>)}
                    </Sel>
                  </Field>
                  <Field label="Arrival Airport" required>
                    <Sel value={form.arrival_code} onChange={e => {
                      const code = e.target.value
                      setForm((f: any) => ({ ...f, arrival_code: code, arrival_city: (AIRPORTS as any)[code]?.city || code }))
                    }} disabled={saving}>
                      <option value="">Select airport…</option>
                      {airportOpts.map(([code, info]) => <option key={code} value={code}>{code} — {info.city}</option>)}
                    </Sel>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Departure Time" required>
                    <Inp type="datetime-local" value={form.departure_time} onChange={e => setForm((f: any) => ({ ...f, departure_time: e.target.value }))} disabled={saving} />
                  </Field>
                  <Field label="Arrival Time" required>
                    <Inp type="datetime-local" value={form.arrival_time} onChange={e => setForm((f: any) => ({ ...f, arrival_time: e.target.value }))} disabled={saving} />
                  </Field>
                </div>

                {/* Duration preview */}
                {form.departure_time && form.arrival_time && new Date(form.arrival_time) > new Date(form.departure_time) && (
                  <div style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 12,
                    background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8',
                  }}>
                    ✈ Duration: {Math.floor(calcDur(form.departure_time, form.arrival_time) / 60)}h {calcDur(form.departure_time, form.arrival_time) % 60}m
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <Field label="Aircraft Type" required>
                    <Inp value={form.aircraft_type} onChange={e => setForm((f: any) => ({ ...f, aircraft_type: e.target.value }))} placeholder="e.g. Airbus A320" disabled={saving} />
                  </Field>
                  <Field label="Gate">
                    <Inp value={form.gate} onChange={e => setForm((f: any) => ({ ...f, gate: e.target.value }))} placeholder="e.g. A7" disabled={saving} />
                  </Field>
                  <Field label="Terminal">
                    <Inp value={form.terminal} onChange={e => setForm((f: any) => ({ ...f, terminal: e.target.value }))} placeholder="e.g. T2" disabled={saving} />
                  </Field>
                </div>

                <div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Prices (₹)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <Field label="Economy"><Inp type="number" min={0} value={form.price_economy}  onChange={e => setForm((f: any) => ({ ...f, price_economy:  +e.target.value }))} disabled={saving} /></Field>
                    <Field label="Business"><Inp type="number" min={0} value={form.price_business} onChange={e => setForm((f: any) => ({ ...f, price_business: +e.target.value }))} disabled={saving} /></Field>
                    <Field label="First">   <Inp type="number" min={0} value={form.price_first}    onChange={e => setForm((f: any) => ({ ...f, price_first:    +e.target.value }))} disabled={saving} /></Field>
                  </div>
                </div>

                <div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Total Seats</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <Field label="Economy"><Inp type="number" min={0} value={form.seats_economy}  onChange={e => setForm((f: any) => ({ ...f, seats_economy:  +e.target.value }))} disabled={saving} /></Field>
                    <Field label="Business"><Inp type="number" min={0} value={form.seats_business} onChange={e => setForm((f: any) => ({ ...f, seats_business: +e.target.value }))} disabled={saving} /></Field>
                    <Field label="First">   <Inp type="number" min={0} value={form.seats_first}    onChange={e => setForm((f: any) => ({ ...f, seats_first:    +e.target.value }))} disabled={saving} /></Field>
                  </div>
                </div>

                <Field label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="Optional internal notes…"
                    disabled={saving}
                    style={{ ...inputStyle, resize: 'none', opacity: saving ? 0.5 : 1 }}
                  />
                </Field>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0 24px 24px' }}>
                <button
                  onClick={() => !saving && setShowModal(false)}
                  disabled={saving}
                  style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13, opacity: saving ? 0.5 : 1 }}
                >Cancel</button>
                <button
                  onClick={save}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
                    background: saving ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #818cf8)',
                    border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                  }}
                >
                  {saving
                    ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                    : <Save size={14} />
                  }
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Flight'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        select option { background: #0d1120; color: #fff; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  )
}