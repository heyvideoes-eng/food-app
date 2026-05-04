'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Plus, 
  Check, 
  Trash2, 
  RotateCcw,
  Sparkles,
  Zap,
  ShoppingCart,
  Loader2
} from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { NeuralCache } from '@/lib/persistence'

const supabase = createClient()

export default function MarketsPage() {
  const queryClient = useQueryClient()
  const [isPredicting, setIsPredicting] = useState(false)
  const [localItems, setLocalItems] = useState<any[]>([])

  useEffect(() => {
    setLocalItems(NeuralCache.getShopping())
  }, [])

  const { data: dbItems, isLoading } = useQuery({
    queryKey: ['shopping_items'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('shopping_list_items').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      } catch (err) {
        console.warn('DB restricted, using neural cache.')
        return []
      }
    }
  })

  // Combine DB items with local cache for a seamless experience
  const items = [...(dbItems || []), ...localItems].filter((v, i, a) => a.findIndex(t => (t.id === v.id || t.name === v.name)) === i)

  const handleAddItem = async (name?: string) => {
    const itemName = name || prompt('Enter item name:')
    if (!itemName) return
    
    const newItem = {
      id: `local_${Date.now()}`,
      name: itemName,
      quantity: '1 unit',
      status: 'pending',
      category: 'Manual'
    }

    // Try DB
    try {
      await supabase.from('shopping_list_items').insert([newItem])
      queryClient.invalidateQueries({ queryKey: ['shopping_items'] })
    } catch (err) {
      console.warn('DB Write restricted.')
    }

    // Always update cache
    const updated = [newItem, ...localItems]
    setLocalItems(updated)
    NeuralCache.saveShopping(updated)
    toast.success(`Node added: ${itemName}`)
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'bought' : 'pending'
    
    // Update local state first for instant feedback
    const updated = items.map(item => item.id === id ? { ...item, status: newStatus } : item)
    setLocalItems(updated.filter(i => i.id.toString().startsWith('local')))
    NeuralCache.saveShopping(updated.filter(i => i.id.toString().startsWith('local')))

    try {
      await supabase.from('shopping_list_items').update({ status: newStatus }).eq('id', id)
      queryClient.invalidateQueries({ queryKey: ['shopping_items'] })
    } catch (err) {
      console.warn('DB Update restricted.')
    }
  }

  const handleDelete = async (id: string) => {
    const updated = localItems.filter(item => item.id !== id)
    setLocalItems(updated)
    NeuralCache.saveShopping(updated)

    try {
      await supabase.from('shopping_list_items').delete().eq('id', id)
      queryClient.invalidateQueries({ queryKey: ['shopping_items'] })
    } catch (err) {
      console.warn('DB Delete restricted.')
    }
    toast.success('Identity removed.')
  }

  const handleReset = async () => {
    setLocalItems([])
    NeuralCache.saveShopping([])
    try {
      await supabase.from('shopping_list_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      queryClient.invalidateQueries({ queryKey: ['shopping_items'] })
    } catch (err) {
       console.warn('DB Reset restricted.')
    }
    toast.success('Pipeline Reset.')
  }

  const handlePrediction = async () => {
    setIsPredicting(true)
    const loader = toast.loading('Neural networks predicting restock requirements...')
    
    try {
      const response = await fetch('/api/ai/shopping', { method: 'POST' })
      if (!response.ok) throw new Error('Prediction failed')
      const data = await response.json()
      
      data.suggestions.forEach((s: any) => handleAddItem(s.name))
      toast.success(`Success: Suggestions synthesized.`, { id: loader })
    } catch (err) {
      toast.error('Prediction failed. Node offline.', { id: loader })
    } finally {
      setIsPredicting(false)
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary text-[10px] tracking-[0.4em] uppercase font-bold opacity-60">
              <ShoppingBag className="h-3 w-3" /> Supply Pipeline
            </div>
            <h1 className="text-6xl font-heading font-black tracking-tight text-white">Smart <span className="text-primary italic">Markets.</span></h1>
            <p className="text-white/40 font-light text-lg">Predicted restocks and manual essential nodes.</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={handleReset}
              className="h-16 px-8 rounded-2xl glass border-white/5 text-rose-400/50 hover:text-rose-400 transition-all uppercase text-[10px] font-black tracking-widest flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Reset List
            </button>
          </div>
        </div>

        <div className="space-y-4">
           {isLoading ? (
             [1,2,3].map(i => <div key={i} className="h-24 glass-card animate-pulse" />)
           ) : items.length === 0 ? (
             <div className="py-20 text-center opacity-10">
                <ShoppingCart className="h-20 w-20 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Pipeline Empty</p>
             </div>
           ) : (
             items.map((item: any, i: number) => (
               <motion.div
                 key={item.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className={`glass-card !p-6 flex items-center justify-between group transition-all duration-500 ${
                   item.status === 'bought' ? 'opacity-30' : ''
                 }`}
               >
                 <div className="flex items-center gap-8">
                    <button 
                      onClick={() => handleToggle(item.id, item.status)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                        item.status === 'bought' ? 'bg-primary border-primary' : 'border-white/10 hover:border-primary/50'
                      }`}
                    >
                      {item.status === 'bought' && <Check className="h-5 w-5 text-black" />}
                    </button>
                    
                    <div className="flex flex-col">
                      <span className={`text-lg font-bold tracking-tight text-white ${item.status === 'bought' ? 'line-through' : ''}`}>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-white/20 uppercase tracking-widest font-black">{item.quantity}</span>
                         {item.category === 'Predicted' && (
                           <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                             <Sparkles className="h-2.5 w-2.5" /> Neural Auto
                           </div>
                         )}
                      </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="w-12 h-12 rounded-xl glass flex items-center justify-center text-white/20 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                 </div>
               </motion.div>
             ))
           )}

           <div className="pt-8 flex justify-center">
              <button 
                type="button"
                onClick={() => handleAddItem()}
                className="h-20 w-full max-w-md rounded-3xl glass border-dashed border-white/10 text-white/20 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-4 uppercase text-[10px] font-black tracking-[0.3em]"
              >
                 <Plus className="h-6 w-6" /> Add Manual Node
              </button>
           </div>
        </div>

        <div className="glass-card bg-primary/5 border-primary/20 !p-12 overflow-hidden relative">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                 <h3 className="text-2xl font-heading font-black text-white">Prediction Intelligence</h3>
                 <p className="text-white/40 font-light max-w-md leading-relaxed">
                    Synthesize your next grocery run based on consumption telemetry and inventory expiry logs.
                 </p>
              </div>
              <button 
                onClick={handlePrediction}
                disabled={isPredicting}
                className="h-16 px-10 rounded-2xl bg-primary text-black font-black text-xs tracking-[0.2em] uppercase flex items-center gap-3 shadow-2xl hover:scale-105 transition-all whitespace-nowrap disabled:opacity-50"
              >
                 {isPredicting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                 Accept Prediction
              </button>
           </div>
           <ShoppingCart className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5" />
        </div>
      </div>
    </DashboardShell>
  )
}
