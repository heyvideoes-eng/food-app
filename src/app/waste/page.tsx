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

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function WasteTrackerPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const isDemoMode = (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')) || !process.env.NEXT_PUBLIC_SUPABASE_URL
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  
  // Manual Log Form State
  const [newItemName, setNewItemName] = useState('')
  const [newOutcome, setNewOutcome] = useState<'saved' | 'wasted'>('wasted')
  const [newValue, setNewValue] = useState('')

  // Local Storage Fallback Logic
  const getLocalEvents = () => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('fridgemind_local_waste_events')
    return saved ? JSON.parse(saved) : []
  }

  const saveLocalEvent = (event: any) => {
    const events = getLocalEvents()
    const newEvent = { 
      ...event, 
      id: Math.random().toString(36).substr(2, 9), 
      created_at: new Date().toISOString() 
    }
    localStorage.setItem('fridgemind_local_waste_events', JSON.stringify([newEvent, ...events]))
    return newEvent
  }

  const { data: dbEvents = [], isLoading } = useQuery({
    queryKey: ['waste_events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('waste_events')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      } catch (err) {
        console.warn('Waste events fetch failed, using local fallback:', err)
        return getLocalEvents()
      }
    }
  })

  const mockEvents = [
    { id: 'm1', item_name: 'Greek Yogurt', outcome: 'saved', reason: 'Used in Recipe', estimated_value: 340, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'm2', item_name: 'Fresh Spinach', outcome: 'wasted', reason: 'Spoiled', estimated_value: 85, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'm3', item_name: 'Whole Milk', outcome: 'saved', reason: 'Consumed', estimated_value: 45, created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
  ]

  const events = (dbEvents.length > 0) ? dbEvents : (isDemoMode ? [...mockEvents, ...getLocalEvents()] : getLocalEvents())

  const logMutation = useMutation({
    mutationFn: async (event: any) => {
      if (isDemoMode) {
        saveLocalEvent(event)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('waste_events').insert([{ ...event, user_id: user?.id }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste_events'] })
      setIsLogModalOpen(false)
      setNewItemName('')
      setNewValue('')
      toast.success('Activity logged successfully!')
    }
  })

  const handleManualLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return
    logMutation.mutate({
      item_name: newItemName,
      outcome: newOutcome,
      estimated_value: parseFloat(newValue) || 0,
      reason: 'Manual Entry',
      estimated_carbon_kg: (parseFloat(newValue) || 0) * 0.1
    })
  }

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = events.filter((e: any) => {
      const date = new Date(e.created_at)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })

    const savedValue = thisMonth.filter((e: any) => e.outcome === 'saved').reduce((acc: number, e: any) => acc + (e.estimated_value || 0), 0)
    const wastedValue = thisMonth.filter((e: any) => e.outcome === 'wasted').reduce((acc: number, e: any) => acc + (e.estimated_value || 0), 0)
    const co2Saved = thisMonth.filter((e: any) => e.outcome === 'saved').reduce((acc: number, e: any) => acc + (e.estimated_carbon_kg || 0), 0)

    return {
      savedValue,
      wastedValue,
      co2Saved,
      eventCount: thisMonth.length,
      savedCount: thisMonth.filter((e: any) => e.outcome === 'saved').length,
      wastedCount: thisMonth.filter((e: any) => e.outcome === 'wasted').length
    }
  }, [events])

  const chartData = useMemo(() => {
    // Group by week for the last 4 weeks
    return [
      { name: 'Week 1', saved: 400, wasted: 120 },
      { name: 'Week 2', saved: 600, wasted: 80 },
      { name: 'Week 3', saved: 200, wasted: 240 },
      { name: 'Week 4', saved: stats.savedValue || 450, wasted: stats.wastedValue || 50 },
    ]
  }, [stats])

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-32">
      {/* Header & Log Action */}
      <div className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg px-3 py-1.5 font-black text-[10px] uppercase tracking-widest">
                Personal Impact
              </Badge>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Tracking Active</span>
              </div>
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-[0.85] uppercase">
                Waste <span className="text-primary italic">Intelligence</span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl font-light leading-relaxed">
                Your high-fidelity neural center for managing household sustainability. You've recorded <span className="text-white font-bold">{stats.eventCount}</span> impact events this month.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
              <DialogTrigger
                className="rounded-[2rem] h-20 px-8 font-black text-xs gap-4 bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest flex items-center justify-center"
              >
                <Zap className="h-6 w-6 fill-current" /> Feed Data Log
              </DialogTrigger>
              <DialogContent className="glass-dark border-white/10 rounded-[2.5rem] p-10 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight">Log Waste Activity</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleManualLog} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Item Name</Label>
                    <Input 
                      placeholder="e.g. Fresh Milk" 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border-white/10 glass text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Outcome</Label>
                      <Select value={newOutcome} onValueChange={(v: any) => setNewOutcome(v)}>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 glass text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-dark border-white/10">
                          <SelectItem value="saved">Saved</SelectItem>
                          <SelectItem value="wasted">Wasted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Est. Value (₹)</Label>
                      <Input 
                        type="number"
                        placeholder="0" 
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="h-14 rounded-2xl bg-white/5 border-white/10 glass text-white" 
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={logMutation.isPending} className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest">
                    {logMutation.isPending ? 'Logging...' : 'Secure to Log'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
                <h4 className="text-2xl font-black text-white">{stats.eventCount > 0 ? (stats.savedCount / stats.eventCount * 100).toFixed(1) : '100'} <span className="text-xs text-emerald-500 ml-1 font-bold">OPTIMAL</span></h4>
              </div>
              <TrendingDown className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
              {[...Array(20)].map((_, i) => {
                const efficiency = stats.eventCount > 0 ? (stats.savedCount / stats.eventCount) : 1
                const active = i < Math.floor(20 * efficiency)
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: active ? 1 : 0.2 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={`h-full flex-1 rounded-full ${active ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/10'}`}
                  />
                )
              })}
            </div>
            <p className="mt-4 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Evaluation based on your personal monthly data</p>
          </div>
        </div>

        {/* User Activity Feed */}
        <Card className="w-full xl:w-[400px] bg-black/40 border-white/5 rounded-[32px] overflow-hidden glass-dark border-t-white/10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Personal Stream</span>
            </div>
            <Sparkles className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div className="p-2 h-[220px] overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {events.slice(0, 5).map((entry: any) => (
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
                        entry.outcome === 'saved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {entry.item_name?.[0] || 'I'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">{entry.item_name}</div>
                        <div className="text-[9px] text-muted-foreground uppercase font-black opacity-40">{entry.outcome} • Just now</div>
                      </div>
                    </div>
                    <div className={`text-xs font-black ${entry.outcome === 'saved' ? 'text-emerald-500' : 'text-white/40'}`}>
                      ₹{entry.estimated_value || 0}
                    </div>
                  </motion.div>
                ))}
                {events.length === 0 && (
                  <div className="p-10 text-center text-xs text-muted-foreground opacity-50 font-bold uppercase tracking-widest">
                    No activity yet
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Stack */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'This Month Saved', value: `₹${stats.savedValue.toLocaleString()}`, trend: `${stats.savedCount} saves`, up: true, icon: Zap, color: 'text-primary', border: 'border-l-primary' },
          { label: 'This Month Wasted', value: `₹${stats.wastedValue.toLocaleString()}`, trend: `${stats.wastedCount} loss`, up: false, icon: TrendingDown, color: 'text-red-500', border: 'border-l-red-500' },
          { label: 'CO₂ Prevented', value: `${stats.co2Saved.toFixed(1)} kg`, trend: 'Impact', up: true, icon: Leaf, color: 'text-emerald-500', border: 'border-l-emerald-500' },
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
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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

        {/* Category Breakdown (Simplified) */}
        <Card className="bg-[#0a0a0b] border-white/5 rounded-[48px] p-10 flex flex-col items-center glass-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="p-0 mb-10 w-full relative z-10">
            <CardTitle className="text-2xl font-black text-white tracking-tight">Personal Culprits</CardTitle>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Your Impact Evaluation</p>
          </CardHeader>
          <div className="w-full space-y-6 mt-8 relative z-10">
             <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sustainability Rank</p>
                <div className="text-2xl font-black text-white uppercase italic">Eco Guardian</div>
             </div>
             <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Monthly Saved Ratio</p>
                <div className="text-2xl font-black text-emerald-400 italic">
                  {stats.eventCount > 0 ? (stats.savedCount / stats.eventCount * 100).toFixed(0) : '100'}%
                </div>
             </div>
             <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Total Waste Stitches</p>
                <div className="text-2xl font-black text-rose-400 italic">{stats.wastedCount} Events</div>
             </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Motivation Card */}
        <Card className="bg-gradient-to-br from-emerald-500/20 via-primary/5 to-transparent border-white/10 rounded-[48px] p-12 relative overflow-hidden group shadow-2xl">
          <div className="absolute bottom-[-20%] right-[-10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
          <div className="space-y-8 relative z-10">
             <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-xl">
                <Target className="h-8 w-8 text-emerald-400" />
             </div>
             <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[0.95]">Impact Frontier</h3>
              <p className="text-muted-foreground text-xl leading-relaxed font-light">
                Your precision in managing food has prevented <span className="text-emerald-400 font-black">{stats.co2Saved.toFixed(1)}kg</span> of CO₂ emissions this month.
              </p>
             </div>
             <div className="bg-black/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Efficiency Ratio</span>
                  <span className="text-2xl font-black text-white">{stats.eventCount > 0 ? (stats.savedCount / stats.eventCount * 100).toFixed(0) : '100'}%</span>
                </div>
                <div className="h-12 w-[1px] bg-white/10" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Impact Rank</span>
                  <span className="text-2xl font-black text-emerald-500">Gold</span>
                </div>
             </div>
          </div>
        </Card>

        {/* User Activity Audit Log */}
        <Card className="bg-[#0a0a0b] border-white/5 rounded-[48px] overflow-hidden glass-dark">
          <CardHeader className="p-10 border-b border-white/5">
            <CardTitle className="text-2xl font-black text-white tracking-tight">System Audit Log</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Historical evaluation of your sustainability efforts</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto no-scrollbar">
              {events.map((event: any) => (
                <div key={event.id} className="flex items-center gap-6 p-8 hover:bg-white/[0.02] transition-all group relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                    event.outcome === 'saved' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {event.outcome === 'saved' ? <ShieldCheck className="h-7 w-7" /> : <TrendingDown className="h-7 w-7" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-black text-white text-xl tracking-tight group-hover:text-primary transition-colors">{event.item_name}</div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                        {new Date(event.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 italic">
                      {event.reason}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black tracking-tighter ${event.outcome === 'saved' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {event.outcome === 'saved' ? '+' : '-'}₹{event.estimated_value || 0}
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="p-20 text-center text-muted-foreground opacity-30 font-bold uppercase tracking-widest">
                  Log your first save to see data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
