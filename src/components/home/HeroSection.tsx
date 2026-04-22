'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-28 pb-20">

      {/* THEME BACKGROUND (FIXED) */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]" />

      {/* SUBTLE GRADIENT (ADAPTS TO THEME) */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 0%, rgba(99,102,241,0.10), transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(99,102,241,0.06), transparent 50%)
          `
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">

        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--indigo-accent)'
            }}
          >
            <Star size={14} fill="currentColor" />
            Awarded Best Airline Experience 2024
          </div>
        </motion.div>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1]"
          style={{ color: 'var(--text-primary)' }}
        >
          Fly <span style={{ color: 'var(--indigo-accent)' }}>Beyond</span>
          <br />
          <span style={{ color: 'var(--text-secondary)' }} className="font-light italic">
            the Horizon
          </span>
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-lg max-w-2xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          Experience world-class aviation with IndiGo Airlines.
          120+ destinations, seamless journeys, premium comfort.
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/flights"
            className="px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition"
            style={{
              background: 'var(--indigo-primary)',
              color: '#fff'
            }}
          >
            Search Flights
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/routes-network"
            className="px-8 py-3 rounded-lg border transition"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              background: 'transparent'
            }}
          >
            Explore Routes
          </Link>
        </motion.div>
      </div>
    </section>
  )
}