'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import WalletModal from './WalletModal'

// Module-level client — created once, never recreated
let _client: ReturnType<typeof createClient> | null = null
function getClient() {
  if (!_client) _client = createClient()
  return _client
}

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  role: string
  avatar_url: string | null
  discord_id: string | null
}

export default function UserMenu() {
  const [profile, setProfile]       = useState<UserProfile | null>(null)
  const [walletOpen, setWalletOpen] = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const menuRef                     = useRef<HTMLDivElement>(null)
  const loaded                      = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    async function load() {
      const supabase = getClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url, discord_id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (data) setProfile(data)
    }

    load()
  }, [])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await getClient().auth.signOut()
    location.reload()
  }

  if (!profile) return null

  const initial = profile.full_name?.[0] ?? profile.email[0].toUpperCase()
  const name    = profile.full_name ?? profile.email

  return (
    <>
      <div ref={menuRef} className="relative">

        {/* ── Capsule trigger ── */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all duration-200"
          style={{
            background:   'rgba(255,255,255,0.08)',
            border:       '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {initial}
            </div>
          )}

          {/* Name */}
          <span className="text-sm font-medium max-w-[120px] truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {name.split(' ')[0]}
          </span>

          {/* Chevron */}
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className="transition-transform duration-200"
            style={{
              color: 'rgba(255,255,255,0.5)',
              transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* ── Dropdown menu ── */}
        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background:         'rgba(15,15,25,0.85)',
              border:             '1px solid rgba(255,255,255,0.10)',
              backdropFilter:     'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {profile.full_name ?? 'Passenger'}
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {profile.email}
              </div>
            </div>


            {/* Menu items */}
            <div className="p-1.5">
              {/* Wallet */}
              <button
                onClick={() => { setMenuOpen(false); setWalletOpen(true) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left group"
                style={{ color: 'rgba(255,255,255,0.75)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="text-base">💰</span>
                <span>Wallet</span>
              </button>

             {/* Bookings */}
<button
  onClick={() => {
    setMenuOpen(false)
    window.location.href = '/bookings'
  }}
  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left group"
  style={{ color: 'rgba(255,255,255,0.75)' }}
  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
>
  <span className="text-base">🎫</span>
  <span>My Bookings</span>
</button>

{/* Divider */}
<div className="my-1 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left"
                style={{ color: 'rgba(239,68,68,0.85)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.10)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="text-base">👋</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wallet modal rendered at top level */}
      {walletOpen && (
        <WalletModal userId={profile.id} onClose={() => setWalletOpen(false)} />
      )}
    </>
  )
}