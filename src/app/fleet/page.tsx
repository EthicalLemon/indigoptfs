'use client'
import { motion } from 'framer-motion'
import { Users, Gauge, Globe, Zap } from 'lucide-react'

const FLEET = [
  {
    id: 1,
    name: 'Boeing 787-9 Dreamliner',
    type: 'Wide-body',
    count: 12,
    seats: { economy: 204, business: 42, first: 8 },
    range: 14140,
    speed: 903,
    engines: 'GEnx-1B',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    features: ['Electronic dimming windows', 'Higher cabin pressure', 'LED lighting', '18" IFE screens'],
    desc: 'The crown jewel of our long-haul fleet. The 787-9 redefines passenger comfort with its revolutionary composite structure.',
  },
  {
    id: 2,
    name: 'Airbus A350-900',
    type: 'Wide-body',
    count: 8,
    seats: { economy: 236, business: 48, first: 6 },
    range: 15000,
    speed: 910,
    engines: 'Rolls-Royce Trent XWB',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    features: ['Carbon fiber fuselage', 'HEPA air filtration', 'Quieter cabin', 'Extra-wide seats'],
    desc: 'Airbus\'s flagship aircraft featuring next-gen aerodynamics and the quietest cabin in its class.',
  },
  {
    id: 3,
    name: 'Airbus A320neo',
    type: 'Narrow-body',
    count: 15,
    seats: { economy: 165, business: 12, first: 0 },
    range: 6300,
    speed: 833,
    engines: 'CFM LEAP / PW1100G',
    image: 'https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?w=800&q=80',
    features: ['20% fuel savings', 'Sharklet wingtips', 'New Engine Option', 'Comfortable seats'],
    desc: 'Our regional workhorse connecting cities across the subcontinent with efficiency and comfort.',
  },
  {
    id: 4,
    name: 'Boeing 737 MAX 8',
    type: 'Narrow-body',
    count: 10,
    seats: { economy: 162, business: 16, first: 0 },
    range: 6570,
    speed: 842,
    engines: 'CFM LEAP-1B',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80',
    features: ['LEAP engines', 'Advanced winglets', 'Sky Interior', '14% fuel efficiency'],
    desc: 'The next generation of the world\'s most popular single-aisle aircraft, reengineered for the future.',
  },
  {
    id: 5,
    name: 'Airbus A380-800',
    type: 'Double-deck',
    count: 2,
    seats: { economy: 399, business: 98, first: 14 },
    range: 15200,
    speed: 903,
    engines: 'Rolls-Royce Trent 900',
    image: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800&q=80',
    features: ['Double-deck', 'Bar & lounge', 'Private suites', 'Shower spas (First)'],
    desc: 'The ultimate flying experience. Our A380s operate on flagship routes with unmatched luxury.',
  },
]

export default function FleetPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Our Aircraft</p>
          <h1 className="font-display font-bold text-5xl md:text-6xl mb-4" style={{ color: 'var(--text-primary)' }}>
            The IndiGo <span className="italic font-light">Fleet</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            47 aircraft. 5 types. One mission — delivering you in comfort and style.
          </p>
        </motion.div>

        {/* Fleet stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: '✈️', value: '47', label: 'Total Aircraft' },
            { icon: '🌍', value: '120+', label: 'Destinations' },
            { icon: '👥', value: '511', label: 'Avg. Capacity' },
            { icon: '⚡', value: '99.1%', label: 'Dispatch Rate' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="indigo-card p-5 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--indigo-accent)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Aircraft cards */}
        <div className="space-y-8">
          {FLEET.map((aircraft, i) => (
            <motion.div
              key={aircraft.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="indigo-card overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image */}
                <div className="relative h-64 lg:h-80 overflow-hidden">
                  <img
                    src={aircraft.image}
                    alt={aircraft.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: 'rgba(99,102,241,0.9)' }}>
                      {aircraft.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: 'rgba(0,0,0,0.6)' }}>
                      ×{aircraft.count} in fleet
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 lg:p-8">
                  <h2 className="font-display font-bold text-2xl md:text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                    {aircraft.name}
                  </h2>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{aircraft.desc}</p>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: Globe, label: 'Range', value: `${aircraft.range.toLocaleString()} km` },
                      { icon: Gauge, label: 'Speed', value: `${aircraft.speed} km/h` },
                      { icon: Zap, label: 'Engines', value: aircraft.engines },
                      { icon: Users, label: 'Total Seats', value: Object.values(aircraft.seats).reduce((a, b) => a + b, 0) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                          <Icon size={14} style={{ color: 'var(--indigo-accent)' }} />
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cabin breakdown */}
                  <div className="mb-6">
                    <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Cabin Configuration</p>
                    <div className="flex gap-3">
                      {aircraft.seats.economy > 0 && (
                        <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'var(--bg-tertiary)' }}>
                          <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{aircraft.seats.economy}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Economy</div>
                        </div>
                      )}
                      {aircraft.seats.business > 0 && (
                        <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                          <div className="font-bold text-lg" style={{ color: 'var(--indigo-accent)' }}>{aircraft.seats.business}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Business</div>
                        </div>
                      )}
                      {aircraft.seats.first > 0 && (
                        <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(251,191,36,0.1)' }}>
                          <div className="font-bold text-lg" style={{ color: 'var(--gold)' }}>{aircraft.seats.first}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>First</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {aircraft.features.map(f => (
                      <span key={f} className="px-2 py-1 rounded-md text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
