'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Announcement = {
  id: number
  content: string
  author: string
  created_at: string
  attachments?: string[]
  discord_id?: string
}

const ADMIN_IDS = ['722375269578440707']

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setAnnouncements(data)
    setLoading(false)
  }

  const isAdmin = (id?: string) => {
    return id && ADMIN_IDS.includes(id)
  }

  const deleteAnnouncement = async (id: number) => {
    const confirmDelete = confirm('Delete this announcement?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (!error) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } else {
      console.error(error)
      alert('Delete failed')
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto px-6">

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Announcements
          </h1>
          <p className="text-[var(--text-muted)]">
            Live updates from Discord
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-gray-500">No announcements yet</p>
        ) : (
          <div className="space-y-5">
            {announcements.map((a, i) => {

              // ✅ Extract ALL URLs from content
              const urlRegex = /(https?:\/\/[^\s]+)/gi
              const urls = a.content?.match(urlRegex) || []

              // ✅ Keep only image URLs
              const imageUrls = urls.filter(url =>
                url.includes('discordapp.net') ||
                url.includes('media.discordapp.net') ||
                url.match(/\.(png|jpg|jpeg|webp|gif)/i)
              )

              // ✅ Clean URLs (remove ?ex= etc)
              const cleanedImageUrls = imageUrls.map(url => url.split('?')[0])

              // ✅ Remove URLs from visible text
              const cleanText = a.content
                ?.replace(urlRegex, '')
                .trim()

              // ✅ Merge DB + content images (avoid duplicates)
              const allImages = [
                ...(a.attachments || []),
                ...cleanedImageUrls
              ]

              const uniqueImages = [...new Set(allImages)]

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl border bg-[var(--bg-secondary)] border-indigo-500/30"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-indigo-400 font-medium">
                        @{a.author}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>

                    {isAdmin(a.discord_id) && (
                      <button
                        onClick={() => deleteAnnouncement(a.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* TEXT */}
                  {cleanText && (
                    <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">
                      {cleanText}
                    </p>
                  )}

                  {/* IMAGES */}
                  {uniqueImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {uniqueImages.map((url, index) => (
                     <img
  key={index}
  src={url}
  alt="attachment"
  className="rounded-lg border border-indigo-500/20"
  onError={(e) => {
    const clean = url.split('?')[0]
    if (e.currentTarget.src !== clean) {
      e.currentTarget.src = clean
    }
  }}
/>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}