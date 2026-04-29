'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Calendar, Users, Search, Plane } from 'lucide-react'
import { AIRPORTS } from '@/lib/utils'

export default function FlightSearchWidget() {
  const router = useRouter()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [seatClass, setSeatClass] = useState('economy')

  const [originSuggestions, setOriginSuggestions] = useState<string[]>([])
  const [destSuggestions, setDestSuggestions] = useState<string[]>([])
  const [showOriginSug, setShowOriginSug] = useState(false)
  const [showDestSug, setShowDestSug] = useState(false)

  const airportList = Object.values(AIRPORTS)

  const filterAirports = (query: string) => {
    if (!query) return []
    const q = query.toUpperCase()

    return airportList
      .filter(a =>
        a.code.includes(q) ||
        a.city.toUpperCase().includes(q) ||
        a.name.toUpperCase().includes(q)
      )
      .slice(0, 6)
      .map(a => `${a.city} (${a.code})`)
  }

  const handleOriginChange = (val: string) => {
    setOrigin(val)
    const suggestions = filterAirports(val)
    setOriginSuggestions(suggestions)
    setShowOriginSug(suggestions.length > 0)
  }

  const handleDestChange = (val: string) => {
    setDestination(val)
    const suggestions = filterAirports(val)
    setDestSuggestions(suggestions)
    setShowDestSug(suggestions.length > 0)
  }

  const swapCities = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const extractCode = (str: string) => {
    const match = str.match(/\(([A-Z]{3})\)/)
    return match ? match[1] : str.toUpperCase()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!origin || !destination || !departDate) return

    const params = new URLSearchParams({
      from: extractCode(origin),          // ✅ FIXED
      to: extractCode(destination),       // ✅ FIXED
      date: departDate,
      passengers: passengers.toString(),
      class: seatClass,
    })

    router.push(`/flights?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="glass border border-sky-500/20 rounded-3xl p-6 md:p-8 shadow-2xl">

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">

          {/* FROM */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs text-sky-300/50 mb-2">From</label>
            <div className="relative">
              <Plane size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 rotate-45" />
              <input
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => setShowOriginSug(originSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowOriginSug(false), 150)}
                placeholder="City or Airport"
                className="input-airline pl-9"
                required
              />

              <AnimatePresence>
                {showOriginSug && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 right-0 mt-1 glass-dark border border-sky-500/20 rounded-xl overflow-hidden z-50"
                  >
                    {originSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onMouseDown={() => {
                          setOrigin(sug)
                          setShowOriginSug(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-sky-800/40"
                      >
                        {sug}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SWAP */}
          <div className="md:col-span-1 flex items-end justify-center">
            <button type="button" onClick={swapCities} className="swap-btn">
              <ArrowLeftRight size={14} />
            </button>
          </div>

          {/* TO */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs text-sky-300/50 mb-2">To</label>
            <div className="relative">
              <Plane size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                value={destination}
                onChange={(e) => handleDestChange(e.target.value)}
                onFocus={() => setShowDestSug(destSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowDestSug(false), 150)}
                placeholder="City or Airport"
                className="input-airline pl-9"
                required
              />

              <AnimatePresence>
                {showDestSug && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 right-0 mt-1 glass-dark border border-sky-500/20 rounded-xl overflow-hidden z-50"
                  >
                    {destSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onMouseDown={() => {
                          setDestination(sug)
                          setShowDestSug(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-sky-800/40"
                      >
                        {sug}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* DATE */}
          <div className="md:col-span-3">
            <label className="block text-xs text-sky-300/50 mb-2">Depart</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type="date"
                value={departDate}
                min={today}
                onChange={(e) => setDepartDate(e.target.value)}
                className="input-airline pl-9"
                required
              />
            </div>
          </div>

          {/* PASSENGERS + CLASS */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div className="relative">
              <Users size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type="number"
                value={passengers}
                min={1}
                max={9}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="input-airline pl-7"
              />
            </div>

            <select
              value={seatClass}
              onChange={(e) => setSeatClass(e.target.value)}
              className="input-airline"
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>

        </div>

        {/* SEARCH BUTTON */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="btn-gold w-full flex items-center justify-center gap-2"
        >
          <Search size={18} />
          Search Flights
        </motion.button>
      </form>
    </div>
  )
}