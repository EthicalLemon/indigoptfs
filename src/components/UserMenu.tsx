'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import WalletModal from './WalletModal'

const supabase = createClient()

export default function UserMenu() {
  const { profile } = useAuth()   // data already loaded by AuthProvider
  const [walletOpen, setWalletOpen] = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const menuRef                     = useRef<HTMLDivElement>(null)

  // Close on outside click
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  if (!profile) return null

  const initial = profile.full_name?.[0] ?? profile.email[0].toUpperCase()
  const name    = profile.full_name ?? profile.email

  return (
    <>
      <div ref={menuRef} className="relative">
        {/* Capsule trigger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all duration-200"
          style={{
            background:           'rgba(255,255,255,0.08)',
            border:               '1px solid rgba(255,255,255,0.12)',
            backdropFilter:       'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {initial}
            </div>
          )}
          <span className="text-sm font-medium max-w-[120px] truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {name.split(' ')[0]}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ color: 'rgba(255,255,255,0.5)', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background:           'rgba(15,15,25,0.85)',
              border:               '1px solid rgba(255,255,255,0.10)',
              backdropFilter:       'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {profile.full_name ?? 'Passenger'}
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {profile.email}
              </div>
            </div>

            <div className="p-1.5">
              <MenuButton icon="💰" label="Wallet" onClick={() => { setMenuOpen(false); setWalletOpen(true) }} />
              <MenuButton icon="🎫" label="My Bookings" onClick={() => { setMenuOpen(false); window.location.href = '/manage' }} />
              <div className="my-1 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              <MenuButton icon="👋" label="Sign out" onClick={handleLogout} danger />
            </div>
          </div>
        )}
      </div>

      {walletOpen && (
        <WalletModal userId={profile.id} onClose={() => setWalletOpen(false)} />
      )}
    </>
  )
}

function MenuButton({ icon, label, onClick, danger }: {
  icon: string
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left"
      style={{ color: danger ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.75)' }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.10)' : 'rgba(99,102,241,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  )
}