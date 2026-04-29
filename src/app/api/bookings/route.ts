import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Service-role client — bypasses RLS, used for wallet deduction + DM sending
// This is safe because this is a server-only route
const serviceSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateRef() {
  return 'IGO' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()

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

    // ✅ FIX APPLIED HERE
    const { flight_id, seat_class: rawSeatClass, passenger } = await req.json()

    type SeatClass = 'economy' | 'business' | 'first'
    const seat_class = rawSeatClass as SeatClass

    if (!flight_id || !seat_class || !passenger) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // ── 1. Fetch flight ────────────────────────────────────────────────────
    const { data: flight, error: flightErr } = await serviceSupabase
      .from('flights')
      .select('*')
      .eq('id', flight_id)
      .single()

    if (flightErr || !flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
    }

    const priceMap: Record<string, number> = {
      economy:  flight.price_economy,
      business: flight.price_business,
      first:    flight.price_first,
    }

    const basePrice = priceMap[seat_class] ?? 0
    const tax       = Math.round(basePrice * 0.18)
    const total     = basePrice + tax

    // ── 2. Fetch profile ───────────────────────────────────────────────────
    const { data: profile, error: profileErr } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, email, discord_id')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // ── 3. Wallet ──────────────────────────────────────────────────────────
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
      return NextResponse.json({
        error: 'Insufficient balance',
        balance: wallet?.balance ?? 0,
        required: total,
      }, { status: 400 })
    }

    // ── 4. Seat availability ───────────────────────────────────────────────
    const totalSeats  = flight[`seats_${seat_class}`] as number
    const bookedSeats = flight[`seats_${seat_class}_booked`] as number

    if (bookedSeats >= totalSeats) {
      return NextResponse.json({ error: 'No seats available in this class' }, { status: 400 })
    }

    // ── 5. Deduct wallet ───────────────────────────────────────────────────
    const newBalance = wallet.balance - total

    const { error: walletErr } = await serviceSupabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id)

    if (walletErr) {
      return NextResponse.json({ error: 'Wallet deduction failed' }, { status: 500 })
    }

    // ── 6. Log transaction ─────────────────────────────────────────────────
    await serviceSupabase.from('wallet_transactions').insert({
      user_id: user.id,
      amount: -total,
      type: 'spend',
      description: `✈️ Flight booking ${flight.flight_number} (${seat_class}) — ${flight.departure_code} → ${flight.arrival_code}`,
    })

    // ── 7. Booking ─────────────────────────────────────────────────────────
    const bookingRef = generateRef()

    const { data: booking, error: bookingErr } = await serviceSupabase
      .from('bookings')
      .insert({
        booking_ref: bookingRef,
        user_id: user.id,
        flight_id,
        seat_class,
        passengers: [passenger],
        total_price: total,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingErr) {
      await serviceSupabase.from('wallets').update({ balance: wallet.balance }).eq('user_id', user.id)
      return NextResponse.json({ error: 'Booking failed: ' + bookingErr.message }, { status: 500 })
    }

    // ── 8. Increment seats ─────────────────────────────────────────────────
    await serviceSupabase
      .from('flights')
      .update({ [`seats_${seat_class}_booked`]: bookedSeats + 1 })
      .eq('id', flight_id)

    // ── 9. Discord DM ──────────────────────────────────────────────────────
    if (profile.discord_id) {
      try {
        const classLabel =
          seat_class === 'economy' ? 'Economy' :
          seat_class === 'business' ? 'Business' :
          seat_class === 'first' ? 'First Class' :
          seat_class

        const depDate = new Date(flight.departure_time).toLocaleString('en-IN', {
          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false,
        })

        const arrDate = new Date(flight.arrival_time).toLocaleString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: false,
        })

        await fetch(`https://discord.com/api/v10/users/@me/channels`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipient_id: profile.discord_id }),
        }).then(async r => {
          const dmChannel = await r.json()
          if (!dmChannel.id) return

          const boardingPassEmbed = {
            color: 0x6366f1,
            title: '🎫  Boarding Pass — IndiGo Airlines',
            description: `Your booking is **confirmed**! See you on board.`,
            fields: [
              { name: '✈️  Flight', value: `**${flight.flight_number}**`, inline: true },
              { name: '💺  Class', value: classLabel, inline: true },
              { name: '🎫  Booking Ref', value: `\`${bookingRef}\``, inline: true },
              { name: '🛫  Departure', value: `**${flight.departure_city} (${flight.departure_code})**\n${depDate}`, inline: true },
              { name: '🛬  Arrival', value: `**${flight.arrival_city} (${flight.arrival_code})**\n${arrDate}`, inline: true },
              { name: '🚪  Gate', value: flight.gate || 'TBA', inline: true },
              { name: '🏢  Terminal', value: flight.terminal || 'TBA', inline: true },
              { name: '👤  Passenger', value: `${passenger.first_name} ${passenger.last_name}`, inline: true },
              { name: '💰  Amount Paid', value: `₹${total.toLocaleString('en-IN')}`, inline: true },
              { name: '📊  Wallet Balance', value: `₹${newBalance.toLocaleString('en-IN')} remaining`, inline: false },
            ],
            footer: { text: 'IndiGo Airlines • Please arrive 2 hours before departure' },
            timestamp: new Date().toISOString(),
          }

          await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [boardingPassEmbed] }),
          })
        })
      } catch (dmErr) {
        console.warn('Discord DM failed:', dmErr)
      }
    }

    return NextResponse.json({
      success: true,
      booking_ref: bookingRef,
      new_balance: newBalance,
      total_paid: total,
    })

  } catch (err: any) {
    console.error('Booking route error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}