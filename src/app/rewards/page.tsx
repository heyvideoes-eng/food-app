'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Flame, 
  Star, 
  Award, 
  Share2, 
  Leaf, 
  Trophy, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  Target,
  Zap
} from 'lucide-react'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function RewardsPage() {
  const isDemoMode = (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')) || !process.env.NEXT_PUBLIC_SUPABASE_URL

  const { data: rewardsData, isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('rewards')
          .select('*')
          .eq('user_id', user?.id)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        return data || { points: 0, current_streak_days: 0, eco_score: 0 }
      } catch (err) {
        console.warn('Supabase rewards fetch failed, using defaults')
        return { points: 1250, current_streak_days: 7, eco_score: 450 } // Demo defaults
      }
    }
  })

  const points = rewardsData?.points ?? 0
  const streak = rewardsData?.current_streak_days ?? 0
  const ecoScore = rewardsData?.eco_score ?? 0
  const rank = Math.max(1, 100 - Math.floor(ecoScore / 10))

  const badges = [
    { id: 1, title: 'Leftover Legend', description: 'Saved 10 items from waste', icon: Star, unlocked: ecoScore > 100, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 2, title: 'Planner Pro', description: 'Planned meals for 7 days', icon: Target, unlocked: streak >= 7, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 3, title: 'Carbon Cutter', description: 'Prevented 50kg CO2e', icon: Leaf, unlocked: ecoScore > 500, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 4, title: 'Super Scanner', description: 'Scanned 50 barcodes', icon: Zap, unlocked: points > 5000, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ]

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Streak Hero Section */}
      <Card className="bg-gradient-to-br from-[#161821] to-[#0a0c14] border-white/5 shadow-2xl rounded-[40px] overflow-hidden relative border-t-2 border-t-amber-500/30">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="space-y-6 text-center md:text-left flex-1">
            <Badge className="bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">Active Streak</Badge>
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                {streak} Day <span className="text-amber-500">Blaze</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md">
                You've reduced waste for a full week! Next reward: <span className="text-white font-bold">"Waste Warrior"</span> title.
              </p>
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold gap-3 shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
                <Share2 className="h-5 w-5" /> Share Streak
              </Button>
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold gap-3 transition-all">
                View History
              </Button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-[48px] bg-[#1a1c26] border border-amber-500/20 flex flex-col items-center justify-center shadow-2xl relative">
              <Flame className="h-20 w-20 md:h-24 md:w-24 text-amber-500 animate-pulse drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              <div className="mt-2 text-xs font-bold text-amber-500/60 uppercase tracking-widest">Keep it up!</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eco Score Ring */}
        <Card className="md:col-span-1 bg-[#161821] border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center text-center space-y-6">
          <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">Eco Guardian Score</h3>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-white/5" strokeWidth="12" fill="transparent" />
              <circle cx="80" cy="80" r="70" className="stroke-emerald-500" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * 0.75)} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{ecoScore}</span>
              <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Level 12</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed px-4">
            You are in the <span className="text-white font-bold">Top 15%</span> of eco-conscious users this month.
          </p>
          <Button variant="ghost" className="text-primary text-xs font-bold gap-1 hover:bg-transparent pr-0">
            Learn how it's calculated <ChevronRight className="h-4 w-4" />
          </Button>
        </Card>

        {/* Impact Stats */}
        <Card className="md:col-span-2 bg-[#161821] border-white/5 rounded-[40px] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Lifetime Impact
              </CardTitle>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-lg">Realtime</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-6">
             <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Money Saved', value: '₹14,580', icon: Zap, color: 'text-primary' },
                 { label: 'Food Rescued', value: '185kg', icon: ShieldCheck, color: 'text-cyan-400' },
                 { label: 'CO2 Prevented', value: '240kg', icon: Leaf, color: 'text-emerald-500' },
                 { label: 'Leaderboard Rank', value: `#${rank}`, icon: Trophy, color: 'text-amber-400' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-3xl group hover:border-white/10 transition-all">
                   <div className="flex items-center gap-3 mb-3">
                     <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                       <stat.icon className="h-4 w-4" />
                     </div>
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                   </div>
                   <div className="text-2xl font-black text-white tracking-tight group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Gallery */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight">Badge Gallery</h2>
            <p className="text-sm text-muted-foreground">Unlock more to earn exclusive rewards.</p>
          </div>
          <Button variant="ghost" className="text-muted-foreground font-bold h-8 pr-0">See All Collection</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map(badge => (
            <Card key={badge.id} className={`group relative rounded-[32px] border-white/5 overflow-hidden transition-all duration-500 ${
              badge.unlocked ? 'bg-[#161821] hover:border-primary/20 hover:translate-y-[-4px]' : 'bg-black/20 opacity-50 grayscale border-dashed'
            }`}>
              {badge.unlocked && (
                <div className="absolute top-[-50%] right-[-50%] w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <CardContent className="p-8 flex flex-col items-center text-center space-y-5">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                  badge.unlocked ? `${badge.bg} ${badge.color}` : 'bg-white/5 text-muted-foreground'
                }`}>
                  <badge.icon className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-white tracking-tight">{badge.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed px-2">{badge.description}</p>
                </div>
                {badge.unlocked ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">Unlocked</Badge>
                ) : (
                  <Badge variant="outline" className="border-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full opacity-50">Locked</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
