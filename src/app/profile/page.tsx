'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Grid, 
  Bookmark, 
  MapPin, 
  Link as LinkIcon, 
  ShieldCheck, 
  Zap, 
  Star, 
  Leaf, 
  CheckCircle2,
  Phone,
  Mail,
  Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { whatsappNumber, setWhatsappNumber } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [userName, setUserName] = useState('Rishi Studio')
  const [userBio, setUserBio] = useState('Saving the planet, one meal at a time. 🌍 | AI Food Guardian')
  const [userEmail, setUserEmail] = useState('rishi@fridgemind.ai')
  
  const supabase = createClient()

  const stats = [
    { label: 'Saved Items', value: 142, icon: Leaf },
    { label: 'Streak Days', value: 12, icon: Zap },
    { label: 'Eco Points', value: '4.8k', icon: Star },
  ]

  const badges = [
    { name: 'Leftover Legend', icon: Star, color: 'text-amber-400' },
    { name: 'Carbon Cutter', icon: Leaf, color: 'text-emerald-400' },
    { name: 'Super Scanner', icon: Zap, color: 'text-cyan-400' },
    { name: 'Zero-Waste Pro', icon: CheckCircle2, color: 'text-violet-400' },
  ]

  return (
    <div className="max-w-4xl mx-auto pb-32">
      {/* Header / Identity */}
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start p-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-primary to-violet-500">
            <div className="w-full h-full rounded-full bg-[#0a0a0b] p-1">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover bg-white/5"
              />
            </div>
          </div>
          <button className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full border-4 border-[#0a0a0b] hover:scale-110 transition-all">
            <Plus className="h-4 w-4" />
          </button>
        </motion.div>

        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h1 className="text-3xl font-heading text-white">{userName}</h1>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl glass border-white/10 h-9 font-bold px-6"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5 text-white">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-10">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center md:items-start">
                <span className="text-xl font-black text-white">{s.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-white">Neural Guardian</p>
            <p className="text-sm text-muted-foreground font-light max-w-md leading-relaxed">
              {userBio}
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Earth • 2026
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
              <LinkIcon className="h-3.5 w-3.5" /> fridgemind.ai/rishi
            </div>
          </div>
        </div>
      </div>

      {/* Editing State / Settings Panel */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-10 mb-10"
        >
          <Card className="glass border-white/10 rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Display Identity</label>
                  <Input 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 glass text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-1">WhatsApp Link</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/50" />
                    <Input 
                      value={whatsappNumber} 
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 glass text-white font-mono" 
                      placeholder="+91..."
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Mission Bio</label>
                  <Input 
                    value={userBio} 
                    onChange={(e) => setUserBio(e.target.value)}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 glass text-white" 
                  />
                </div>
              </div>
              <Button 
                className="w-full h-14 rounded-2xl bg-white text-black font-bold tracking-widest uppercase text-xs hover:bg-white/90"
                onClick={() => {
                  setIsEditing(false)
                  toast.success('Identity Updated Successfully')
                }}
              >
                Save Identity Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs / Content */}
      <div className="border-t border-white/5">
        <div className="flex justify-center gap-16 -mt-[1px]">
          <button className="flex items-center gap-2 py-4 border-t border-white text-[10px] font-bold uppercase tracking-widest text-white">
            <Grid className="h-4 w-4" /> Achievements
          </button>
          <button className="flex items-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <Bookmark className="h-4 w-4" /> Cookbook
          </button>
          <button className="flex items-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <ShieldCheck className="h-4 w-4" /> Security
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4 p-4">
          {badges.map((badge, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="aspect-square glass border-white/5 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center p-6 text-center space-y-4 hover:border-white/20 transition-all cursor-pointer group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`p-5 rounded-full bg-white/5 ${badge.color} group-hover:scale-110 transition-transform duration-500`}>
                <badge.icon className="h-8 w-8 md:h-12 md:w-12" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest leading-tight">{badge.name}</p>
                <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">Level 4 Master</p>
              </div>
            </motion.div>
          ))}
          
          <div className="aspect-square border border-dashed border-white/5 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center p-6 text-center space-y-4 opacity-30">
            <div className="p-5 rounded-full bg-white/5 text-muted-foreground">
              <Zap className="h-8 w-8 md:h-12 md:w-12" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Locked</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
