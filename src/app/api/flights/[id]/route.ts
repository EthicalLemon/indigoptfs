import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('flights')
    .select('*, host:profiles!host_id(id, full_name, email, role)')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
  return NextResponse.json({ flight: data })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'staff', 'host'].includes(profile.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Hosts can only edit their own flights
  if (profile.role === 'host') {
    const { data: flight } = await supabase.from('flights').select('host_id').eq('id', params.id).single()
    if (!flight || flight.host_id !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own flights' }, { status: 403 })
    }
  }

  const body = await request.json()
  const { error, data } = await supabase.from('flights').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flight: data })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can delete flights' }, { status: 403 })
  }

  const { error } = await supabase.from('flights').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
