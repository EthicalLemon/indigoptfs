'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'
import LineWaves from '@/components/ui/LineWaves'

export function HeroSection() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 500], [0, 120])
  const contentY = useTransform(scrollY, [0, 500], [0, -60])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-28 pb-20">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      {/* LINE WAVES */}
      <LineWaves
        speed={0.3}
        innerLineCount={32}
        outerLineCount={36}
        warpIntensity={0.9}
        rotation={-45}
        edgeFadeWidth={0.0}
        colorCycleSpeed={0.5}
        brightness={0.5}
        color1="#0B1F5B"
        color2="#142E8C"
        color3="#1E3AA8"
        enableMouseInteraction={true}
        mouseInfluence={2.0}
      />

      {/* ✅ LOGO (FIXED + ENHANCED) */}
      <div className="absolute top-6 left-6 z-20">
        <div className="relative">
          {/* Glow layer */}
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full" />

          <Image
            src="/planes/logo.jpg"
            alt="IndiGo"
            width={160}
            height={50}
            priority
            className="
              relative object-contain
              brightness-200 contrast-200
              drop-shadow-[0_0_10px_rgba(255, 255, 255, 0.9]
            "
          />
        </div>
      </div>

      {/* CONTENT */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center"
      >
        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-sm text-white">
            <Star size={14} fill="currentColor" />
            Awarded Best Airline Experience 2024
          </div>
        </motion.div>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] text-white drop-shadow-lg"
        >
          India <span className="text-indigo-300">by</span>
          <br />
          <span className="font-family: 'Montserrat', sans-serif;">
            Indigo
          </span>
        </motion.h1>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-gray-300 max-w-2xl drop-shadow"
        >
          Experience world-class aviation with IndiGo Airlines.
          120+ destinations, seamless journeys, premium comfort.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/flights"
            className="px-8 py-3 rounded-full bg-white text-gray-900 font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition shadow-lg"
          >
            Search Flights
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/routes-network"
            className="px-8 py-3 rounded-full border border-white/30 backdrop-blur-sm text-white hover:bg-white/10 transition font-medium"
          >
            Explore Routes
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}