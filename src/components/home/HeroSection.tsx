'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Plane } from 'lucide-react'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}))

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(var(--indigo-primary) 1px, transparent 1px), linear-gradient(90deg, var(--indigo-primary) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? 'var(--indigo-accent)' : p.id % 3 === 1 ? 'var(--gold)' : 'white',
            opacity: 0.4,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Large blurred circle */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--indigo-primary) 0%, transparent 70%)' }}
      />

      {/* Animated plane */}
      <motion.div
        className="absolute top-24 opacity-20"
        animate={{ x: ['calc(-10vw)', 'calc(110vw)'], y: [40, -20] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
      >
        <Plane size={40} className="text-indigo-400 -rotate-12" />
      </motion.div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm mb-8"
          style={{ borderColor: 'var(--indigo-primary)', background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-accent)' }}
        >
          <Star size={14} fill="currentColor" />
          <span>Awarded Best Airline Experience 2024</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold leading-[0.95] mb-6"
          style={{ fontSize: 'clamp(52px, 10vw, 120px)', color: 'var(--text-primary)' }}
        >
          Fly{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #818cf8, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Beyond
          </span>
          <br />
          <span className="font-light italic">the Horizon</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
          style={{ color: 'var(--text-secondary)' }}
        >
          Experience world-class aviation with IndiGo Airlines. 120+ destinations, 
          five-star service, and memories that last a lifetime.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/flights" className="indigo-btn indigo-btn-primary text-base px-8 py-4 group">
            Search Flights
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/routes-network" className="indigo-btn indigo-btn-ghost text-base px-8 py-4">
            Explore Routes
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-8 mt-20"
        >
          {[
            { value: '120+', label: 'Destinations' },
            { value: '4.9★', label: 'Avg Rating' },
            { value: '2M+', label: 'Passengers' },
            { value: '99.2%', label: 'On-time Rate' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--indigo-accent)' }}>
                {stat.value}
              </div>
              <div className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Scroll</div>
        <div className="w-px h-8 bg-gradient-to-b from-indigo-500 to-transparent" />
      </motion.div>
    </section>
  )
}
