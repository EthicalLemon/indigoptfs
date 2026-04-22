'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'

export function HeroSection() {
  const { scrollY } = useScroll()

  // Parallax
  const bgY = useTransform(scrollY, [0, 500], [0, 120])
  const contentY = useTransform(scrollY, [0, 500], [0, -60])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-28 pb-20">

      {/* BACKGROUND (PARALLAX) */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.12), transparent 60%)',
          }}
        />
      </motion.div>

      {/* ✅ LOGO (NO BORDER / NO GLASS) */}
      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/planes/logo.jpg"
          alt="IndiGo"
          width={110}
          height={35}
          className="object-contain"
          priority
        />
      </div>

      {/* CONTENT (PARALLAX) */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center"
      >

        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-indigo-300">
            <Star size={14} fill="currentColor" />
            Awarded Best Airline Experience 2024
          </div>
        </motion.div>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] text-white"
        >
          Fly <span className="text-indigo-400">Beyond</span>
          <br />
          <span className="text-gray-300 font-light italic">
            the Horizon
          </span>
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-lg text-gray-400 max-w-2xl"
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
            className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
          >
            Search Flights
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/routes-network"
            className="px-8 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition"
          >
            Explore Routes
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}