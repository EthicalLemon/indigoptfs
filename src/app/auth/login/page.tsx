'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [error, setError]       = useState('')

  // Handle Discord OAuth callback — Supabase redirects back here with session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push(redirectTo)
        router.refresh()
      }
    })
    return () => subscription.unsubscribe()
  }, [router, redirectTo, supabase])

  // Email/password login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  // Discord OAuth login
  async function handleDiscordLogin() {
    setDiscordLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${redirectTo}`,
        scopes: 'identify email guilds',
      },
    })

    if (error) {
      setError(error.message)
      setDiscordLoading(false)
    }
    // On success, Supabase redirects the browser — no need to do anything else
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">✈</span>
              </div>
              <span className="text-white font-bold text-xl tracking-wide">IndiGo Airlines</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-white/50 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Discord Button */}
          <button
            onClick={handleDiscordLogin}
            disabled={discordLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 mb-6 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#5865F2]/25"
          >
            {discordLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <DiscordIcon />
            )}
            {discordLoading ? 'Connecting to Discord...' : 'Continue with Discord'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/60 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-white/[0.06] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] placeholder:text-white/20 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/60 text-sm">Password</label>
                <Link href="/auth/forgot-password" className="text-indigo-400 text-xs hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/[0.06] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] placeholder:text-white/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60.1 4.88A58.55 58.55 0 0 0 45.66.45a40.44 40.44 0 0 0-1.8 3.69 54.17 54.17 0 0 0-16.24 0A40.13 40.13 0 0 0 25.8.45 58.4 58.4 0 0 0 11.35 4.9C1.63 19.35-1 33.44.31 47.36a58.9 58.9 0 0 0 17.93 9.07 44.64 44.64 0 0 0 3.86-6.29 38.37 38.37 0 0 1-6.08-2.92c.51-.37 1.01-.76 1.49-1.14a41.91 41.91 0 0 0 35.7 0c.49.4.99.77 1.49 1.14a38.24 38.24 0 0 1-6.1 2.93 44.32 44.32 0 0 0 3.86 6.29 58.72 58.72 0 0 0 17.96-9.09C71.6 31.27 68.3 17.3 60.1 4.88ZM23.73 38.78c-3.5 0-6.38-3.22-6.38-7.17s2.82-7.18 6.38-7.18c3.55 0 6.44 3.22 6.38 7.18 0 3.95-2.82 7.17-6.38 7.17Zm23.54 0c-3.5 0-6.38-3.22-6.38-7.17s2.82-7.18 6.38-7.18c3.56 0 6.44 3.22 6.39 7.18 0 3.95-2.83 7.17-6.39 7.17Z" fill="currentColor"/>
    </svg>
  )
}