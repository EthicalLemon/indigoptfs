'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const posts = [
  {
    slug: 'new-aircraft',
    title: 'Introducing Our New Aircraft Fleet',
    excerpt: 'Discover the latest additions to our fleet with improved comfort and efficiency.',
    date: 'April 25, 2026',
  },
  {
    slug: 'summer-routes',
    title: 'New Summer Routes Announced',
    excerpt: 'Explore exciting new destinations launching this summer.',
    date: 'April 20, 2026',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Blog & Updates
          </h1>
          <p className="text-[var(--text-muted)]">
            Latest news, updates, and announcements from IndiGo Airlines
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-10">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
          >
            Blog
          </Link>
          <Link
            href="/blog/announcements"
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10"
          >
            Announcements
          </Link>
        </div>

        {/* Blog Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-indigo-500/40 transition"
            >
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {post.date}
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                {post.title}
              </h2>

              <p className="text-sm text-[var(--text-muted)] mb-4">
                {post.excerpt}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className="text-indigo-400 text-sm hover:underline"
              >
                Read more →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}