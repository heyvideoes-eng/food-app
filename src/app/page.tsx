'use client'

import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Refrigerator, 
  ChefHat, 
  ShoppingBag, 
  Sparkles, 
  Zap,
  Activity,
  ShieldCheck,
  TrendingDown
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  if (user) {
    // If logged in, show a high-end dashboard summary
    return (
      <main className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-primary text-[10px] tracking-[0.4em] uppercase font-bold opacity-60">
            <Activity className="h-3 w-3" /> System Status: Optimal
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-light tracking-tight text-white">
            Welcome back, <span className="text-primary italic font-medium">{user.user_metadata?.display_name || 'Guardian'}</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Inventory', icon: Refrigerator, href: '/fridge', desc: 'Manage your stock' },
            { name: 'Recipes', icon: ChefHat, href: '/recipes', desc: 'AI-generated meals' },
            { name: 'Shopping', icon: ShoppingBag, href: '/shopping', desc: 'Sync your list' },
          ].map((f) => (
            <Link key={f.name} href={f.href} className="group block p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500">
              <f.icon className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">{f.name}</h3>
              <p className="text-sm text-white/40 font-light">{f.desc}</p>
            </Link>
          ))}
        </div>

        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-primary/10 to-transparent border border-white/5 relative overflow-hidden">
           <div className="relative z-10 space-y-4 max-w-lg">
              <h2 className="text-2xl font-bold text-white">Neural Insights</h2>
              <p className="text-sm text-white/50 leading-relaxed">Your consumption efficiency is up 12% this week. You've successfully prevented 3kg of potential food waste.</p>
              <div className="flex gap-4 pt-4">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-primary uppercase tracking-widest">
                    <TrendingDown className="h-3 w-3" /> Waste: -12%
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" /> Health: 94%
                 </div>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20" />
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-[#050506]">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/[0.03] blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-bold tracking-[0.3em] uppercase"
        >
          <Sparkles className="w-3 h-3" /> Future of Kitchen Operations
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl font-heading font-light tracking-tight text-white leading-[0.9]"
        >
          Your Kitchen, <br />
          <span className="text-primary italic font-medium">Reimagined.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/40 font-light max-w-xl mx-auto leading-relaxed"
        >
          FridgeMind is the neural center for your home. Track inventory, reduce waste, and discover AI-generated recipes in a stunning, stable interface.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
        >
          <Link href="/login" className="px-10 py-5 rounded-2xl bg-white text-black font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-all shadow-xl flex items-center justify-center gap-3">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/10 transition-all">
            Learn More
          </button>
        </motion.div>
      </div>

      <div id="features" className="mt-32 w-full max-w-7xl border-t border-white/5 pt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
         {[
           { icon: Zap, title: 'Real-time Sync', desc: 'Every item scanned is instantly synced across all your devices.' },
           { icon: Activity, title: 'Waste Analytics', desc: 'Beautiful data visualization to help you understand your carbon footprint.' },
           { icon: ChefHat, title: 'AI Studio', desc: 'Pro-grade recipes tailored specifically to what you have left.' }
         ].map((item, i) => (
           <div key={i} className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0">
                 <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-white/40 font-light leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </div>
    </main>
  )
}
