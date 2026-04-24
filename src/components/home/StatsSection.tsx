'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import CardSwap, { Card } from '@/components/ui/CardSwap'

/* ─────────────────────────────────────────────────────────────────────────────
   Counter
───────────────────────────────────────────────────────────────────────────── */

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let val = 0
    const step = target / 60
    const timer = setInterval(() => {
      val += step
      if (val >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(val))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─────────────────────────────────────────────────────────────────────────────
   StatsSection
───────────────────────────────────────────────────────────────────────────── */

export function StatsSection() {
  const stats = [
    { value: 120,     suffix: '+', label: 'Global Destinations', desc: 'Across 6 continents'          },
    { value: 2000000, suffix: '+', label: 'Happy Passengers',    desc: 'And counting every day'       },
    { value: 98,      suffix: '%', label: 'On-Time Departures',  desc: 'Industry-leading reliability' },
    { value: 47,      suffix: '',  label: 'Aircraft Fleet',      desc: 'Modern & fuel-efficient'      },
  ]

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="indigo-card p-6 text-center"
            >
              <div
                className="font-display font-bold text-4xl md:text-5xl mb-1"
                style={{
                  background: 'linear-gradient(135deg, var(--indigo-accent), var(--gold))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                {stat.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {stat.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Destination data
───────────────────────────────────────────────────────────────────────────── */

const DESTINATIONS = [
  {
    city: 'Dubai',     code: 'DXB', country: 'UAE',       price: '₹18,500', tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    hero: {
      eyebrow: 'Top Pick from Delhi',
      title: 'Golden City,',
      em: 'Dubai',
      subtitle: "Towers that pierce the clouds, souks that shimmer with gold. The desert's most dazzling metropolis awaits.",
      tag: '✦ Most booked this season',
      tagBg: 'rgba(255,159,10,0.15)',
      tagColor: '#f59e0b',
    },
  },
  {
    city: 'Singapore', code: 'SIN', country: 'Singapore', price: '₹24,200', tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
    hero: {
      eyebrow: 'Trending Now',
      title: 'The Lion City,',
      em: 'Singapore',
      subtitle: 'A futuristic garden state where hawker lanes meet rooftop infinity pools — the perfect east-meets-west escape.',
      tag: '↑ Searches up 42% this week',
      tagBg: 'rgba(99,102,241,0.15)',
      tagColor: 'var(--indigo-accent)',
    },
  },
  {
    city: 'London',    code: 'LHR', country: 'UK',        price: '₹52,000', tag: '',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    hero: {
      eyebrow: 'Classic Europe',
      title: 'The Eternal,',
      em: 'London',
      subtitle: 'Royal parks, world-class museums and a skyline that has inspired centuries of poetry. Timeless.',
      tag: '✦ Best in autumn & winter',
      tagBg: 'rgba(148,163,184,0.12)',
      tagColor: '#94a3b8',
    },
  },
  {
    city: 'Bangkok',   code: 'BKK', country: 'Thailand',  price: '₹16,800', tag: 'Sale',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
    hero: {
      eyebrow: 'Limited Time Sale',
      title: 'City of Angels,',
      em: 'Bangkok',
      subtitle: 'Street food that blows your mind, temples bathed in gold, nightlife that never sleeps — all at a steal.',
      tag: '⚡ Sale ends soon',
      tagBg: 'rgba(239,68,68,0.15)',
      tagColor: '#ef4444',
    },
  },
  {
    city: 'Tokyo',     code: 'NRT', country: 'Japan',     price: '₹38,900', tag: '',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    hero: {
      eyebrow: 'Discover Asia',
      title: 'Land of the Rising',
      em: 'Sun — Tokyo',
      subtitle: 'Cherry blossoms, ramen alleys, neon-lit Shibuya crossings and centuries of samurai heritage.',
      tag: '✦ Best for spring travel',
      tagBg: 'rgba(251,113,133,0.15)',
      tagColor: '#fb7185',
    },
  },
  {
    city: 'Paris',     code: 'CDG', country: 'France',    price: '₹48,500', tag: '',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
    hero: {
      eyebrow: 'Romance Awaits',
      title: 'City of Light,',
      em: 'Paris',
      subtitle: "Croissants at dawn, the Eiffel Tower at dusk, and art around every cobblestone corner. C'est magnifique.",
      tag: '✦ Perfect for couples',
      tagBg: 'rgba(167,139,250,0.15)',
      tagColor: '#a78bfa',
    },
  },
] as const

type Destination = typeof DESTINATIONS[number]

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

function tagColor(tag: string) {
  if (tag === 'Sale')     return '#ef4444'
  if (tag === 'Trending') return 'var(--indigo-primary)'
  if (tag === 'Popular')  return 'var(--gold)'
  return 'var(--gold)'
}

/* ─────────────────────────────────────────────────────────────────────────────
   Hero text block — animated per destination
───────────────────────────────────────────────────────────────────────────── */

function DestinationHero({ dest }: { dest: Destination }) {
  const h = dest.hero
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dest.code}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
        style={{ minHeight: 158 }}
      >
        <p
          className="text-xs tracking-widest uppercase font-semibold mb-3"
          style={{ color: 'var(--indigo-accent)' }}
        >
          {h.eyebrow}
        </p>
        <h2
          className="font-display font-bold text-4xl md:text-5xl leading-tight mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {h.title}{' '}
          <span className="italic font-light" style={{ color: 'var(--text-muted)' }}>
            {h.em}
          </span>
        </h2>
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: 'var(--text-muted)', maxWidth: 360 }}
        >
          {h.subtitle}
        </p>
        <span
          className="inline-block text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: h.tagBg, color: h.tagColor }}
        >
          {h.tag}
        </span>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   DestinationsSection  ← THE FIXED ONE
───────────────────────────────────────────────────────────────────────────── */

// Card dimensions — change these in ONE place and the container auto-sizes.
const CARD_W            = 500   // px  — card width
const CARD_H            = 600   // px  — card height
const CARD_DISTANCE     = 15    // px  — rightward shift per slot
const VERTICAL_DISTANCE = 12    // px  — upward shift per slot
const N_CARDS           = DESTINATIONS.length  // 6

// The fan spreads right & up. Add generous padding so nothing clips.
// Total rightward spread  = (N-1) * CARD_DISTANCE  = 5 * 28 = 140px
// Total upward spread     = (N-1) * VERTICAL_DIST  = 5 * 14 = 70px
const CONTAINER_W = CARD_W + (N_CARDS - 1) * CARD_DISTANCE + 60   // 500
const CONTAINER_H = CARD_H + (N_CARDS - 1) * VERTICAL_DISTANCE + 80 // 530

export function DestinationsSection() {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)

  const handleFrontChange = useCallback((idx: number) => {
    setActiveIdx(idx)
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

          {/* ── Left: animated hero + destination list ── */}
          <div className="flex-1 min-w-0 w-full">
            <DestinationHero dest={DESTINATIONS[activeIdx]} />

            <div className="space-y-2">
              {DESTINATIONS.map((dest, i) => (
                <motion.div
                  key={dest.code}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/flights?destination=${dest.code}`)}
                    onKeyDown={e => e.key === 'Enter' && router.push(`/flights?destination=${dest.code}`)}
                    className="flex items-center justify-between p-4 rounded-2xl cursor-pointer group transition-all duration-200"
                    style={{
                      border: `1px solid ${activeIdx === i ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                      background: activeIdx === i ? 'rgba(99,102,241,0.07)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (activeIdx !== i)
                        (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.04)'
                    }}
                    onMouseLeave={e => {
                      if (activeIdx !== i)
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="font-mono text-xs font-bold w-12 text-center px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-accent)' }}
                      >
                        {dest.code}
                      </span>
                      <div>
                        <div
                          className="font-display font-semibold text-base leading-tight"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {dest.city}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {dest.country}
                        </div>
                      </div>
                      {dest.tag ? (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: tagColor(dest.tag) }}
                        >
                          {dest.tag}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>From</div>
                        <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {dest.price}
                        </div>
                      </div>
                      <span
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                        style={{ color: 'var(--indigo-accent)' }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Right: card stack ───────────────────────────────────────────
              KEY FIXES vs the broken version:
              1. Explicit pixel width + height (not h-[520px] with flex-center).
              2. Width accounts for the rightward fan spread.
              3. Height accounts for the upward fan spread.
              4. overflow-visible so fanned cards outside the box still show.
              5. CardSwap sits at bottom-left; fan grows right+up into free space.
          ──────────────────────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 hidden lg:block"
            style={{
              width:    CONTAINER_W,
              height:   CONTAINER_H,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardSwap
              width={CARD_W}
              height={CARD_H}
              cardDistance={CARD_DISTANCE}
              verticalDistance={VERTICAL_DISTANCE}
              delay={3200}
              pauseOnHover
              skewAmount={3}
              easing="elastic"
              onCardClick={handleFrontChange}
            >
              {DESTINATIONS.map(dest => (
                <Card
                  key={dest.code}
                  onClick={() => router.push(`/flights?destination=${dest.code}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Photo */}
                  <img
                    src={dest.image}
                    alt={dest.city}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.18) 52%, transparent 100%)',
                  }} />

                  {/* Tag badge */}
                  {dest.tag ? (
                    <div style={{
                      position: 'absolute', top: 14, left: 14,
                      background: tagColor(dest.tag),
                      color: '#fff',
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: 100,
                      zIndex: 10,
                    }}>
                      {dest.tag}
                    </div>
                  ) : null}

                  {/* IATA code — frosted glass chip */}
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: 'rgba(0,0,0,0.38)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '4px 10px',
                    borderRadius: 100,
                    zIndex: 10,
                  }}>
                    {dest.code}
                  </div>

                  {/* City + price at bottom */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '0 20px 20px',
                    zIndex: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: '#fff', fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: 0, lineHeight: 1 }}>
                          {dest.city}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 13, margin: '4px 0 0' }}>
                          {dest.country}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, margin: '0 0 2px' }}>From</p>
                        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                          {dest.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FleetPreview
───────────────────────────────────────────────────────────────────────────── */

export function FleetPreview() {
  const aircraft = [
    { name: 'Boeing 787-9',    tag: 'Dreamliner', desc: 'Long-haul luxury with panoramic windows',      seats: 296, range: '14,140 km' },
    { name: 'Airbus A350-900', tag: 'Ultra Wide', desc: 'Next-gen comfort for ultra-long-haul flights', seats: 315, range: '15,000 km' },
    { name: 'Airbus A320neo',  tag: 'Short-Haul', desc: 'Fuel-efficient workhorse for regional routes', seats: 180, range: '6,300 km'  },
  ]

  return (
    <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
        >
          <div>
            <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>
              Our Aircraft
            </p>
            <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Modern <span className="italic font-light">Fleet</span>
            </h2>
          </div>
          <a href="/fleet" className="indigo-btn indigo-btn-ghost">View Full Fleet →</a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aircraft.map((ac, i) => (
            <motion.div
              key={ac.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="indigo-card p-6 group"
            >
              <div className="text-6xl mb-4 group-hover:animate-float">✈️</div>
              <div
                className="text-xs px-2 py-1 rounded-full w-fit mb-3"
                style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-accent)' }}
              >
                {ac.tag}
              </div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                {ac.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{ac.desc}</p>
              <div className="flex gap-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Seats</div>
                  <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ac.seats}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Range</div>
                  <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ac.range}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ServicesSection
───────────────────────────────────────────────────────────────────────────── */

export function ServicesSection() {
  const services = [
    { icon: '🍽️', title: 'Gourmet Dining',  desc: 'Chef-crafted meals with regional specialties and dietary options for every passenger.'   },
    { icon: '🎬', title: 'Entertainment',    desc: 'Thousands of movies, shows, music, and games on our award-winning IFE system.'           },
    { icon: '🛋️', title: 'Premium Lounges', desc: 'Exclusive access to IndiGo Blue Lounges at 40+ airports worldwide.'                     },
    { icon: '💼', title: 'Generous Baggage', desc: '30 kg checked baggage allowance on all flights, with extra for Premium travelers.'       },
    { icon: '📶', title: 'In-flight WiFi',   desc: 'Stay connected at 35,000 feet with high-speed Ku-band satellite internet.'              },
    { icon: '🌍', title: 'Loyalty Program',  desc: 'Earn IndiGo Miles on every flight and redeem for free flights, upgrades, and more.'     },
  ]

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>
            Why IndiGo
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
            World-Class <span className="italic font-light">Services</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="indigo-card p-6 group"
            >
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TestimonialsSection
───────────────────────────────────────────────────────────────────────────── */

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Priya Sharma', role: 'Business Traveler', avatar: 'PS', rating: 5,
      text: 'IndiGo Airlines has completely changed how I view business travel. The business class is simply unmatched — comfortable, elegant, and the staff are incredibly attentive.',
    },
    {
      name: 'James Chen', role: 'Frequent Flyer', avatar: 'JC', rating: 5,
      text: "I've flown 200+ flights in my life and IndiGo consistently delivers the best experience. The food quality alone is worth choosing them over competitors.",
    },
    {
      name: 'Ananya Patel', role: 'Leisure Traveler', avatar: 'AP', rating: 5,
      text: 'Booked my honeymoon flights with IndiGo. The whole experience — from check-in to landing — was absolutely perfect. Will definitely fly again!',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>
            Reviews
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
            What Passengers <span className="italic font-light">Say</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="indigo-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}