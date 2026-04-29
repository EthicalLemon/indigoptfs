import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StaffDashboardClient from './StaffDashboardClient'

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  // ✅ FIX 1: await createClient() for Next.js 15
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/staff')
  }

  // ✅ FIX 2: include created_at in select so the Profile type is satisfied
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').upsert({
      id:        user.id,
      email:     user.email ?? '',
      full_name: user.user_metadata?.full_name ?? '',
      role:      'user',
    })
    redirect('/auth/login?error=profile_not_ready')
  }

  const allowedRoles = ['admin', 'staff', 'host']
  if (!allowedRoles.includes(profile.role)) {
    return <AccessDenied email={profile.email} role={profile.role} />
  }

  return <StaffDashboardClient profile={profile} />
}

function AccessDenied({ email, role }: { email: string; role: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/[0.04] border border-red-500/20 rounded-2xl p-10">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-white/50 text-sm mb-2">
            Logged in as <span className="text-white">{email}</span>
          </p>
          <p className="text-white/40 text-sm mb-6">
            Your role (<span className="text-yellow-400">{role}</span>) does not have staff portal access.
            Contact an admin to upgrade your role.
          </p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Back to Homepage
            </a>
            <a
              href="/auth/login"
              className="block w-full bg-white/[0.06] hover:bg-white/[0.10] text-white/70 font-medium py-3 rounded-xl transition-all text-sm"
            >
              Sign in with a different account
            </a>
          </div>
        </div>
        <p className="text-white/20 text-xs mt-4">
          To grant staff access, run in Supabase SQL Editor:<br/>
          <code className="text-white/40">UPDATE profiles SET role = 'admin' WHERE email = '{email}';</code>
        </p>
      </div>
    </div>
  )
}