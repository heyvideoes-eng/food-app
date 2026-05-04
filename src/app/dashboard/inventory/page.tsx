'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  Refrigerator,
  CheckCircle2,
  Trash2,
  Clock
} from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { ScannerModal } from '@/components/ScannerModal'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { differenceInDays, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { NeuralCache } from '@/lib/persistence'

const supabase = createClient()

export default function InventoryPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [localItems, setLocalItems] = useState<any[]>([])
  const queryClient = useQueryClient()

  useEffect(() => {
    setLocalItems(NeuralCache.getInventory())
  }, [])

  const { data: dbItems, isLoading } = useQuery({
    queryKey: ['fridge_items'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('fridge_items').select('*').order('expiry_date', { ascending: true })
        if (error) throw error
        return data || []
      } catch (err) {
        console.warn('DB restricted, using neural cache.')
        return []
      }
    }
  })

  const items = [...(dbItems || []), ...localItems].filter((v, i, a) => a.findIndex(t => (t.id === v.id || t.name === v.name)) === i)

  const handleAction = async (id: string, action: 'consume' | 'waste') => {
    // Update local first
    const updated = localItems.filter(item => item.id !== id)
    setLocalItems(updated)
    NeuralCache.saveInventory(updated)

    try {
      const response = await fetch('/api/fridge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, action })
      })
      if (response.ok) queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
    } catch (err) {
      console.warn('DB Action restricted.')
    }
    toast.success(`Node processed: ${action === 'consume' ? 'Saved' : 'Wasted'}`)
  }

  const getUrgency = (date: string) => {
    if (!date) return 'safe'
    const days = differenceInDays(parseISO(date), new Date())
    if (days < 0) return 'critical'
    if (days <= 3) return 'warning'
    return 'safe'
  }

  const filteredItems = items.filter((item: any) => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardShell>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-secondary text-[10px] tracking-[0.4em] uppercase font-bold opacity-60">
              <Layers className="h-3 w-3" /> Core Inventory
            </div>
            <h1 className="text-6xl font-heading font-black tracking-tight text-white">Neural <span className="text-secondary italic">Stock.</span></h1>
            <p className="text-white/40 font-light text-lg">Managing {items.length} tracked items across your node.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-16 pl-12 pr-6 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
             <button 
                onClick={() => setIsScannerOpen(true)}
                className="h-16 px-10 rounded-2xl bg-secondary text-white font-black text-xs tracking-[0.2em] uppercase flex items-center gap-3 shadow-2xl hover:scale-105 transition-all whitespace-nowrap"
             >
                <Plus className="h-5 w-5" /> Scan Item
             </button>
          </div>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 glass-card animate-pulse" />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <Refrigerator className="h-24 w-24 mb-8" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">No inventory nodes detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredItems.map((item: any, i: number) => {
                const urgency = getUrgency(item.expiry_date)
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                        urgency === 'critical' ? 'bg-rose-400/10 text-rose-400 border-rose-400/20' :
                        urgency === 'warning' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                        'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                      }`}>
                        {urgency === 'critical' ? 'Critical' : urgency === 'warning' ? 'Soon' : 'Safe'}
                      </div>
                      <div className="flex gap-2">
                         <button 
                            onClick={() => handleAction(item.id, 'consume')}
                            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/20 hover:text-primary transition-all"
                         >
                            <CheckCircle2 className="h-5 w-5" />
                         </button>
                         <button 
                            onClick={() => handleAction(item.id, 'waste')}
                            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/20 hover:text-rose-400 transition-all"
                         >
                            <Trash2 className="h-5 w-5" />
                         </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-10">
                      <h3 className="text-2xl font-heading font-bold text-white tracking-tight">{item.name}</h3>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{item.quantity} {item.unit} • {item.category || 'Standard'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-white/5">
                      <div className="flex items-center gap-2 text-white/40">
                        <Clock className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {item.expiry_date ? `Exp. in ${differenceInDays(parseISO(item.expiry_date), new Date())}d` : 'No date'}
                        </span>
                      </div>
                      <button className="w-10 h-10 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="h-4 w-4 text-white/20" />
                      </button>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      </div>
    </DashboardShell>
  )
}
