'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { 
  Leaf, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  ChevronRight,
  Barcode
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const mockData = [
  { name: 'Week 1', saved: 400, wasted: 120 },
  { name: 'Week 2', saved: 600, wasted: 80 },
  { name: 'Week 3', saved: 200, wasted: 240 },
  { name: 'Week 4', saved: 450, wasted: 50 },
]

const recentEvents = [
  { id: 1, item: 'Greek Yogurt', outcome: 'saved', reason: 'Used in Recipe', value: 340, date: '2h ago', points: '+15' },
  { id: 2, item: 'Fresh Spinach', outcome: 'wasted', reason: 'Spoiled', value: 85, date: '1d ago', points: '-10' },
  { id: 3, item: 'Whole Milk', outcome: 'saved', reason: 'Consumed', value: 45, date: '2d ago', points: '+5' },
]

const categoryData = [
  { name: 'Dairy', value: 40, color: 'oklch(0.7 0.12 195)' },
  { name: 'Produce', value: 30, color: 'oklch(0.7 0.15 140)' },
  { name: 'Proteins', value: 20, color: 'oklch(0.55 0.18 25)' },
  { name: 'Others', value: 10, color: 'oklch(0.8 0.15 90)' },
]

const liveWasteFeed = [
  { id: 1, user: 'You', action: 'Saved', item: 'Organic Spinach', value: '₹45', time: 'Just now', type: 'save' },
  { id: 2, user: 'Neighbor', action: 'Shared', item: '2L Milk', value: '₹120', time: '2m ago', type: 'share' },
  { id: 3, user: 'You', action: 'Wasted', item: 'Greek Yogurt', value: '₹85', time: '15m ago', type: 'waste' },
]

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function WasteTrackerPage() {
  const [isLogging, setIsLogging] = useState(false)
  const [liveSaves, setLiveSaves] = useState(1240)
  const [wasteFeed, setWasteFeed] = useState(liveWasteFeed)

  // Simulation of real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const items = ['Tomato', 'Bread', 'Cheese', 'Apples', 'Eggs', 'Milk', 'Yogurt', 'Chicken', 'Salmon']
        const item = items[Math.floor(Math.random() * items.length)]
        const isSave = Math.random() > 0.4
        const newEntry = {
          id: Date.now(),
          user: Math.random() > 0.5 ? 'Community' : 'System',
          action: isSave ? 'Saved' : 'Alert',
          item: item,
          value: `₹${Math.floor(Math.random() * 100) + 10}`,
          time: 'Just now',
          type: isSave ? 'save' : 'waste'
        }
        setWasteFeed(prev => [newEntry, ...prev.slice(0, 4)])
        if (isSave) setLiveSaves(prev => prev + 5)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-32">
      {/* Header & Real-time Console */}
      <div className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg px-3 py-1.5 font-black text-[10px] uppercase tracking-widest">
                Real-Time Impact
              </Badge>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">System Live</span>
              </div>
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-[0.85] uppercase">
                Waste <span className="text-primary italic">Intelligence</span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl font-light leading-relaxed">
                Your high-fidelity neural center for managing household sustainability. Every save contributes to your global impact score.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <Button 
              onClick={() => {
                toast.success('Instant Save Logged: +15 Credits')
                setLiveSaves(prev => prev + 15)
              }}
              className="rounded-[2rem] h-20 px-8 font-black text-xs gap-4 bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group uppercase tracking-widest"
            >
              <Zap className="h-6 w-6 fill-current group-hover:animate-bounce" /> Log Instant Save
            </Button>
            <Button variant="outline" className="rounded-[2rem] border-white/10 bg-white/5 hover:bg-white/10 h-20 px-8 font-black text-xs gap-4 glass uppercase tracking-widest group">
              <Barcode className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" /> Audit Inventory
            </Button>
          </div>
          
          {/* Live Intensity Meter */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 max-w-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-20 h-20 text-emerald-500" />
            </div>
            <div className="flex justify-between items-end mb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Kitchen Efficiency Index</p>
                <h4 className="text-2xl font-black text-white">94.2 <span className="text-xs text-emerald-500 ml-1 font-bold">OPTIMAL</span></h4>
              </div>
              <TrendingDown className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: i < 18 ? 1 : 0.2 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={`h-full flex-1 rounded-full ${i < 18 ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <p className="mt-4 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Tracking 12 real-time parameters</p>
          </div>
        </div>

        {/* Live Feed Component */}
        <Card className="w-full xl:w-[400px] bg-black/40 border-white/5 rounded-[32px] overflow-hidden glass-dark border-t-white/10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Stream</span>
            </div>
            <Sparkles className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div className="p-2 h-[220px] overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {wasteFeed.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold ${
                        entry.type === 'save' ? 'bg-emerald-500/20 text-emerald-400' : 
                        entry.type === 'share' ? 'bg-violet-500/20 text-violet-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {entry.user[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">{entry.item}</div>
                        <div className="text-[9px] text-muted-foreground uppercase font-black opacity-40">{entry.action} • {entry.time}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-black ${entry.type === 'save' ? 'text-emerald-500' : 'text-white/40'}`}>
                      {entry.value}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Stack */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Live Value Saved', value: `₹${liveSaves.toLocaleString()}`, trend: '+14%', up: true, icon: Zap, color: 'text-primary', border: 'border-l-primary' },
          { label: 'Value Wasted', value: '₹320', trend: '-22%', up: false, icon: TrendingDown, color: 'text-red-500', border: 'border-l-red-500' },
          { label: 'CO₂ Prevented', value: '12.4 kg', trend: '1 tree', up: true, icon: Leaf, color: 'text-emerald-500', border: 'border-l-emerald-500' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-black/20 border-white/5 shadow-2xl border-l-4 ${kpi.border} transition-all hover:translate-y-[-4px] rounded-[32px] overflow-hidden glass`}>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className={`border-none ${kpi.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} font-black text-[10px]`}>
                    {kpi.up ? <ArrowUpRight className="h-3 w-3 mr-1 inline" /> : <ArrowDownRight className="h-3 w-3 mr-1 inline" />}
                    {kpi.trend}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black text-white tracking-tighter">{kpi.value}</div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Weekly Trend Chart */}
        <Card className="lg:col-span-2 bg-[#0a0a0b] border-white/5 rounded-[48px] overflow-hidden glass-dark">
          <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-white tracking-tight">Waste vs. Saved Trends</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Real-time performance analytics</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                 <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Efficiency</span>
               </div>
               <div className="flex items-center gap-2 bg-red-500/5 px-3 py-1.5 rounded-full border border-red-500/10">
                 <div className="w-2 h-2 rounded-full bg-red-500" />
                 <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Loss</span>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.12 195)" stopOpacity={1} />
                      <stop offset="100%" stopColor="oklch(0.7 0.12 195)" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      backgroundColor: 'rgba(10,10,11,0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)',
                      padding: '16px'
                    }} 
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                  />
                  <Bar dataKey="saved" name="Saved" fill="url(#barGradient)" radius={[12, 12, 0, 0]} barSize={45} />
                  <Bar dataKey="wasted" name="Wasted" fill="oklch(0.55 0.18 25)" radius={[12, 12, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-[#0a0a0b] border-white/5 rounded-[48px] p-10 flex flex-col items-center glass-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="p-0 mb-10 w-full relative z-10">
            <CardTitle className="text-2xl font-black text-white tracking-tight">Main Culprits</CardTitle>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Waste Distribution</p>
          </CardHeader>
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '24px', backgroundColor: 'rgba(10,10,11,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <motion.span 
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="text-4xl font-black text-white leading-none tracking-tighter"
               >
                40%
               </motion.span>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Dairy</span>
            </div>
          </div>
          <div className="w-full space-y-4 mt-8 relative z-10">
             {categoryData.map((item, i) => (
               <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                    <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/20" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-sm font-black text-white">{item.value}%</span>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Real-time Motivation Card */}
        <Card className="bg-gradient-to-br from-emerald-500/20 via-primary/5 to-transparent border-white/10 rounded-[48px] p-12 relative overflow-hidden group shadow-2xl">
          <div className="absolute bottom-[-20%] right-[-10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-[2000ms]" />
          <div className="absolute top-[10%] left-[10%] w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          
          <div className="space-y-8 relative z-10">
             <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-xl">
                <Target className="h-8 w-8 text-emerald-400" />
             </div>
             <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[0.95]">2026 Sustainability Frontier</h3>
              <p className="text-muted-foreground text-xl leading-relaxed font-light">
                Your precision in managing dairy waste has increased by <span className="text-emerald-400 font-black">22%</span> this month. You are on track for the <span className="text-white font-bold tracking-widest uppercase text-xs border border-white/20 px-2 py-1 rounded-md ml-1">Elite Guardian</span> status.
              </p>
             </div>
             
             <div className="bg-black/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Projected Annual Savings</span>
                  <span className="text-2xl font-black text-white">₹14,500</span>
                </div>
                <div className="h-12 w-[1px] bg-white/10" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Impact Level</span>
                  <span className="text-2xl font-black text-emerald-500">Tier 4</span>
                </div>
             </div>

             <Button className="rounded-2xl h-16 px-10 font-black text-lg gap-4 bg-white text-black hover:bg-emerald-500 hover:text-white transition-all duration-500 group shadow-xl">
                Upgrade My Strategy <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
             </Button>
          </div>
        </Card>

        {/* Live Activity Log */}
        <Card className="bg-[#0a0a0b] border-white/5 rounded-[48px] overflow-hidden glass-dark">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-white tracking-tight">System Audit Log</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Live tracking of every action</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <Info className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentEvents.map(event => (
                <div key={event.id} className="flex items-center gap-6 p-8 hover:bg-white/[0.02] transition-all group relative cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                    event.outcome === 'saved' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20 group-hover:bg-red-500 group-hover:text-white'
                  }`}>
                    {event.outcome === 'saved' ? <ShieldCheck className="h-7 w-7" /> : <TrendingDown className="h-7 w-7" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-black text-white text-xl tracking-tight group-hover:text-primary transition-colors">{event.item}</div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">{event.date}</div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 italic">
                      <div className={`w-1.5 h-1.5 rounded-full ${event.outcome === 'saved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {event.reason}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black tracking-tighter ${event.outcome === 'saved' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {event.outcome === 'saved' ? '+' : '-'}₹{event.value}
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${event.points.startsWith('+') ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                       {event.points} CREDITS
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 text-center bg-white/[0.01]">
               <Button variant="ghost" className="text-muted-foreground hover:text-white font-black uppercase tracking-[0.2em] text-[10px] gap-3 h-12 px-8 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                  Access Immutable History <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
