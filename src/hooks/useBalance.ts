'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBalance() {
  const supabase = createClient()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    let userId: string

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      userId = user.id

      // 🔹 Fetch initial balance
      const { data } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()

      setBalance(data?.balance || 0)

      // 🔥 REALTIME SYNC
      supabase
        .channel('wallet-live')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          payload => {
            setBalance(payload.new.balance)
          }
        )
        .subscribe()
    }

    load()

    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  return balance
}