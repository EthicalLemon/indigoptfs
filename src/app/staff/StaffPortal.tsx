'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ✅ FIX: client.ts exports createClient(), not a named `supabase` instance.
// Call createClient() inside the async function instead.

type Profile = {
  id: string
  name: string
  role: string
  email?: string
}

export default function StaffPortal({ initialProfile }: { initialProfile: Profile }) {
  const [profile] = useState<Profile>(initialProfile)
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
          <p className="text-sm text-neutral-400">
            Welcome, {profile.name}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Profile Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
          <h2 className="text-sm text-neutral-400 mb-1">Name</h2>
          <p className="text-lg">{profile.name}</p>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
          <h2 className="text-sm text-neutral-400 mb-1">Role</h2>
          <p className="text-lg capitalize">{profile.role}</p>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
          <h2 className="text-sm text-neutral-400 mb-1">User ID</h2>
          <p className="text-sm break-all">{profile.id}</p>
        </div>
      </div>

      {/* Placeholder Sections */}
      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <h2 className="text-lg font-medium mb-2">Operations</h2>
          <p className="text-sm text-neutral-400">
            Manage flights, bookings, and schedules.
          </p>
        </div>

        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <h2 className="text-lg font-medium mb-2">Analytics</h2>
          <p className="text-sm text-neutral-400">
            View system performance and reports.
          </p>
        </div>
      </div>
    </div>
  )
}