'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PLANES = [
  {
    name: 'Airbus A320neo',
    image: '/planes/a320 neo.jpg',
    seats: '180',
    range: '6,300 km',
    type: 'Narrow-body',
    notes: 'Backbone of IndiGo fleet'
  },
  {
    name: 'Airbus A321neo',
    image: '/planes/a321neo.jpg',
    seats: '220–232',
    range: '7,400 km',
    type: 'Narrow-body',
    notes: 'High-density + long routes'
  },
  {
    name: 'Airbus A321XLR',
    image: '/planes/a321xlr.jpg',
    seats: '180–220',
    range: '8,700 km',
    type: 'Long-range narrow-body',
    notes: 'Upcoming long-haul expansion'
  },
  {
    name: 'ATR 72-600',
    image: '/planes/atr 72.jpg',
    seats: '78',
    range: '1,500 km',
    type: 'Regional turboprop',
    notes: 'Short regional connectivity'
  },
  {
    name: 'Boeing 777-300ER',
    image: '/planes/b777 leased.jpg',
    seats: '400+',
    range: '13,000 km',
    type: 'Wide-body (Leased)',
    notes: 'Leased for international routes'
  },
]

export function FleetPreview() {
  const [active, setActive] = useState(PLANES[0])

  return (
    <section
      className="py-24 px-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Our Fleet
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            One of the youngest and most fuel-efficient fleets in the world
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT LIST */}
          <div className="space-y-4">
            {PLANES.map((plane) => {
              const isActive = active.name === plane.name

              return (
                <motion.button
                  key={plane.name}
                  onClick={() => setActive(plane)}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-full text-left p-5 rounded-xl transition-all"
                  style={{
                    background: isActive
                      ? 'var(--bg-secondary)'
                      : 'transparent',
                    border: '1px solid var(--border)',
                    boxShadow: isActive
                      ? '0 10px 30px rgba(99,102,241,0.15)'
                      : 'none',
                  }}
                >
                  <div
                    className="text-lg font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plane.name}
                  </div>

                  <div
                    className="text-sm mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {plane.type}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* RIGHT DETAILS */}
          <motion.div
            layout
            className="rounded-xl p-6"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)'
            }}
          >

            {/* IMAGE */}
            <div className="relative overflow-hidden rounded-lg mb-6">
              <AnimatePresence mode="wait">
                <motion.img
                  key={active.image}
                  src={active.image}
                  alt={active.name}
                  className="w-full h-60 object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </AnimatePresence>
            </div>

            <h3
              className="text-2xl font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {active.name}
            </h3>

            <div
              className="space-y-2 text-sm mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              <p><strong>Seats:</strong> {active.seats}</p>
              <p><strong>Range:</strong> {active.range}</p>
              <p><strong>Type:</strong> {active.type}</p>
            </div>

            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {active.notes}
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  )
}