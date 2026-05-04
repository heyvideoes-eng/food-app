'use client'

import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  ArrowUpRight,
  Clock,
  Apple
} from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [userName, setUserName] = useState('Alpha')

  useEffect(() => {
    const user = localStorage.getItem('fridgemind_user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        if (parsed.displayName) setUserName(parsed.displayName)
      } catch (e) {
        console.error('Failed to parse user identity')
      }
    }
  }, [])
  return (
    <DashboardShell>
      <div className="space-y-12">
        {/* Welcome Section */}
        <header className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-primary text-[10px] tracking-[0.5em] uppercase font-black opacity-60"
          >
            <Activity className="h-3 w-3" /> System Diagnostics: Optimal [Node 0.1]
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-7xl font-heading font-black tracking-tighter text-white"
          >
            Welcome back, <span className="text-primary italic">{userName}.</span>
          </motion.h1>
        </header>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Energy Consumed', value: '1,240', unit: 'kcal', icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Neural Accuracy', value: '99.4', unit: '%', icon: Activity, color: 'text-secondary', bg: 'bg-secondary/5' },
            { label: 'Waste Reduced', value: '12.5', unit: 'kg', icon: TrendingDown, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
            { label: 'Health Score', value: '94', unit: '/100', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-400/5' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className={`glass-card !p-8 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl -mr-12 -mt-12 group-hover:opacity-100 transition-opacity`} />
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} border border-white/5`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/20 hover:text-white transition-all">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">{stat.value}</span>
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{stat.unit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Intelligence Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative p-16 rounded-[4rem] bg-gradient-to-br from-secondary/20 via-[#050508] to-primary/10 border border-white/5 overflow-hidden group shadow-2xl"
        >
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-black tracking-[0.4em] uppercase">
                <Sparkles className="h-4 w-4" /> Neural Recommendation
              </div>
              <h2 className="text-5xl font-heading font-black text-white leading-[0.9] tracking-tighter">
                Your Spinach is reaching <br /> 
                <span className="text-secondary italic">critical expiry.</span>
              </h2>
              <p className="text-white/40 font-light text-xl leading-relaxed max-w-lg">
                I've detected 250g of Organic Spinach that expires in 14 hours. 
                I recommend the "Sautéed Greens" or "Green Smoothie" recipe in the Studio.
              </p>
              <Link href="/dashboard/studio">
                <button className="h-20 px-12 rounded-3xl bg-secondary text-white font-black text-xs tracking-[0.3em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_30px_60px_rgba(var(--secondary),0.4)]">
                  Launch Studio Archetype
                </button>
              </Link>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="w-80 h-80 rounded-[4rem] glass flex items-center justify-center animate-float relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-50" />
                <Apple className="h-40 w-40 text-white opacity-10 relative z-10" />
                <div className="absolute inset-0 border border-white/5 rounded-[4rem]" />
              </div>
            </div>
          </div>
          
          {/* Decorative Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -mr-[250px] -mt-[250px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full -ml-[250px] -mb-[250px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </motion.div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="glass-card !p-12">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Neural Transaction Log</h3>
                <Clock className="h-5 w-5 text-white/20" />
              </div>
              <div className="space-y-8">
                {[
                  { name: 'Whole Milk', type: 'Added', time: '2m ago', color: 'text-primary' },
                  { name: 'Fresh Spinach', type: 'Expiring', time: '14h left', color: 'text-rose-400' },
                  { name: 'Greek Yogurt', type: 'Consumed', time: '1h ago', color: 'text-secondary' },
                  { name: 'Avocado Toast', type: 'Prepared', time: '3h ago', color: 'text-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0 group/item cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color.replace('text', 'bg')} group-hover/item:scale-150 transition-transform`} />
                      <span className="text-lg font-bold text-white group-hover/item:text-primary transition-colors">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.type}</span>
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="glass-card bg-primary/5 border-primary/20 !p-12 relative overflow-hidden">
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="space-y-6">
                  <h3 className="text-4xl font-heading font-black text-white tracking-tight">Neural Statistics</h3>
                  <p className="text-white/40 text-lg font-light leading-relaxed">Your consumption efficiency is up 14% this month. The system is optimizing your node path.</p>
                </div>
                <div className="pt-20">
                   <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '84%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]" 
                      />
                   </div>
                   <div className="flex justify-between mt-6">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Efficiency Rating: 84%</span>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Optimization Target: 95%</span>
                   </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
           </div>
        </div>
      </div>
    </DashboardShell>
  )
}
