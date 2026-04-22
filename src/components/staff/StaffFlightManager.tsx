'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Save, Plane, AlertTriangle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Flight, FlightStatus } from '@/types'
import { formatTime, formatDate, STATUS_COLORS, STATUS_LABELS, AIRPORTS } from '@/lib/utils'
import toast from 'react-hot-toast'

const EMPTY_FLIGHT = {
  flight_number:          '',
  departure_city:         '',
  departure_code:         '',
  arrival_city:           '',
  arrival_code:           '',
  departure_time:         '',
  arrival_time:           '',
  duration_minutes:       0,
  aircraft_type:          '',
  aircraft_id:            '',
  status:                 'scheduled' as FlightStatus,
  price_economy:          5000,
  price_business:         15000,
  price_first:            40000,
  seats_economy:          150,
  seats_business:         24,
  seats_first:            8,
  seats_economy_booked:   0,
  seats_business_booked:  0,
  seats_first_booked:     0,
  gate:                   '',
  terminal:               '',
  notes:                  '',
}

export function StaffFlightManager({ profile }: { profile: Profile }) {
  const [flights, setFlights]           = useState<Flight[]>([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)
  const [formData, setFormData]         = useState(EMPTY_FLIGHT)
  const [saving, setSaving]             = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Stable client — never recreated between renders
  const supabaseRef = useRef(createClient())

  const load = async () => {
    setLoading(true)
    const supabase = supabaseRef.current
    let q = supabase
      .from('flights')
      .select('*, host:profiles!host_id(id, full_name, email, role)')
      .order('departure_time', { ascending: false })

    if (profile.role === 'host') q = q.eq('host_id', profile.id)

    const { data, error } = await q
    if (error) {
      toast.error('Failed to load flights: ' + error.message)
    } else {
      setFlights((data as Flight[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const canEdit   = (f: Flight) => profile.role === 'admin' || profile.role === 'staff' || (profile.role === 'host' && f.host_id === profile.id)
  const canDelete = (_: Flight) => profile.role === 'admin'
  const canCreate = ['admin', 'staff', 'host'].includes(profile.role)

  const openCreate = () => {
    setEditingFlight(null)
    setFormData(EMPTY_FLIGHT)
    setShowModal(true)
  }

  const openEdit = (flight: Flight) => {
    setEditingFlight(flight)
    setFormData({
      flight_number:         flight.flight_number,
      departure_city:        flight.departure_city,
      departure_code:        flight.departure_code,
      arrival_city:          flight.arrival_city,
      arrival_code:          flight.arrival_code,
      departure_time:        flight.departure_time.slice(0, 16),
      arrival_time:          flight.arrival_time.slice(0, 16),
      duration_minutes:      flight.duration_minutes,
      aircraft_type:         flight.aircraft_type,
      aircraft_id:           flight.aircraft_id || '',
      status:                flight.status,
      price_economy:         flight.price_economy,
      price_business:        flight.price_business,
      price_first:           flight.price_first,
      seats_economy:         flight.seats_economy,
      seats_business:        flight.seats_business,
      seats_first:           flight.seats_first,
      seats_economy_booked:  flight.seats_economy_booked,
      seats_business_booked: flight.seats_business_booked,
      seats_first_booked:    flight.seats_first_booked,
      gate:                  flight.gate     || '',
      terminal:              flight.terminal || '',
      notes:                 flight.notes    || '',
    })
    setShowModal(true)
  }

  const handleDepCode = (code: string) => {
    setFormData(f => ({ ...f, departure_code: code, departure_city: AIRPORTS[code]?.city || code }))
  }
  const handleArrCode = (code: string) => {
    setFormData(f => ({ ...f, arrival_code: code, arrival_city: AIRPORTS[code]?.city || code }))
  }

  const calcDuration = (dep: string, arr: string) => {
    if (!dep || !arr) return 0
    const diff = new Date(arr).getTime() - new Date(dep).getTime()
    return Math.max(0, Math.round(diff / 60000))
  }

  const save = async () => {
    if (!formData.flight_number || !formData.departure_code || !formData.arrival_code || !formData.departure_time || !formData.arrival_time || !formData.aircraft_type) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    const supabase = supabaseRef.current

    const depISO = new Date(formData.departure_time).toISOString()
    const arrISO = new Date(formData.arrival_time).toISOString()
    const duration = calcDuration(formData.departure_time, formData.arrival_time)

    // Build clean payload — no undefined fields
    const payload: Record<string, any> = {
      flight_number:         formData.flight_number.toUpperCase().trim(),
      departure_city:        formData.departure_city || AIRPORTS[formData.departure_code]?.city || formData.departure_code,
      departure_code:        formData.departure_code.toUpperCase(),
      arrival_city:          formData.arrival_city   || AIRPORTS[formData.arrival_code]?.city   || formData.arrival_code,
      arrival_code:          formData.arrival_code.toUpperCase(),
      departure_time:        depISO,
      arrival_time:          arrISO,
      duration_minutes:      duration,
      aircraft_type:         formData.aircraft_type,
      aircraft_id:           formData.aircraft_type.replace(/\s+/g, '-').toLowerCase(),
      status:                formData.status,
      price_economy:         Number(formData.price_economy),
      price_business:        Number(formData.price_business),
      price_first:           Number(formData.price_first),
      seats_economy:         Number(formData.seats_economy),
      seats_business:        Number(formData.seats_business),
      seats_first:           Number(formData.seats_first),
      seats_economy_booked:  Number(formData.seats_economy_booked),
      seats_business_booked: Number(formData.seats_business_booked),
      seats_first_booked:    Number(formData.seats_first_booked),
      gate:                  formData.gate     || null,
      terminal:              formData.terminal || null,
      notes:                 formData.notes    || null,
    }

    if (editingFlight) {
      const { error } = await supabase.from('flights').update(payload).eq('id', editingFlight.id)
      if (error) { toast.error('Update failed: ' + error.message); setSaving(false); return }
      toast.success('Flight updated!')
    } else {
      // Set host and creator on new flights
      payload.host_id    = profile.id
      payload.created_by = profile.id

      const { error } = await supabase.from('flights').insert(payload)
      if (error) { toast.error('Create failed: ' + error.message); setSaving(false); return }
      toast.success('Flight created! It will now appear on the flights page.')
    }

    setSaving(false)
    setShowModal(false)
    load()
  }

  const deleteFlight = async (id: string) => {
    const supabase = supabaseRef.current
    const { error } = await supabase.from('flights').delete().eq('id', id)
    if (error) { toast.error('Delete failed: ' + error.message); return }
    toast.success('Flight deleted')
    setDeleteConfirm(null)
    load()
  }

  const airportOptions = Object.entries(AIRPORTS)

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>Flight Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {profile.role === 'host' ? 'Your hosted flights' : 'All IndiGo Airlines flights'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="indigo-btn indigo-btn-ghost" title="Refresh">
            <RefreshCw size={15} />
          </button>
          {canCreate && (
            <button onClick={openCreate} className="indigo-btn indigo-btn-primary">
              <Plus size={16} /> New Flight
            </button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="indigo-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="indigo-table">
            <thead>
              <tr>
                <th>Flight #</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Aircraft</th>
                <th>Status</th>
                <th>Host</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                  </td>
                </tr>
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    No flights yet. {canCreate && 'Click "New Flight" to create one.'}
                  </td>
                </tr>
              ) : flights.map(flight => (
                <tr key={flight.id}>
                  <td>
                    <span className="font-mono font-bold text-sm" style={{ color: 'var(--indigo-accent)' }}>
                      {flight.flight_number}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {flight.departure_code} → {flight.arrival_code}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {flight.departure_city} → {flight.arrival_city}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(flight.departure_time)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(flight.departure_time)}</div>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{flight.aircraft_type}</span>
                  </td>
                  <td>
                    <span className={`status-badge text-xs ${STATUS_COLORS[flight.status]}`}>
                      {STATUS_LABELS[flight.status]}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(flight as any).host?.full_name || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {canEdit(flight) && (
                        <button onClick={() => openEdit(flight)}
                          className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                          style={{ color: 'var(--indigo-accent)' }}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDelete(flight) && (
                        <button onClick={() => setDeleteConfirm(flight.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="indigo-card p-6 max-w-sm w-full text-center"
              onClick={e => e.stopPropagation()}>
              <AlertTriangle size={40} className="mx-auto mb-4 text-red-400" />
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Delete Flight?</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This cannot be undone. All bookings for this flight may be affected.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="indigo-btn indigo-btn-ghost flex-1">Cancel</button>
                <button onClick={() => deleteFlight(deleteConfirm!)}
                  className="indigo-btn flex-1" style={{ background: '#ef4444', color: 'white' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.8)' }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="indigo-card w-full max-w-2xl my-8"
              style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Plane size={16} style={{ color: 'var(--indigo-accent)' }} />
                  </div>
                  <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                    {editingFlight ? 'Edit Flight' : 'Create New Flight'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5">

                {/* Flight number + Aircraft */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                      Flight Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={formData.flight_number}
                      onChange={e => setFormData(f => ({ ...f, flight_number: e.target.value.toUpperCase() }))}
                      placeholder="IGO101"
                      className="indigo-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                      Aircraft <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.aircraft_type}
                      onChange={e => setFormData(f => ({ ...f, aircraft_type: e.target.value }))}
                      className="indigo-input appearance-none"
                    >
                      <option value="">Select aircraft</option>
                      {['Boeing 787-9', 'Airbus A350-900', 'Airbus A320neo', 'Boeing 737 MAX 8', 'Airbus A380-800'].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Route */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                      From <span className="text-red-400">*</span>
                    </label>
                    <select value={formData.departure_code} onChange={e => handleDepCode(e.target.value)} className="indigo-input appearance-none">
                      <option value="">Select airport</option>
                      {airportOptions.map(([code, { city }]) => (
                        <option key={code} value={code}>{city} ({code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                      To <span className="text-red-400">*</span>
                    </label>
                    <select value={formData.arrival_code} onChange={e => handleArrCode(e.target.value)} className="indigo-input appearance-none">
                      <option value="">Select airport</option>
                      {airportOptions.map(([code, { city }]) => (
                        <option key={code} value={code}>{city} ({code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                      Departure Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.departure_time}
                      onChange={e => setFormData(f => ({ ...f, departure_time: e.target.value }))}
                      className="indigo-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                      Arrival Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.arrival_time}
                      onChange={e => setFormData(f => ({ ...f, arrival_time: e.target.value }))}
                      className="indigo-input"
                    />
                  </div>
                </div>

                {/* Duration preview */}
                {formData.departure_time && formData.arrival_time && (
                  <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--indigo-accent)' }}>
                    ⏱ Duration: {Math.floor(calcDuration(formData.departure_time, formData.arrival_time) / 60)}h {calcDuration(formData.departure_time, formData.arrival_time) % 60}m
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as FlightStatus }))} className="indigo-input appearance-none">
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Prices */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Prices (₹)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Economy', key: 'price_economy' },
                      { label: 'Business', key: 'price_business' },
                      { label: 'First Class', key: 'price_first' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        <input
                          type="number"
                          value={(formData as any)[key]}
                          onChange={e => setFormData(f => ({ ...f, [key]: Number(e.target.value) }))}
                          className="indigo-input"
                          min={0}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seats */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Total Seats</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Economy', key: 'seats_economy' },
                      { label: 'Business', key: 'seats_business' },
                      { label: 'First Class', key: 'seats_first' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        <input
                          type="number"
                          value={(formData as any)[key]}
                          onChange={e => setFormData(f => ({ ...f, [key]: Number(e.target.value) }))}
                          className="indigo-input"
                          min={0}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gate / Terminal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Gate</label>
                    <input value={formData.gate} onChange={e => setFormData(f => ({ ...f, gate: e.target.value }))} placeholder="A12" className="indigo-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Terminal</label>
                    <input value={formData.terminal} onChange={e => setFormData(f => ({ ...f, terminal: e.target.value }))} placeholder="T2" className="indigo-input" />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Passenger Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special announcements..."
                    rows={3}
                    className="indigo-input resize-none"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => setShowModal(false)} className="indigo-btn indigo-btn-ghost">Cancel</button>
                <button onClick={save} disabled={saving} className="indigo-btn indigo-btn-primary">
                  {saving
                    ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <><Save size={15} /> {editingFlight ? 'Save Changes' : 'Create Flight'}</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
