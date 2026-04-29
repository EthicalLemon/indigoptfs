'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plane, Calendar, ArrowLeftRight, Search } from 'lucide-react'
import { AIRPORTS } from '@/lib/utils'
import { format } from 'date-fns'

export function SearchSection() {
  const router = useRouter()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const swap = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      from,
      to,
      date,
    })
    router.push(`/flights?${params.toString()}`)
  }

  const airportOptions = Object.entries(AIRPORTS).map(([code, { city }]) => ({
    code,
    city,
  }))

  return (
    <section className="relative -mt-20 z-10 px-4 sm:px-6 mb-24">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-[#0b1220] border border-white/10 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
        >

          {/* FORM */}
          <form onSubmit={search}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

              {/* FROM */}
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  From
                </label>
                <div className="relative">
                  <Plane size={16} className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-45 text-indigo-400" />
                  <select
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select</option>
                    {airportOptions.map(a => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SWAP */}
              <div className="md:col-span-1 flex justify-center items-center">
                <button
                  type="button"
                  onClick={swap}
                  className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg hover:scale-105 transition"
                >
                  <ArrowLeftRight size={16} className="text-white" />
                </button>
              </div>

              {/* TO */}
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  To
                </label>
                <div className="relative">
                  <Plane size={16} className="absolute left-4 top-1/2 -translate-y-1/2 rotate-45 text-indigo-400" />
                  <select
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select</option>
                    {airportOptions.map(a => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DATE */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* SEARCH */}
              <div className="md:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full h-12 rounded-lg bg-indigo-600 flex items-center justify-center gap-2 text-white font-medium hover:bg-indigo-700 transition"
                >
                  <Search size={18} />
                  Search Flights
                </button>
              </div>

            </div>

            <p className="mt-4 text-xs text-gray-500">
              ✈ 120+ destinations worldwide • Best price guarantee
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  )
}