'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Flight } from '@/types'

export function useFlights(filters?: { from?: string; to?: string; date?: string }) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetch = async () => {
    setLoading(true)
    const supabase = supabaseRef.current
    let q = supabase
      .from('flights')
      .select('*, host:profiles!host_id(id, full_name)')
      .neq('status', 'cancelled')
      .order('departure_time', { ascending: true })

    if (filters?.from) q = q.eq('departure_code', filters.from)
    if (filters?.to)   q = q.eq('arrival_code',   filters.to)
    if (filters?.date) {
      const s = new Date(filters.date); s.setHours(0, 0, 0, 0)
      const e = new Date(filters.date); e.setHours(23, 59, 59, 999)
      q = q.gte('departure_time', s.toISOString()).lte('departure_time', e.toISOString())
    }
    const { data } = await q
    setFlights((data as Flight[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    const supabase = supabaseRef.current
    const channel = supabase
      .channel('flights-hook-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, () => fetch())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [filters?.from, filters?.to, filters?.date])

  return { flights, loading, refetch: fetch }
}
