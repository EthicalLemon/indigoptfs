'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WalletDisplay() {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      setBalance(data?.balance ?? 0)
    }

    load()
  }, [])

  return (
    <div className="text-sm text-white/80">
      ₹{balance?.toLocaleString('en-IN') ?? '—'}
    </div>
  )
}