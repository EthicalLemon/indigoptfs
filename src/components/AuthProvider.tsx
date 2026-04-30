'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  role: string
  avatar_url: string | null
  discord_id: string | null
}

interface AuthContextValue {
  user: { id: string; email?: string } | null
  profile: UserProfile | null
  role: string | null
  ready: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  ready: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

const supabase = createClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole]       = useState<string | null>(null)
  const [ready, setReady]     = useState(false)

  useEffect(() => {
    // Fires immediately on mount with the current session —
    // survives page navigations since this component never unmounts.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') return

        const sessionUser = session?.user ?? null

        if (!sessionUser) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setReady(true)
          return
        }

        // Already have this user loaded — skip fetch
        if (profile?.id === sessionUser.id) {
          setReady(true)
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, avatar_url, discord_id')
          .eq('id', sessionUser.id)
          .maybeSingle()

        setUser({ id: sessionUser.id, email: sessionUser.email })
        setProfile(data ?? null)
        setRole(data?.role ?? null)
        setReady(true)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, role, ready }}>
      {children}
    </AuthContext.Provider>
  )
}