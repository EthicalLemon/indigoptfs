import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane } from 'lucide-react'

export default async function BookingsPage() {
  // ✅ FIX: createClient() must be awaited in Next.js 15
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_ref,
      total_price,
      seat_class,
      created_at,
      flight:flights (
        flight_number,
        departure_city,
        departure_code,
        arrival_city,
        arrival_code,
        departure_time
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const classLabel: Record<string, string> = {
    economy: 'Economy',
    business: 'Business',
    first: 'First Class',
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#07070f]">
      <div className="max-w-2xl mx-auto px-4 py-12">

        <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>

        {!bookings || bookings.length === 0 ? (
          <div className="text-white">No bookings</div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => {

              // handle array relation
              const flight = Array.isArray(b.flight) ? b.flight[0] : b.flight

              return (
                <Link key={b.id} href={`/bookings/${b.id}`} className="p-4 border rounded">

                  <div className="flex justify-between mb-2">
                    <span>{b.booking_ref}</span>
                    <span>{classLabel[b.seat_class] ?? b.seat_class}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <div>{flight?.departure_code ?? '—'}</div>
                      <div>{flight?.departure_city ?? ''}</div>
                    </div>

                    <Plane size={14} />

                    <div>
                      <div>{flight?.arrival_code ?? '—'}</div>
                      <div>{flight?.arrival_city ?? ''}</div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-2">
                    <div>{formatDate(flight?.departure_time)}</div>
                    <div>₹{Number(b.total_price).toLocaleString('en-IN')}</div>
                  </div>

                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}