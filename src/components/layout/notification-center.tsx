'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  X,
  ArrowRight,
  Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { differenceInDays, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchExpiryAlerts() {
      const { data: items } = await supabase
        .from('fridge_items')
        .select('*')
        .order('expiry_date', { ascending: true })

      if (items) {
        const alerts = items.filter(item => {
          const days = differenceInDays(parseISO(item.expiry_date), new Date())
          return days <= 3 // Expired or expiring in 3 days
        }).map(item => {
          const days = differenceInDays(parseISO(item.expiry_date), new Date())
          return {
            id: item.id,
            title: item.name,
            message: days < 0 ? `Expired ${Math.abs(days)} days ago` : `Expiring in ${days} days`,
            type: days < 0 ? 'critical' : 'warning',
            date: item.expiry_date
          }
        })
        setNotifications(alerts)
      } else {
        // Fallback to local storage if supabase fails
        const saved = localStorage.getItem('fridgemind_local_items')
        if (saved) {
          const localItems = JSON.parse(saved)
          const alerts = localItems.filter((item: any) => {
            const days = differenceInDays(parseISO(item.expiry_date), new Date())
            return days <= 3
          }).map((item: any) => {
            const days = differenceInDays(parseISO(item.expiry_date), new Date())
            return {
              id: item.id,
              title: item.name,
              message: days < 0 ? `Expired ${Math.abs(days)} days ago` : `Expiring in ${days} days`,
              type: days < 0 ? 'critical' : 'warning',
              date: item.expiry_date
            }
          })
          setNotifications(alerts)
        }
      }
    }

    fetchExpiryAlerts()
  }, [])

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`relative rounded-2xl w-11 h-11 transition-all ${isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-muted-foreground hover:text-white'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-black animate-pulse" />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 glass-dark border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h3 className="font-heading text-lg text-white tracking-tight">Intelligence Briefing</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Real-time Sync Active</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Dialog>
                    <DialogTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white">
                        <Plus className="h-4 w-4 rotate-45" />
                      </Button>
                    } />
                    <DialogContent className="glass-dark border-white/10 p-8 rounded-[2rem] sm:max-w-md">
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <h3 className="text-xl font-heading text-white">Alert Destinations</h3>
                           <p className="text-xs text-muted-foreground leading-relaxed">Enter your mobile number to receive live expiry briefings on WhatsApp.</p>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-primary px-1">WhatsApp Number</label>
                              <Input 
                                placeholder="e.g. +918429435878" 
                                value={useStore.getState().whatsappNumber}
                                onChange={(e) => useStore.getState().setWhatsappNumber(e.target.value)}
                                className="h-14 rounded-2xl bg-white/5 border-white/10 glass text-white"
                              />
                           </div>
                           <Button className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-bold tracking-widest uppercase text-xs" onClick={() => toast.success('Alert settings saved!')}>
                              Synchronize Device
                           </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-1">WhatsApp</span>
                    <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative cursor-pointer border border-emerald-500/30" onClick={() => toast.success('WhatsApp Alerts Synchronized!')}>
                      <div className="absolute right-0.5 top-0.5 w-3 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar p-2">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-20" />
                    </div>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      All systems nominal. No immediate expiration threats detected in your inventory.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        className="group p-4 rounded-[1.5rem] hover:bg-white/5 transition-all flex gap-4 items-start"
                      >
                        <div className={`mt-1 p-2 rounded-xl bg-white/5 ${n.type === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-white leading-none">{n.title}</h4>
                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest opacity-40">Today</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-light leading-relaxed">
                            {n.message}. Action required to prevent waste.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground opacity-30" />
                            <span className="text-[10px] text-muted-foreground/40 font-medium">Exp: {n.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-6">
                       <Button 
                        onClick={async () => {
                          const loader = toast.loading('Generating WhatsApp Briefing...')
                          try {
                            const message = notifications.map(n => `⚠️ ${n.title}: ${n.message}`).join('\n')
                            const userNumber = useStore.getState().whatsappNumber
                            await fetch('/api/notifications/whatsapp', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                message: message || 'All systems nominal. Your fridge is healthy!',
                                to: userNumber
                              })
                            })
                            toast.success('Briefing sent to WhatsApp!', { id: loader })
                          } catch (e) {
                            toast.error('Failed to send briefing.', { id: loader })
                          }
                        }}
                        className="w-full h-12 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest gap-2"
                       >
                         Send Status to WhatsApp
                       </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <Link 
                  href="/fridge" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-2xl bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-all"
                >
                  Manage Full Inventory
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
