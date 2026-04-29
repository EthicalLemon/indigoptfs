'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, Edit2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function StaffUserManager() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('user')
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers((data as Profile[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveRole = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) { toast.error('Failed to update role'); return }
    toast.success('Role updated')
    setEditingRole(null)
    load()
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: '#ef4444',
    staff: '#6366f1',
    host: '#f59e0b',
    user: '#6b7280',
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>User Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage roles and permissions for all IndiGo Airlines users</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="indigo-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="indigo-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                </td></tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.full_name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user.full_name || 'Unnamed User'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Mail size={13} />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    {editingRole === user.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={newRole}
                          onChange={e => setNewRole(e.target.value as UserRole)}
                          className="indigo-input py-1 text-xs appearance-none w-28"
                        >
                          {['user', 'host', 'staff', 'admin'].map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                        <button onClick={() => saveRole(user.id)} className="p-1 rounded text-green-400 hover:bg-green-500/10"><Check size={14} /></button>
                        <button onClick={() => setEditingRole(null)} className="p-1 rounded text-red-400 hover:bg-red-500/10"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} style={{ color: ROLE_COLORS[user.role] }} />
                        <span className="text-sm font-medium capitalize" style={{ color: ROLE_COLORS[user.role] }}>{user.role}</span>
                      </div>
                    )}
                  </td>
                  <td><span className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(user.created_at)}</span></td>
                  <td>
                    <button
                      onClick={() => { setEditingRole(user.id); setNewRole(user.role) }}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                      style={{ color: 'var(--indigo-accent)' }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
