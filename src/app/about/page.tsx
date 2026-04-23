'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const InfiniteMenu = dynamic(() => import('@/components/ui/InfiniteMenu'), { ssr: false })

export default function AboutPage() {

  /* ── MANAGEMENT BOARD ── */
  const management = [
    {
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600',
      title: 'Managing Director',
      description: 'Leading strategic vision and global direction.'
    },
    {
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
      title: 'Deputy Managing Director',
      description: 'Driving operations and execution excellence.'
    },
    {
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600',
      title: 'Board Member',
      description: 'Governance, compliance, and oversight.'
    },
  ]

  /* ── EXECUTIVE BOARD ── */
  const executives = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
      title: 'CEO',
      description: 'Leading innovation at altitude.'
    },
    {
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=600',
      title: 'Chief Safety Officer',
      description: 'Ensuring safety across all operations.'
    },
    {
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600',
      title: 'CMO',
      description: 'Brand and global marketing strategy.'
    },
    {
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
      title: 'COO',
      description: 'Operational excellence and logistics.'
    },
    {
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600',
      title: 'Chief Compliance Officer',
      description: 'Regulatory compliance and governance.'
    },
    {
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600',
      title: 'CHRO',
      description: 'People, culture, and talent.'
    },
  ]

  const team = [...management, ...executives]

  return (
    <div className="min-h-screen pb-24 bg-[#050505] text-white">

      {/* ── HERO ── */}
      <div className="pt-32 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-semibold tracking-tight mb-4">
            About <span className="italic">IndiGo</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Building the future of aviation with innovation, trust, and excellence.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* ── CHAIRMAN ── */}
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center mb-32"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800"
              className="w-full h-[420px] object-cover"
            />
          </div>

          <div>
            <h2 className="text-3xl font-semibold mb-4">Chairman’s Message</h2>
            <p className="text-white/70 leading-relaxed">
              Our vision is to redefine global aviation through innovation, reliability,
              and world-class service. Every journey we create reflects our commitment
              to excellence and trust.
            </p>
          </div>
        </motion.div>

        {/* ── VICE CHAIRMAN ── */}
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center mb-32"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold mb-4">Vice Chairman’s Message</h2>
            <p className="text-white/70 leading-relaxed">
              Precision, discipline, and innovation guide our operations. We are
              committed to delivering seamless experiences while maintaining the
              highest standards in aviation.
            </p>
          </div>

          <div className="order-1 md:order-2 relative rounded-3xl overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800"
              className="w-full h-[420px] object-cover"
            />
          </div>
        </motion.div>

        {/* ── MANAGEMENT BOARD ── */}
        <div className="mb-32">
          <h2 className="text-4xl font-semibold mb-6">Management Board</h2>
          <div className="h-[520px] rounded-3xl overflow-hidden border border-white/10">
            <InfiniteMenu items={management} />
          </div>
        </div>

        {/* ── EXECUTIVE BOARD ── */}
        <div className="mb-32">
          <h2 className="text-4xl font-semibold mb-6">Executive Board</h2>
          <div className="h-[520px] rounded-3xl overflow-hidden border border-white/10">
            <InfiniteMenu items={executives} />
          </div>
        </div>

        {/* ── FULL TEAM ── */}
        <div className="mb-32">
          <h2 className="text-4xl font-semibold mb-6">Our Team</h2>
          <div className="h-[600px] rounded-3xl overflow-hidden border border-white/10">
            <InfiniteMenu items={team} speed={0.2} />
          </div>
        </div>

      </div>
    </div>
  )
}