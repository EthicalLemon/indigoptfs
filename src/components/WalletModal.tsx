'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

let _client: ReturnType<typeof createClient> | null = null
function getClient() {
  if (!_client) _client = createClient()
  return _client
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

interface Props {
  userId: string
  onClose: () => void
}

function getTier(bal: number) {
  if (bal >= 50000) return { label: 'Platinum', emoji: '👑', color: '#e2e8f0' }
  if (bal >= 10000) return { label: 'Gold',     emoji: '🥇', color: '#f59e0b' }
  if (bal >= 2000)  return { label: 'Silver',   emoji: '🥈', color: '#94a3b8' }
  return                   { label: 'Bronze',   emoji: '🥉', color: '#a16207' }
}

function nextTierInfo(bal: number) {
  if (bal >= 50000) return null
  if (bal >= 10000) return { next: 'Platinum', at: 50000, progress: (bal - 10000) / 40000 }
  if (bal >= 2000)  return { next: 'Gold',     at: 10000, progress: (bal - 2000)  / 8000  }
  return                   { next: 'Silver',   at: 2000,  progress: bal / 2000              }
}

export default function WalletModal({ userId, onClose }: Props) {
  const [balance, setBalance]         = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = getClient()

      // Fetch wallet
      let { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle()

      setBalance(wallet?.balance ?? 0)

      // Fetch recent transactions
      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      setTransactions(txns ?? [])
      setLoading(false)
    }

    load()
  }, [userId])

  const tier       = getTier(balance ?? 0)
  const tierInfo   = nextTierInfo(balance ?? 0)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1,    y: 0,  opacity: 1 }}
          exit={{    scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Card top — gradient hero ── */}
          <div
            className="relative px-6 pt-8 pb-6"
            style={{
              background: 'linear-gradient(135deg, #3730a3 0%, #6366f1 50%, #8b5cf6 100%)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              ✕
            </button>

            {/* Card chip + logo */}
            <div className="flex items-center justify-between mb-6">
              <div
                className="w-8 h-6 rounded-md"
                style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.3)' }}
              />
              <div className="text-white/70 text-xs font-semibold tracking-widest">INDIGO COINS</div>
            </div>

            {/* Balance */}
            <div className="mb-1">
              <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Available Balance</div>
              <div className="text-white font-bold tracking-tight" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                {loading ? '—' : `₹${(balance ?? 0).toLocaleString('en-IN')}`}
              </div>
            </div>

            {/* Tier badge */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-lg">{tier.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: tier.color }}>{tier.label} Member</span>
            </div>

            {/* Tier progress bar */}
            {tierInfo && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>{Math.round(tierInfo.progress * 100)}% to {tierInfo.next}</span>
                  <span>₹{tierInfo.at.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(tierInfo.progress * 100, 100)}%`, background: 'rgba(255,255,255,0.8)' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Quick stats ── */}
          <div
           className="grid grid-cols-3 divide-x border-b"
style={{ 
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  borderColor: 'rgba(255,255,255,0.06)'
}}
          >
            {[
              { label: 'Earned',  value: `₹${transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}` },
              { label: 'Spent',   value: `₹${Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)).toLocaleString('en-IN')}` },
              { label: 'Txns',    value: String(transactions.length) },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-3">
                <div className="text-white font-semibold text-sm">{loading ? '—' : s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Transaction history ── */}
          <div className="px-5 py-4" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <div className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Recent Activity
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm">No transactions yet</div>
                <div className="text-xs mt-1">Use /daily on Discord to earn coins</div>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(txn => {
                  const positive = txn.amount > 0
                  const date = new Date(txn.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short'
                  })
                  return (
                    <div
                      key={txn.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{ background: positive ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)' }}
                      >
                        {txn.type === 'spend' ? '✈️' : txn.type === 'admin_grant' ? '🛡️' : '🎁'}
                      </div>

                      {/* Description */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium truncate"
                          style={{ color: 'rgba(255,255,255,0.75)' }}
                        >
                          {txn.description.replace(/^[^\w]*/, '')}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {date}
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        className="text-sm font-semibold shrink-0"
                        style={{ color: positive ? '#4ade80' : '#a5b4fc' }}
                      >
                        {positive ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Footer hint ── */}
          <div
            className="px-5 py-3 text-center text-xs border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
          >
            Earn coins via <span style={{ color: 'rgba(255,255,255,0.45)' }}>/daily</span> and <span style={{ color: 'rgba(255,255,255,0.45)' }}>/trivia</span> on Discord
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}