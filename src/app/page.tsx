'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Refrigerator, ChefHat, Trash2, ShoppingBag, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  const features = [
    { name: 'Fridge Tracker',    icon: Refrigerator, desc: 'Monitor your inventory and expiry dates in real time.', href: '/fridge',   color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/20',    glow: 'shadow-cyan-400/20' },
    { name: 'Recipe Studio',     icon: ChefHat,       desc: 'AI-crafted recipes from exactly what you have.',       href: '/recipes',  color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   glow: 'shadow-amber-400/20' },
    { name: 'Smart Shopping',    icon: ShoppingBag,   desc: 'Sync your needs before you shop — never forget.',     href: '/shopping', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', glow: 'shadow-emerald-400/20' },
    { name: 'Waste Analytics',   icon: Trash2,        desc: 'Track what you save and what you lose.',               href: '/waste',    color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20',    glow: 'shadow-rose-400/20' },
  ]

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  }

  const fadeUp = {
    hidden:  { opacity: 0, y: 32, filter: 'blur(8px)' },
    visible: { 
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.21, 0.61, 0.35, 1] }
    }
  }

  return (
    <main ref={containerRef} className="relative w-full">

      {/* ─── Hero ──────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden text-center">
        
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[100px]" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-xl mx-auto space-y-6"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[11px] font-bold tracking-[0.25em] uppercase backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to the Future of Food
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fadeUp} className="text-[clamp(3rem,12vw,7rem)] font-heading leading-[0.88] text-white">
            Meet<br /><span className="text-primary">FridgeMind</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-[17px] md:text-xl text-white/50 font-light leading-relaxed max-w-md mx-auto">
            Your intelligent kitchen companion. Track inventory, reduce waste, and discover AI-powered recipes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-white/10 tap-scale"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border-white/10 text-white/60 hover:text-white font-bold text-sm tracking-widest uppercase transition-all active:scale-95 tap-scale"
            >
              Explore Modules
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-[1px] h-10 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ─── Feature Grid (Mobile: cards, Desktop: alternating) ─── */}
      <section id="features" className="px-5 py-16 md:py-32 max-w-5xl mx-auto">

        {/* Mobile: tap-to-expand card grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {features.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.21, 0.61, 0.35, 1] }}
            >
              <Link
                href={f.href}
                className={`flex flex-col p-5 rounded-[1.75rem] border ${f.border} ${f.bg} gap-4 active:scale-[0.96] transition-transform duration-150 shadow-xl ${f.glow} h-full`}
              >
                <div className={`w-12 h-12 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center border ${f.border}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-black text-base text-white leading-tight mb-1`}>{f.name}</h3>
                  <p className="text-[11px] text-white/40 leading-relaxed font-light">{f.desc}</p>
                </div>
                <div className={`mt-auto flex items-center gap-1 ${f.color} text-[10px] font-black uppercase tracking-widest`}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop: alternating layout */}
        <div className="hidden md:block space-y-40">
          {features.map((f, i) => (
            <motion.section
              key={f.name}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.21, 0.61, 0.35, 1] }}
              className={`grid grid-cols-2 gap-16 items-center ${i % 2 !== 0 ? 'direction-rtl' : ''}`}
            >
              <div className={`flex flex-col ${i % 2 !== 0 ? 'order-2' : 'order-1'}`}>
                <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center ${f.bg} ${f.color} mb-8 border ${f.border}`}>
                  <f.icon className="w-10 h-10" />
                </div>
                <h2 className="text-6xl font-heading mb-4 text-white">{f.name}</h2>
                <p className="text-xl text-white/50 font-light leading-relaxed mb-8">{f.desc}</p>
                <Link href={f.href} className={`group inline-flex items-center gap-3 text-lg font-bold ${f.color}`}>
                  <span className="relative">
                    Launch Module
                    <span className={`absolute bottom-0 left-0 w-full h-[1px] ${f.bg.replace('/10', '')} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotate: i % 2 === 0 ? 3 : -3 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.2, ease: [0.21, 0.61, 0.35, 1] }}
                className={`relative aspect-square rounded-[3rem] overflow-hidden border ${f.border} ${f.bg} ${i % 2 !== 0 ? 'order-1' : 'order-2'}`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <f.icon className={`w-40 h-40 ${f.color} blur-2xl`} />
                  <f.icon className={`w-40 h-40 ${f.color} absolute`} />
                </div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 1.5, delay: 0.4 }}
                        className={`h-full ${f.bg.replace('/10', '')}`}
                      />
                    </div>
                    <p className="text-[10px] tracking-widest uppercase opacity-30">Module Active</p>
                  </div>
                  <p className="text-4xl font-heading opacity-10">0{i + 1}</p>
                </div>
              </motion.div>
            </motion.section>
          ))}
        </div>
      </section>

      {/* ─── Footer CTA ──────────────────────────────── */}
      <section className="px-5 py-20 md:py-32 flex flex-col items-center text-center border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 max-w-lg"
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/30 font-bold">Ready to transform your kitchen?</p>
          <h3 className="text-4xl md:text-6xl font-heading text-white">The evolution starts here.</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/fridge"
              className="px-8 py-4 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase hover:bg-white/90 transition-all active:scale-95 tap-scale"
            >
              Open Fridge Tracker
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
