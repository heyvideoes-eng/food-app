'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Sparkles, 
  Check, 
  Trash2, 
  ShoppingCart, 
  Clock, 
  ArrowRight,
  Zap,
  RotateCcw,
  CheckCircle2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ShoppingListPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const isDemoMode = (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')) || !process.env.NEXT_PUBLIC_SUPABASE_URL

  const getLocalItems = () => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('fridgemind_local_shopping') || '[]')
  }

  const saveLocalItem = (item: any) => {
    if (typeof window === 'undefined') return
    const local = getLocalItems()
    localStorage.setItem('fridgemind_local_shopping', JSON.stringify([...local, { ...item, id: Date.now().toString() }]))
  }

  const [newItemName, setNewItemName] = useState('')
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['shopping_list_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  // We'll keep suggested as local mock or fetch from a special AI endpoint later
  const [suggested, setSuggested] = useState([
    { id: 3, name: 'Fresh Spinach', reason: 'Commonly bought', icon: Clock },
    { id: 4, name: 'Red Tomatoes', reason: 'For Pasta recipe', icon: ShoppingCart },
    { id: 5, name: 'Greek Yogurt', reason: 'Running low', icon: Zap },
  ])

  const toggleMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string, checked: boolean }) => {
      const newStatus = checked ? 'bought' : 'pending'
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping_list_items'] })
      toast.success('Status updated')
    },
    onError: () => {
      toast.error('Failed to update status')
    }
  })

  const addItemMutation = useMutation({
    mutationFn: async (name: string) => {
      const newItem = { name, status: 'pending', category: 'Other' }
      
      try {
        if (!isDemoMode) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { error } = await supabase
              .from('shopping_list_items')
              .insert([{ ...newItem, user_id: user.id }])
            if (!error) return
          }
        }
        
        saveLocalItem(newItem)
      } catch (err) {
        console.warn('Add item failed, saving locally:', err)
        saveLocalItem(newItem)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping_list_items'] })
      setNewItemName('')
      toast.success('Item added to list')
    },
    onError: () => {
      toast.error('Failed to add item')
    }
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const boughtItems = (items as any[]).filter(i => i.status === 'bought')
      if (boughtItems.length === 0) return

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      // 1. Insert into fridge_items
      const fridgeData = boughtItems.map(item => ({
        name: item.name,
        quantity: item.qty || 1,
        unit: 'pcs',
        category: item.category || 'Other',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: authUser.id
      }))

      const { error: insertError } = await supabase.from('fridge_items').insert(fridgeData)
      if (insertError) throw insertError

      // 2. Delete from shopping_list_items
      const { error: deleteError } = await supabase
        .from('shopping_list_items')
        .delete()
        .in('id', boughtItems.map(i => i.id))
      
      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping_list_items'] })
      queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
      toast.success('Inventory synced with your fridge!', {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      })
    },
    onError: () => toast.error('Failed to sync. Please try again.')
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        const local = getLocalItems()
        const updated = local.filter((i: any) => i.id !== id)
        localStorage.setItem('fridgemind_local_shopping', JSON.stringify(updated))
        return
      }
      const { error } = await supabase.from('shopping_list_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping_list_items'] })
      toast.success('Item removed')
    }
  })

  const toggleItem = (id: string, currentStatus: string) => {
    toggleMutation.mutate({ id, checked: currentStatus === 'pending' })
  }

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return
    addItemMutation.mutate(newItemName)
  }

  const acceptSuggestion = (id: number) => {
    const item = suggested.find(i => i.id === id)
    if (item) {
      addItemMutation.mutate(item.name)
      setSuggested(suggested.filter(i => i.id !== id))
    }
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
            Smart Restock
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-white leading-none">Grocery List</h1>
          <p className="text-muted-foreground text-lg">
            AI-predicted needs and your personal pantry essentials.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 h-12 px-6 font-bold gap-2 text-muted-foreground hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Clear Checked
          </Button>
          {(items as any[]).some((i: any) => i.status === 'bought') && (
            <Button 
              className="rounded-2xl h-12 px-6 font-bold gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RotateCcw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              {syncMutation.isPending ? 'Syncing...' : 'Sync to Fridge'}
            </Button>
          )}
        </div>
      </div>

      {/* AI Smart Suggestions */}
      {suggested.length > 0 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 px-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/80">Smart Suggestions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggested.map(item => (
              <Card key={item.id} className="bg-[#161821] border-white/5 group hover:border-primary/20 transition-all rounded-[28px] overflow-hidden shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                       <item.icon className="h-5 w-5" />
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => acceptSuggestion(item.id)}
                      className="h-10 w-10 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-tight">{item.name}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{item.reason}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary/30" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/80">Current Needs</h2>
        </div>
        
        <div className="grid gap-3">
          {(items as any[]).map((item: any) => {
            const isBought = item.status === 'bought'
            return (
              <div 
                key={item.id} 
                className={`group flex items-center justify-between p-5 rounded-[28px] border transition-all duration-300 ${
                  isBought 
                    ? 'bg-white/[0.02] border-white/5 opacity-40 grayscale' 
                    : 'bg-[#161821] border-white/5 hover:border-white/10 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div 
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isBought 
                        ? 'bg-primary border-primary' 
                        : 'border-white/10 bg-white/5 hover:border-primary/50'
                    }`}
                    onClick={() => toggleItem(item.id, item.status)}
                  >
                    {isBought && <Check className="h-4 w-4 text-primary-foreground stroke-[4]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-[17px] tracking-tight ${isBought ? 'line-through text-muted-foreground' : 'text-white'}`}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] text-muted-foreground/60 font-medium">{item.qty || '1'} • {item.category}</span>
                       {item.auto_suggested && <Sparkles className="h-3 w-3 text-primary opacity-60" />}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-all"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    disabled={deleteItemMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
          
          {items.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center mx-auto border border-dashed border-white/10">
                 <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium">Your list is empty. Add something below!</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Bar */}
      <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
        <form 
          onSubmit={addItem} 
          className="bg-[#1a1c26]/80 backdrop-blur-2xl p-2 rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-2 group focus-within:border-primary/50 transition-all"
        >
          <Input 
            placeholder="I need to buy..." 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white text-base h-14 px-6 placeholder:text-muted-foreground/30"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-all"
            disabled={!newItemName.trim()}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </form>
        <div className="flex justify-center mt-3">
           <Badge variant="outline" className="bg-black/40 border-white/5 text-[9px] text-muted-foreground/60 uppercase tracking-widest px-3 py-1 backdrop-blur-md rounded-full">
              Press Enter to add to list
           </Badge>
        </div>
      </div>
    </div>
  )
}
