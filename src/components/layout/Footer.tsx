'use client'
import Link from 'next/link'
import { Plane, Twitter, Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

const FOOTER_LINKS = {
  'Fly': [
    { label: 'Book a Flight', href: '/flights' },
    { label: 'Flight Status', href: '/status' },
    { label: 'Manage Booking', href: '/manage' },
    { label: 'Check-in Online', href: '/manage' },
  ],
  'Discover': [
    { label: 'Our Fleet', href: '/fleet' },
    { label: 'Route Network', href: '/routes-network' },
    { label: 'Meals & Services', href: '/meals' },
    { label: 'Travel Guides', href: '/routes-network' },
  ],
  'Company': [
    { label: 'About IndiGo', href: '/#about' },
    { label: 'Staff Portal', href: '/staff' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  'Support': [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Baggage Policy', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t mt-20" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center">
                <Plane size={18} className="text-white -rotate-45" />
              </div>
              <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                IndiGo <span className="font-light" style={{ color: 'var(--indigo-accent)' }}>Airlines</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              Connecting the world with excellence. IndiGo Airlines — where every journey becomes an experience worth remembering.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {[
                { icon: Phone, text: '+91 1800 INDIGO AIR' },
                { icon: Mail, text: 'support@indigoairlines.com' },
                { icon: MapPin, text: 'Terminal 2, Indira Gandhi Int\'l, Delhi' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Icon size={14} style={{ color: 'var(--indigo-accent)' }} />
                  {text}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {[Twitter, Instagram, Facebook, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
                {section}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-indigo-400"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} IndiGo Airlines. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Terms', 'Privacy', 'Cookies', 'Accessibility'].map(t => (
              <a key={t} href="#" className="text-xs hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-muted)' }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
