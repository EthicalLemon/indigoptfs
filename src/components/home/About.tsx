'use client'

import { motion } from 'framer-motion'

export default function AboutSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 overflow-hidden">

      {/* ✨ subtle glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/3 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-1/3 w-[300px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-widest uppercase font-semibold mb-4 text-indigo-400">
            About IndiGo
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Redefining <span className="italic font-light text-gray-300">Air Travel</span>
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg">
            At IndiGo, we combine precision engineering, world-class service,
            and modern design to deliver a seamless flying experience across
            120+ destinations worldwide.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* LEFT — STORY */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-white">
              Our Journey
            </h3>

            <p className="text-gray-400 leading-relaxed">
              Founded with a vision to make air travel more accessible and
              enjoyable, IndiGo has grown into one of the most trusted airline
              brands globally. Our commitment to punctuality, innovation,
              and passenger comfort sets us apart in the aviation industry.
            </p>

            <p className="text-gray-400 leading-relaxed">
              From short-haul regional flights to long-haul international
              journeys, every detail is engineered to provide a smooth,
              reliable, and premium experience.
            </p>

            {/* MINI STATS */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: '120+', label: 'Routes' },
                { value: '98%', label: 'On-Time' },
                { value: '2M+', label: 'Passengers' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-center"
                >
                  <div className="text-lg font-bold text-indigo-400">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — CARDS */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >

            {[
              {
                title: 'Precision',
                desc: 'Industry-leading punctuality and operational excellence.',
              },
              {
                title: 'Innovation',
                desc: 'Modern aircraft and cutting-edge passenger experience.',
              },
              {
                title: 'Comfort',
                desc: 'Spacious cabins and premium onboard services.',
              },
              {
                title: 'Global Reach',
                desc: 'Connecting people across continents seamlessly.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition"
              >
                <div className="text-indigo-400 font-semibold mb-2">
                  {item.title}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}

          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <a
            href="/flights"
            className="inline-block px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:scale-105 transition shadow-lg shadow-indigo-500/30"
          >
            Start Your Journey →
          </a>
        </motion.div>

      </div>
    </section>
  )
}