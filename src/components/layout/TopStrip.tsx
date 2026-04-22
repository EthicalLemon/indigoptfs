'use client'

import Image from 'next/image'

export function TopStrip() {
  return (
    <div className="
      fixed top-0 w-full z-40
      flex items-center justify-between
      px-6 h-16
      bg-white/60 dark:bg-[#050816]/60
      backdrop-blur-xl
      border-b border-gray-200 dark:border-white/10
    ">

      {/* LEFT: BRAND */}
      <div className="flex items-center gap-3">
        <Image
          src="/planes/logo.jpg"
          alt="IndiGo"
          width={36}
          height={36}
          className="rounded-md"
        />

        <div className="leading-tight">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            IndiGo PTFS
          </div>
          <div className="text-xs text-gray-500">
            Virtual Airline Network
          </div>
        </div>
      </div>

      {/* RIGHT: STATUS */}
      <div className="hidden sm:flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <span>120+ Routes</span>
        <span>99.2% On-Time</span>
        <span>Live Operations</span>
      </div>
    </div>
  )
}