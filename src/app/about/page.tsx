'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { motion } from 'framer-motion'

const InfiniteMenu = dynamic(() => import('@/components/ui/InfiniteMenu'), { ssr: false })

export default function AboutPage() {
  const management = [
    {
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop',
      title: 'Chairman',
      description: 'Visionary leader driving global expansion.'
    },
    {
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop',
      title: 'Vice Chairman',
      description: 'Strategic excellence and operations.'
    },
    {
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop',
      title: 'Director',
      description: 'Finance & growth.'
    },
    {
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=600&fit=crop',
      title: 'Board Member',
      description: 'Legal & compliance.'
    },
  ]

  const executives = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
      title: 'CEO',
      description: 'Leading innovation at altitude.'
    },
    {
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=600&h=600&fit=crop',
      title: 'CTO',
      description: 'Technology & digital systems.'
    },
    {
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop',
      title: 'COO',
      description: 'Operations excellence.'
    },
    {
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop',
      title: 'CFO',
      description: 'Finance & strategy.'
    },
    {
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop',
      title: 'CMO',
      description: 'Brand & marketing.'
    },
    {
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop',
      title: 'CHRO',
      description: 'People & culture.'
    },
  ]

  const team = [...management, ...executives]

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ── HERO ── */}
      <div className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--indigo-primary) 1px, transparent 1px), linear-gradient(90deg, var(--indigo-primary) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Our Story</p>
          <h1 className="font-display font-bold leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', color: 'var(--text-primary)' }}>
            About <span className="italic font-light" style={{ color: 'var(--indigo-accent)' }}>IndiGo</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Building the future of aviation with innovation, trust, and a relentless passion for excellence.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {[
            { value: '1994', label: 'Founded' },
            { value: '120+', label: 'Destinations' },
            { value: '47', label: 'Aircraft' },
            { value: '2M+', label: 'Passengers/yr' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="indigo-card p-6 text-center">
              <div className="font-display font-bold text-3xl md:text-4xl mb-1"
                style={{ background: 'linear-gradient(135deg, var(--indigo-accent), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── CHAIRMAN ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl opacity-20" style={{ background: 'linear-gradient(135deg, var(--indigo-primary), var(--indigo-accent))' }} />
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop"
              alt="Chairman"
              className="relative rounded-2xl w-full object-cover shadow-2xl"
              style={{ aspectRatio: '1/1' }}
            />
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Leadership</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>Chairman's Message</h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Our vision is to redefine global aviation through innovation, reliability, and world-class service.
              We are committed to building a future where travel becomes seamless and extraordinary.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              At IndiGo Airlines, every decision we make is guided by our core belief — that the journey matters
              as much as the destination. We will continue to invest in our people, technology, and fleet to
              deliver that promise to every passenger, every flight.
            </p>
          </div>
        </motion.div>

        {/* ── VICE CHAIRMAN ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="md:order-2 relative">
            <div className="absolute -inset-3 rounded-3xl opacity-20" style={{ background: 'linear-gradient(135deg, var(--gold), var(--indigo-accent))' }} />
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop"
              alt="Vice Chairman"
              className="relative rounded-2xl w-full object-cover shadow-2xl"
              style={{ aspectRatio: '1/1' }}
            />
          </div>
          <div className="md:order-1">
            <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'var(--indigo-accent)' }}>Leadership</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>Vice Chairman's Message</h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Excellence is at the core of everything we do. Our commitment to operational precision and
              customer satisfaction ensures we stay ahead in the aviation industry.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              We are proud of the culture we have built — one where every team member, from the cockpit to the
              check-in counter, is empowered to deliver exceptional experiences.
            </p>
          </div>
        </motion.div>

        {/* ── MANAGEMENT BOARD — InfiniteMenu ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase font-semibold mb-2" style={{ color: 'var(--indigo-accent)' }}>Governance</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Management <span className="italic font-light">Board</span>
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden border" style={{ height: '520px', borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <InfiniteMenu items={management} scale={1.0} />
          </div>
        </motion.div>

        {/* ── EXECUTIVE BOARD — InfiniteMenu ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase font-semibold mb-2" style={{ color: 'var(--indigo-accent)' }}>Executive</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Executive <span className="italic font-light">Leadership</span>
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden border" style={{ height: '520px', borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <InfiniteMenu items={executives} scale={1.0} />
          </div>
        </motion.div>

        {/* ── FULL TEAM — InfiniteMenu (THE NEW SECTION) ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase font-semibold mb-2" style={{ color: 'var(--indigo-accent)' }}>People</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Our <span className="italic font-light">Team</span>
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Drag the globe to explore every member of the IndiGo family.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border" style={{ height: '600px', borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <InfiniteMenu items={team} scale={1.1} />
          </div>
        </motion.div>

        {/* ── VALUES ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest uppercase font-semibold mb-2" style={{ color: 'var(--indigo-accent)' }}>What Drives Us</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Our <span className="italic font-light">Values</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '✈️', title: 'Safety First', desc: 'Every decision, every flight, every day — safety is our non-negotiable foundation.' },
              { icon: '🌍', title: 'Global Vision', desc: 'Connecting the world with a network spanning 120+ destinations across 6 continents.' },
              { icon: '💡', title: 'Innovation', desc: 'Pioneering next-generation aircraft, digital experiences, and sustainable aviation.' },
              { icon: '🤝', title: 'Integrity', desc: 'Transparent, honest, and accountable — to our passengers, partners, and planet.' },
            ].map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="indigo-card p-6">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}