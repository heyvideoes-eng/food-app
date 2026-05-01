'use client'

import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Refrigerator, 
  ChefHat, 
  Trash2, 
  ShoppingBag, 
  Sparkles, 
  Zap,
  Activity,
  Layers,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const { data: fridgeCount = 0 } = useQuery({
    queryKey: ['fridge_count'],
    queryFn: async () => {
      const { count } = await supabase.from('fridge_items').select('*', { count: 'exact', head: true })
      return count || 0
    },
    enabled: !!user
  })

  const { data: shopCount = 0 } = useQuery({
    queryKey: ['shop_count'],
    queryFn: async () => {
      const { count } = await supabase.from('shopping_list_items').select('*', { count: 'exact', head: true })
      return count || 0
    },
    enabled: !!user
  })

  const features = [
    { name: 'Fridge Tracker',    icon: Refrigerator, count: fridgeCount, desc: 'Monitor your inventory and expiry dates.', href: '/fridge',   color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/20' },
    { name: 'Recipe Studio',     icon: ChefHat,       count: null,        desc: 'AI-crafted recipes from your items.',       href: '/recipes',  color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
    { name: 'Smart Shopping',    icon: ShoppingBag,   count: shopCount,   desc: 'Sync your needs before you shop.',     href: '/shopping', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { name: 'Waste Analytics',   icon: Trash2,        count: null,        desc: 'Track what you save and lose.',               href: '/waste',    color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20' },
  ]

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  }

  const fadeUp = {
    hidden:  { opacity: 0, y: 32, filter: 'blur(8px)' },
    visible: { 
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.21, 0.61, 0.35, 1] as const }
    }
  }

  if (user) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6 max-w-7xl mx-auto space-y-16">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary text-[10px] tracking-[0.3em] uppercase font-bold">
              <Activity className="h-3.5 w-3.5" /> Intelligence Dashboard
            </div>
            <h1 className="text-5xl md:text-7xl font-heading text-white">System <span className="text-primary italic">Online</span></h1>
            <p className="text-muted-foreground text-lg font-light">Welcome back, {user.user_metadata?.display_name || 'Guardian'}. Your kitchen is optimized.</p>
          </div>
          <div className="flex gap-3">
             <div className="glass p-4 rounded-2xl flex items-center gap-4 border-white/5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Eco Score</p>
                  <p className="text-lg font-black text-white">850 <span className="text-[10px] text-primary">pts</span></p>
                </div>
             </div>
          </div>
        </div>

        {/* Quick Glance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Link key={f.name} href={f.href} className="group">
              <div className={`h-full p-8 rounded-[2.5rem] border ${f.border} ${f.bg} glass transition-all duration-500 hover:scale-[1.02] active:scale-95 flex flex-col justify-between min-h-[220px]`}>
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${f.bg} ${f.color} border ${f.border}`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  {f.count !== null && (
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-white">{f.count}</span>
                      <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Active Units</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-heading text-white group-hover:text-primary transition-colors">{f.name}</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">{f.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Intelligence Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/20">Operational Feed</h2>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>
              <div className="space-y-4">
                {[
                  { icon: Layers, title: 'Inventory Sync', detail: '3 new items added via scan.', time: '2h ago' },
                  { icon: ChefHat, title: 'New Recipe Match', detail: 'Spicy Pasta discovered for your spinach.', time: '5h ago' },
                  { icon: CheckCircle2, title: 'Waste Saved', detail: 'Completed milk consumption 1 day early.', time: 'Yesterday' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 rounded-3xl glass border-white/5 hover:bg-white/5 transition-all group">
                    <div className="p-3 rounded-2xl bg-white/5 text-primary group-hover:bg-primary/20 transition-all">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-white font-bold text-sm tracking-tight">{item.title}</h4>
                       <p className="text-xs text-muted-foreground font-light">{item.detail}</p>
                    </div>
                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">{item.time}</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/20">System Stats</h2>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>
              <div className="glass rounded-[2.5rem] p-8 border-white/5 space-y-8">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                       <span>Pantry Capacity</span>
                       <span>75%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-3/4 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                       <span>Nutrient Efficiency</span>
                       <span>92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[92%] bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    </div>
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black text-xs tracking-widest uppercase hover:bg-primary/80 transition-all">
                    Generate Monthly Report
                 </Button>
              </div>
           </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative w-full">
      {/* Hero section for non-logged-in users (same as before but cleaner) */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-32 pb-24 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[100px]" />
        </div>

        <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-10 max-w-xl mx-auto space-y-8">
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[11px] font-bold tracking-[0.25em] uppercase backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5" /> Future of Food Intelligence
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[clamp(3rem,12vw,7rem)] font-heading leading-[0.88] text-white">
            Meet<br /><span className="text-primary italic">FridgeMind</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[17px] md:text-xl text-white/50 font-light leading-relaxed max-w-md mx-auto">
            The neural center for your kitchen. Track inventory, reduce waste, and discover AI recipes in a cinematic dashboard.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/login" className="px-10 py-5 rounded-2xl bg-white text-black font-black text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-all shadow-2xl">
              Initialize Account
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
