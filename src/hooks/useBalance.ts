'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBalance() {
  const supabase = createClient()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch from wallets table (not profiles)
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      setBalance(data?.balance ?? 0)

      // Realtime sync on wallets table
      supabase
        .channel('wallet-live')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${user.id}`,
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