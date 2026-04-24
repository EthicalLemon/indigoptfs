'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import CardSwap, { Card } from "@/components/CardSwap"
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export function StatsSection() {
  const stats = [
    { value: 120, suffix: '+', label: 'Global Destinations', desc: 'Across 6 continents' },
    { value: 2000000, suffix: '+', label: 'Happy Passengers', desc: 'And counting every day' },
    { value: 98, suffix: '%', label: 'On-Time Departures', desc: 'Industry-leading reliability' },
    { value: 47, suffix: '', label: 'Aircraft Fleet', desc: 'Modern & fuel-efficient' },
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
              <div className="font-display font-bold text-4xl md:text-5xl mb-1"
                style={{ background: 'linear-gradient(135deg, var(--indigo-accent), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{stat.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DestinationsSection() {
  const destinations = [
    { city: 'Dubai', code: 'DXB', country: 'UAE', price: '₹18,500', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', tag: 'Popular' },
    { city: 'Singapore', code: 'SIN', country: 'Singapore', price: '₹24,200', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80', tag: 'Trending' },
    { city: 'London', code: 'LHR', country: 'UK', price: '₹52,000', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80', tag: '' },
    { city: 'Bangkok', code: 'BKK', country: 'Thailand', price: '₹16,800', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80', tag: 'Sale' },
    { city: 'Tokyo', code: 'NRT', country: 'Japan', price: '₹38,900', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: '' },
    { city: 'Paris', code: 'CDG', country: 'France', price: '₹48,500', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80', tag: '' },
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
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Explore the World</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
            Popular <span className="italic font-light">Destinations</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
              style={{ height: '280px' }}
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {dest.tag && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: dest.tag === 'Sale' ? '#ef4444' : dest.tag === 'Trending' ? 'var(--indigo-primary)' : 'var(--gold)', color: 'white' }}>
                  {dest.tag}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-white font-display font-bold text-2xl">{dest.city}</div>
                    <div className="text-white/70 text-sm">{dest.country} · {dest.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/60">From</div>
                    <div className="text-white font-bold text-lg">{dest.price}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FleetPreview() {
  const aircraft = [
    { name: 'Boeing 787-9', tag: 'Dreamliner', desc: 'Long-haul luxury with panoramic windows', seats: 296, range: '14,140 km' },
    { name: 'Airbus A350-900', tag: 'Ultra Wide', desc: 'Next-gen comfort for ultra-long-haul flights', seats: 315, range: '15,000 km' },
    { name: 'Airbus A320neo', tag: 'Short-Haul', desc: 'Fuel-efficient workhorse for regional routes', seats: 180, range: '6,300 km' },
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
            <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Our Aircraft</p>
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
              <div className="text-xs px-2 py-1 rounded-full w-fit mb-3"
                style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-accent)' }}>
                {ac.tag}
              </div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>{ac.name}</h3>
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

export function ServicesSection() {
  const services = [
    { icon: '🍽️', title: 'Gourmet Dining', desc: 'Chef-crafted meals with regional specialties and dietary options for every passenger.' },
    { icon: '🎬', title: 'Entertainment', desc: 'Thousands of movies, shows, music, and games on our award-winning IFE system.' },
    { icon: '🛋️', title: 'Premium Lounges', desc: 'Exclusive access to IndiGo Blue Lounges at 40+ airports worldwide.' },
    { icon: '💼', title: 'Generous Baggage', desc: '30kg checked baggage allowance on all flights, with extra for Premium travelers.' },
    { icon: '📶', title: 'In-flight WiFi', desc: 'Stay connected at 35,000 feet with high-speed Ku-band satellite internet.' },
    { icon: '🌍', title: 'Loyalty Program', desc: 'Earn IndiGo Miles on every flight and redeem for free flights, upgrades, and more.' },
  ]

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Why IndiGo</p>
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

export function TestimonialsSection() {
  const testimonials = [
    { name: 'Priya Sharma', role: 'Business Traveler', text: 'IndiGo Airlines has completely changed how I view business travel. The business class is simply unmatched — comfortable, elegant, and the staff are incredibly attentive.', rating: 5, avatar: 'PS' },
    { name: 'James Chen', role: 'Frequent Flyer', text: 'I\'ve flown 200+ flights in my life and IndiGo consistently delivers the best experience. The food quality alone is worth choosing them over competitors.', rating: 5, avatar: 'JC' },
    { name: 'Ananya Patel', role: 'Leisure Traveler', text: 'Booked my honeymoon flights with IndiGo. The whole experience — from check-in to landing — was absolutely perfect. Will definitely fly again!', rating: 5, avatar: 'AP' },
  ]

  return (
    <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Reviews</p>
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
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
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
