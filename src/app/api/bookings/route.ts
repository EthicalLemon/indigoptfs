import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBookingRef } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id') || user.id

  // Only admins/staff can query other users' bookings
  if (userId !== user.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin', 'staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*, flight:flights(*, host:profiles!host_id(full_name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookings: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { flight_id, seat_class, passengers, total_price } = body

  if (!flight_id || !seat_class || !passengers || !total_price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check seat availability
  const { data: flight } = await supabase.from('flights').select('*').eq('id', flight_id).single()
  if (!flight) return NextResponse.json({ error: 'Flight not found' }, { status: 404 })

  const booked = flight[`seats_${seat_class}_booked`]
  const total = flight[`seats_${seat_class}`]
  if (booked >= total) return NextResponse.json({ error: 'No seats available' }, { status: 409 })

  const ref = generateBookingRef()
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({ booking_ref: ref, user_id: user.id, flight_id, seat_class, passengers, total_price, status: 'confirmed' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment booked seats
  await supabase.from('flights').update({
    [`seats_${seat_class}_booked`]: booked + passengers.length
  }).eq('id', flight_id)

  return NextResponse.json({ booking }, { status: 201 })
}
