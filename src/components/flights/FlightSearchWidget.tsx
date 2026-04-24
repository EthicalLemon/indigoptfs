'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Calendar, Users, Search, Plane } from 'lucide-react'
import { AIRPORTS } from '@/lib/utils'
import AnimatedList from '@/components/ui/AnimatedList'

type TripType = 'oneway' | 'roundtrip'

export default function FlightSearchWidget() {
  const router = useRouter()
  const [tripType, setTripType] = useState<TripType>('oneway')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [seatClass, setSeatClass] = useState('economy')
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([])
  const [destSuggestions, setDestSuggestions] = useState<any[]>([])
  const [showOriginSug, setShowOriginSug] = useState(false)
  const [showDestSug, setShowDestSug] = useState(false)

  const airportList = Object.values(AIRPORTS)

  const filterAirports = (query: string) => {
    if (!query || query.length < 1) return []
    const q = query.toUpperCase()
    return airportList
      .filter((a: any) =>
        a.code.includes(q) ||
        a.city.toUpperCase().includes(q) ||
        a.name.toUpperCase().includes(q)
      )
      .slice(0, 6)
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
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  const extractCode = (str: string) => {
    const match = str.match(/\(([A-Z]{3})\)/)
    return match ? match[1] : str.toUpperCase()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination || !departDate) return

    const params = new URLSearchParams({
      origin: extractCode(origin),
      destination: extractCode(destination),
      date: departDate,
      passengers: passengers.toString(),
      class: seatClass,
    })

    if (tripType === 'roundtrip' && returnDate) {
      params.set('return', returnDate)
    }

    router.push(`/flights?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="glass border border-sky-500/20 rounded-3xl p-6 md:p-8 shadow-2xl">
      {/* Trip type toggle */}
      <div className="flex items-center gap-1 mb-6 p-1 glass-dark rounded-xl w-fit">
        {(['oneway', 'roundtrip'] as TripType[]).map((type) => (
          <button
            key={type}
            onClick={() => setTripType(type)}
            className={`px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-200 ${
              tripType === type
                ? 'bg-sky-600 text-white shadow-lg'
                : 'text-sky-300/60 hover:text-sky-200'
            }`}
          >
            {type === 'oneway' ? 'One Way' : 'Round Trip'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          {/* Origin */}
         
<div className="md:col-span-3 relative">
  <label className="block text-xs text-sky-300/50 font-body uppercase tracking-wider mb-2">From</label>

  <div className="relative">
    <Plane size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 rotate-45" />

    <input
      type="text"
      value={origin}
      onChange={(e) => handleOriginChange(e.target.value)}
      onFocus={() => setShowOriginSug(originSuggestions.length > 0)}
      onBlur={() => setTimeout(() => setShowOriginSug(false), 150)}
      placeholder="City or Airport"
      className="input-airline pl-9"
      required
    />

    {showOriginSug && (
      <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-dark border border-sky-500/20 rounded-xl shadow-2xl">
        <AnimatedList
          items={originSuggestions}
          onItemSelect={(item, index) => {
            setOrigin(`${item.city} (${item.code})`)
            setShowOriginSug(false)
          }}
          displayScrollbar={false}
          renderItem={(item: any, index) => (
            <div className="flex items-center justify-between gap-3">
              <span className="block text-sm font-semibold text-sky-100">{item.city}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-sky-300">{item.code}</span>
            </div>
          )}
        />
      </div>
    )}
  </div>
</div>
          {/* Swap button */}
          <div className="md:col-span-1 flex items-end justify-center pb-0.5">
            <button
              type="button"
              onClick={swapCities}
              className="w-10 h-10 glass border border-sky-500/20 rounded-full flex items-center justify-center text-sky-300 hover:text-white hover:border-sky-400/40 transition-all duration-200 group"
            >
              <ArrowLeftRight size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* Destination */}
        {/* Destination */}
<div className="md:col-span-3 relative">
  <label className="block text-xs text-sky-300/50 font-body uppercase tracking-wider mb-2">To</label>

  <div className="relative">
    <Plane size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />

    <input
      type="text"
      value={destination}
      onChange={(e) => handleDestChange(e.target.value)}
      onFocus={() => setShowDestSug(destSuggestions.length > 0)}
      onBlur={() => setTimeout(() => setShowDestSug(false), 150)}
      placeholder="City or Airport"
      className="input-airline pl-9"
      required
    />

    {showDestSug && (
      <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-dark border border-sky-500/20 rounded-xl shadow-2xl">
        <AnimatedList
          items={destSuggestions}
          onItemSelect={(item, index) => {
            setDestination(`${item.city} (${item.code})`)
            setShowDestSug(false)
          }}
          displayScrollbar={false}
          renderItem={(item: any, index) => (
            <div className="flex items-center justify-between gap-3">
              <span className="block text-sm font-semibold text-sky-100">{item.city}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-sky-300">{item.code}</span>
            </div>
          )}
        />
      </div>
    )}
  </div>
</div>

          {/* Depart date */}
          <div className="md:col-span-2">
            <label className="block text-xs text-sky-300/50 font-body uppercase tracking-wider mb-2">Depart</label>
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

          {/* Return date */}
          <AnimatePresence>
            {tripType === 'roundtrip' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="md:col-span-2 overflow-hidden"
              >
                <label className="block text-xs text-sky-300/50 font-body uppercase tracking-wider mb-2">Return</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                  <input
                    type="date"
                    value={returnDate}
                    min={departDate || today}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="input-airline pl-9"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Passengers & Class */}
          <div className={`md:col-span-${tripType === 'roundtrip' ? '1' : '2'} grid grid-cols-2 gap-2`}>
            <div>
              <label className="block text-xs text-sky-300/50 font-body uppercase tracking-wider mb-2">Pax</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                <input
                  type="number"
                  value={passengers}
                  min={1}
                  max={9}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="input-airline pl-8"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-sky-300/50 font-body uppercase tracking-wider mb-2">Class</label>
              <select
                value={seatClass}
                onChange={(e) => setSeatClass(e.target.value)}
                className="input-airline appearance-none"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first_class">First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto px-12 py-4 btn-gold rounded-2xl font-body text-base font-bold flex items-center justify-center gap-2 shadow-glow-gold"
        >
          <Search size={18} />
          Search Flights
        </motion.button>
      </form>
    </div>
  )
}
