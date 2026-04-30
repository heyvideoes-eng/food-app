'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Search, 
  Plus, 
  Upload, 
  Barcode, 
  Calendar, 
  Refrigerator, 
  MoreVertical,
  CheckCircle2,
  Trash2,
  ChefHat,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { differenceInDays, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'

const supabase = createClient()

export default function FridgePage() {
  const [search, setSearch] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const { selectedIngredientIds, toggleSelectedIngredient } = useStore()
  const queryClient = useQueryClient()
  const isDemoMode = (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')) || !process.env.NEXT_PUBLIC_SUPABASE_URL
  
  // Local Storage Fallback Logic
  const getLocalStorageItems = () => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('fridgemind_local_items')
    return saved ? JSON.parse(saved) : []
  }

  const saveLocalStorageItem = (item: any) => {
    const items = getLocalStorageItems()
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }
    localStorage.setItem('fridgemind_local_items', JSON.stringify([...items, newItem]))
    return newItem
  }

  const { data: realItems, isLoading: isQueryLoading } = useQuery({
    queryKey: ['fridge_items'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('fridge_items')
          .select('*')
          .order('expiry_date', { ascending: true })
        if (error) throw error
        return data || []
      } catch (err) {
        console.warn('Supabase fetch failed, using local storage fallback:', err)
        return getLocalStorageItems()
      }
    }
  })

  const mockItems = [
    { id: '1', name: 'Whole Milk', category: 'Dairy', quantity: 1, unit: 'L', expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), storage_area: 'Fridge' },
    { id: '2', name: 'Fresh Spinach', category: 'Vegetables', quantity: 250, unit: 'g', expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), storage_area: 'Fridge' },
    { id: '3', name: 'Greek Yogurt', category: 'Dairy', quantity: 500, unit: 'g', expiry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), storage_area: 'Fridge' },
  ]

  const items = (realItems && realItems.length > 0) ? realItems : (isDemoMode ? mockItems : getLocalStorageItems())
  const isLoading = isQueryLoading && !isDemoMode && items.length === 0

  const getUrgency = (date: string) => {
    if (!date) return 'safe'
    const days = differenceInDays(parseISO(date), new Date())
    if (days < 0) return 'expired'
    if (days <= 3) return 'soon'
    return 'safe'
  }

  const urgencyConfig = {
    expired: { label: 'Expired', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
    soon: { label: 'Expiring Soon', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    safe: { label: 'Safe', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  }

  const groupedItems = useMemo(() => {
    const filtered = (items as any[])?.filter((item: any) => 
      item.name.toLowerCase().includes(search.toLowerCase())
    ) || []

    return {
      expired: filtered.filter(item => getUrgency(item.expiry_date) === 'expired'),
      soon: filtered.filter(item => getUrgency(item.expiry_date) === 'soon'),
      safe: filtered.filter(item => getUrgency(item.expiry_date) === 'safe'),
    }
  }, [items, search])

  const itemActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'consume' | 'waste' }) => {
      const savedUser = localStorage.getItem('fridgemind_user')
      const user = savedUser ? JSON.parse(savedUser) : null
      
      try {
        if (isDemoMode) {
          const localItems = getLocalStorageItems()
          localStorage.setItem('fridgemind_local_items', JSON.stringify(localItems.filter((i: any) => i.id !== id)))
          return { success: true, message: action === 'consume' ? 'Demo: +25 Points!' : 'Demo: Waste logged.' }
        }

        const response = await fetch('/api/fridge/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: id, action, userId: user?.id })
        })
        
        if (!response.ok) throw new Error('Action failed')
        return response.json()
      } catch (err) {
        console.error('Action failed, falling back to basic delete:', err)
        const localItems = getLocalStorageItems()
        localStorage.setItem('fridgemind_local_items', JSON.stringify(localItems.filter((i: any) => i.id !== id)))
        return { success: true, message: 'Updated locally.' }
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
      queryClient.invalidateQueries({ queryKey: ['waste_events'] })
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
      toast.success(data?.message || 'Update successful')
    }
  })

  // Basic delete mutation kept for simple UI deletions if needed
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        if (isDemoMode) {
          const localItems = getLocalStorageItems()
          localStorage.setItem('fridgemind_local_items', JSON.stringify(localItems.filter((i: any) => i.id !== id)))
          return
        }
        const { error } = await supabase.from('fridge_items').delete().eq('id', id)
        if (error) throw error
      } catch (err) {
        const localItems = getLocalStorageItems()
        localStorage.setItem('fridgemind_local_items', JSON.stringify(localItems.filter((i: any) => i.id !== id)))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
      toast.success('Item removed')
    }
  })

  const addMutation = useMutation({
    mutationFn: async (newItemData: any) => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase.from('fridge_items').insert([{ ...newItemData, user_id: user?.id }]).select()
        if (error) throw error
        return data
      } catch (err) {
        console.error('Supabase failed, saving to local storage:', err)
        return saveLocalStorageItem(newItemData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
      toast.success('Item added to fridge!')
      useStore.getState().setIsAddModalOpen(false)
    },
    onError: (err) => {
      toast.error('Failed to add item. Using local backup.')
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    const loader = toast.loading('Gemini is analyzing your receipt...', { className: 'glass-dark border-primary/20' })

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64 = reader.result as string
        const response = await fetch('/api/ai/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: base64 })
        })

        if (!response.ok) throw new Error('Vision analysis failed')
        const result = await response.json()

        toast.success(`Success! Extracted ${result.items?.length} items.`, { id: loader })
        queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
        setIsScanning(false)
        useStore.getState().setIsAddModalOpen(false)
      }
    } catch (err) {
      console.error('Upload Error:', err)
      toast.error('Scan failed. Please try a clearer image.', { id: loader })
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary text-[10px] tracking-[0.3em] uppercase font-bold mb-4"
          >
            <Layers className="h-4 w-4" /> Inventory Management
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-heading tracking-tight text-white"
          >
            Smart Fridge
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-4 text-lg font-light"
          >
            {items?.length || 0} items tracked across all storage areas.
          </motion.p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
            <Input 
              placeholder="Search inventory..." 
              className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/20 glass transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={() => useStore.getState().setIsAddModalOpen(true)}
            className="h-14 px-8 rounded-2xl glass border-white/10 hover:bg-white/10 text-white gap-3 font-bold tracking-widest uppercase text-xs"
          >
            <Plus className="h-5 w-5" /> Add Item
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 glass rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-8">
          <div className="w-32 h-32 rounded-[3rem] glass flex items-center justify-center">
            <Refrigerator className="h-16 w-16 text-white opacity-20" />
          </div>
          <div className="space-y-4 max-w-md">
            <h3 className="text-3xl font-heading text-white">System Inactive</h3>
            <p className="text-muted-foreground font-light leading-relaxed">Initialize your inventory to begin real-time expiry tracking and AI-driven insights.</p>
          </div>
          <Button onClick={() => useStore.getState().setIsAddModalOpen(true)} className="h-16 px-10 rounded-2xl glass border-white/10 hover:bg-white/5 text-white font-bold tracking-[0.2em] uppercase text-xs">
             Initialize First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-24">
          {(Object.keys(groupedItems) as Array<keyof typeof groupedItems>).map((urgency) => {
            const list = groupedItems[urgency]
            if (list.length === 0) return null
            const config = urgencyConfig[urgency]

            return (
              <div key={urgency} className="space-y-8">
                <div className="flex items-center gap-6 px-2">
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">
                    {config.label} <span className="ml-4 opacity-20 text-[10px] font-medium tracking-normal">[{list.length} units]</span>
                  </h2>
                  <div className="flex-1 h-[1px] bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence>
                    {list.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <Card className={`group overflow-hidden glass transition-all duration-500 rounded-[2.5rem] ${
                          selectedIngredientIds.includes(item.id) 
                            ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]' 
                            : 'border-white/5 hover:border-white/20'
                        }`}>
                          <CardContent className="p-8 relative">
                            <div className="flex justify-between items-start mb-8">
                              <div className={`p-4 rounded-2xl bg-white/5 ${config.color}`}>
                                <Refrigerator className="h-8 w-8" />
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-white/20">Status</p>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                                  {urgency}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 mb-10">
                              <h3 className="font-heading text-2xl text-white tracking-tight">{item.name}</h3>
                              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                <span className="text-white/40">{item.quantity} {item.unit}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-white/40">{item.category || 'Standard'}</span>
                              </div>
                            </div>

                             <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/5 pt-8">
                               <div className="flex flex-col min-w-[100px]">
                                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-30">Timeline</span>
                                 <div className="flex items-center gap-2">
                                   <Calendar className={`h-4 w-4 ${config.color} opacity-50`} />
                                   <span className={`text-xs font-bold tracking-tight ${config.color}`}>
                                     {differenceInDays(parseISO(item.expiry_date), new Date()) < 0 
                                       ? `Expired ${Math.abs(differenceInDays(parseISO(item.expiry_date), new Date()))}d`
                                       : `Exp. in ${differenceInDays(parseISO(item.expiry_date), new Date())}d`}
                                   </span>
                                 </div>
                               </div>
                               
                               <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => itemActionMutation.mutate({ id: item.id, action: 'consume' })}
                                   className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl glass border-white/5 transition-all ${
                                     selectedIngredientIds.includes(item.id)
                                       ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                       : 'hover:bg-emerald-500/10 hover:text-emerald-400'
                                   }`}
                                   disabled={itemActionMutation.isPending}
                                 >
                                   <CheckCircle2 className="h-5 w-5" />
                                 </Button>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl glass border-white/5 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                                   onClick={() => itemActionMutation.mutate({ id: item.id, action: 'waste' })}
                                   disabled={itemActionMutation.isPending}
                                 >
                                   <Trash2 className="h-5 w-5" />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl glass border-white/5 hover:bg-white/10 hover:text-white transition-all">
                                   <MoreVertical className="h-5 w-5" />
                                 </Button>
                               </div>
                             </div>
                            
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 pointer-events-none">
                              <ArrowRight className="h-5 w-5 text-white/20" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
