'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  ArrowRight, 
  Refrigerator, 
  ChefHat, 
  Zap, 
  Activity, 
  LayoutDashboard,
  Cpu
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#050508]">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.4)] group cursor-pointer transition-transform hover:scale-110">
              <Refrigerator className="h-6 w-6 text-black" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tighter text-white">FRIDGEMIND<span className="text-primary italic">.ZERO</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
              <a href="#features" className="hover:text-primary transition-colors">Architecture</a>
              <a href="#" className="hover:text-primary transition-colors">Neural Core</a>
            </div>
            <Link href="/login" className="px-8 py-4 rounded-2xl glass hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all border border-white/5 hover:border-primary/50 shadow-2xl">
              Access System
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-60 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.5em] uppercase mb-12 shadow-2xl"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              System Version: 2.0.0-Zero
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-8xl md:text-[10rem] font-heading font-black text-white tracking-tighter leading-[0.8] mb-16"
            >
              Intelligence <br />
              <span className="text-primary italic">Defined.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl text-white/40 font-light max-w-3xl mb-16 leading-relaxed"
            >
              Welcome to the zero-point of kitchen management. A neural interface designed to sync your inventory, minimize waste, and generate chef-grade recipes with NVIDIA AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-8"
            >
              <Link href="/login" className="group h-24 px-16 rounded-[2.5rem] bg-white text-black font-black text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_30px_60px_rgba(255,255,255,0.1)]">
                Initialize System <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="h-24 px-16 rounded-[2.5rem] glass text-white font-black text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-6 hover:bg-white/5 transition-all border border-white/5 hover:border-white/20">
                Explore Core <Cpu className="h-6 w-6" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 px-6 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: Zap, 
                title: 'Neural Engine', 
                desc: 'Powered by Llama 3.1 for unprecedented recipe creativity and inventory prediction.',
                accent: 'text-primary'
              },
              { 
                icon: Activity, 
                title: 'Real-time Sync', 
                desc: 'Instant cloud persistence across all your nodes with sub-ms latency.',
                accent: 'text-secondary'
              },
              { 
                icon: ChefHat, 
                title: 'Studio Grade', 
                desc: 'Beautifully crafted interfaces that feel like a high-end operating system.',
                accent: 'text-white'
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className="glass-card group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                <div className={`w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ${f.accent} border border-white/5`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-heading font-black text-white mb-6 tracking-tight">{f.title}</h3>
                <p className="text-white/40 font-light text-lg leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
            {[
              { label: 'Neural Latency', value: '14ms' },
              { label: 'Model Accuracy', value: '99.4%' },
              { label: 'Network Uptime', value: '100%' },
              { label: 'Encryption', value: 'Military' }
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">{s.label}</span>
                <span className="text-4xl font-heading font-black text-white tracking-tighter">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
