'use client'

import { useEffect, useRef, useState } from 'react'

interface Item {
  image: string
  title: string
  description?: string
}

export default function InfiniteMenu({
  items,
  speed = 0.3
}: {
  items: Item[]
  speed?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)
  const velocityRef = useRef(speed)
  const isHovering = useRef(false)
  const rafRef = useRef<number>()

  const [selected, setSelected] = useState<Item | null>(null)

  /* ─── SCROLL ENGINE ─── */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const animate = () => {
      scrollRef.current += velocityRef.current
      el.scrollLeft = scrollRef.current

      if (scrollRef.current >= el.scrollWidth / 2) scrollRef.current = 0
      if (scrollRef.current <= 0) scrollRef.current = el.scrollWidth / 2

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [])

  /* ─── HOVER CONTROL ─── */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const enter = () => (isHovering.current = true)
    const leave = () => {
      isHovering.current = false
      velocityRef.current = speed
    }

    const move = (e: MouseEvent) => {
      if (!isHovering.current) return

      const rect = el.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      velocityRef.current = (percent - 0.5) * 10
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    el.addEventListener('mousemove', move)

    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('mousemove', move)
    }
  }, [speed])

  const loopItems = [...items, ...items]

  return (
    <>
      {/* ───────── SCROLLER ───────── */}
      <div className="relative w-full h-full overflow-hidden">
        <div
          ref={containerRef}
          className="flex gap-10 px-10 h-full items-center overflow-hidden cursor-pointer"
        >
          {loopItems.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelected(item)}
              className="
                min-w-[320px]
                h-[420px]
                rounded-3xl
                relative
                overflow-hidden
                group
                bg-white/5
                backdrop-blur-xl
                border border-white/10
                shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                transition-all duration-500
                hover:scale-105
                hover:shadow-[0_30px_80px_rgba(0,0,0,0.8)]
              "
            >
              <img
                src={item.image}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 p-6">
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* EDGE FADE */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-black to-transparent" />
      </div>

      {/* ───────── MODAL ───────── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              w-[90%] max-w-2xl
              rounded-3xl
              overflow-hidden
              bg-[#0b0b0b]
              border border-white/10
              shadow-2xl
              animate-[fadeIn_.3s_ease]
            "
          >
            {/* IMAGE */}
            <img
              src={selected.image}
              className="w-full h-[300px] object-cover"
            />

            {/* CONTENT */}
            <div className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-3">
                {selected.title}
              </h2>
              <p className="text-white/70">
                {selected.description || 'Message coming soon.'}
              </p>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}