import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const identity = data.user.identities?.find(i => i.provider === 'discord')
      const discordMeta = identity?.identity_data

      const profileUpdate: Record<string, string> = {
        email: data.user.email ?? '',
      }

      if (discordMeta?.full_name)   profileUpdate.full_name  = discordMeta.full_name
      if (discordMeta?.avatar_url)  profileUpdate.avatar_url = discordMeta.avatar_url
      if (discordMeta?.custom_claims?.global_name && !discordMeta?.full_name) {
        profileUpdate.full_name = discordMeta.custom_claims.global_name
      }

      // Check if profile already exists to preserve existing role
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!existing) {
        // New user — insert with default role
        await supabase.from('profiles').insert({
          id:   data.user.id,
          ...profileUpdate,
          role: 'user',
        })
      } else {
        // Existing user — update metadata but never overwrite role
        await supabase.from('profiles').update(profileUpdate).eq('id', data.user.id)
      }

      const redirectUrl = new URL(next.startsWith('/') ? next : '/', origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', origin))
}
