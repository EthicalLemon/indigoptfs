import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const serviceSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateRef() {
  return 'IGO' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: Request) {
  try {
    // ✅ FIX: cookies() must be awaited in Next.js 15
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { flight_id, seat_class: rawSeatClass, passenger } = await req.json()

    type SeatClass = 'economy' | 'business' | 'first'
    const seat_class = rawSeatClass as SeatClass

    if (!flight_id || !seat_class || !passenger) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data: flight, error: flightErr } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flight_id)
      .single()

    if (flightErr || !flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
    }

    const priceMap: Record<SeatClass, number> = {
      economy:  flight.price_economy,
      business: flight.price_business,
      first:    flight.price_first,
    }

    const basePrice = priceMap[seat_class] ?? 0
    const tax = Math.round(basePrice * 0.18)
    const total = basePrice + tax

    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, email, discord_id')
      .eq('id', user.id)
      .single()

    let { data: wallet } = await serviceSupabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!wallet) {
      const { data: newWallet } = await serviceSupabase
        .from('wallets')
        .insert({ user_id: user.id, balance: 0 })
        .select()
        .single()
      wallet = newWallet
    }

    if (!wallet || wallet.balance < total) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const totalSeats = flight[`seats_${seat_class}`] as number
    const bookedSeats = flight[`seats_${seat_class}_booked`] as number

    if (bookedSeats >= totalSeats) {
      return NextResponse.json({ error: 'No seats available' }, { status: 400 })
    }

    const newBalance = wallet.balance - total

    await serviceSupabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id)

    await serviceSupabase.from('wallet_transactions').insert({
      user_id: user.id,
      amount: -total,
      type: 'spend',
      description: `Flight booking ${flight.flight_number}`,
    })

    const bookingRef = generateRef()

    await serviceSupabase.from('bookings').insert({
      booking_ref: bookingRef,
      user_id: user.id,
      flight_id,
      seat_class,
      passengers: [passenger],
      total_price: total,
      status: 'confirmed',
    })

    await serviceSupabase
      .from('flights')
      .update({ [`seats_${seat_class}_booked`]: bookedSeats + 1 })
      .eq('id', flight_id)

    return NextResponse.json({
      success: true,
      booking_ref: bookingRef,
      new_balance: newBalance,
      total_paid: total,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}