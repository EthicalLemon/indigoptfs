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
      // Upsert profile for Discord users
      // Discord gives us: identity_data.full_name, identity_data.avatar_url, identity_data.custom_claims.global_name
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

      // Upsert profile (trigger should handle it but ensure it exists)
      await supabase.from('profiles').upsert({
        id:   data.user.id,
        ...profileUpdate,
        role: 'user', // default role — admins must manually upgrade in DB
      }, { onConflict: 'id', ignoreDuplicates: false })

      const redirectUrl = new URL(next.startsWith('/') ? next : '/', origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', origin))
}