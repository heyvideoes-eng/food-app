'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Upload, 
  Barcode, 
  Camera, 
  CheckCircle2,
  X
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'

export function AddItemModal() {
  const { isAddModalOpen, setIsAddModalOpen } = useStore()
  const [addStep, setAddStep] = useState<'method' | 'details'>('method')
  const [isScanning, setIsScanning] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'Vegetables',
    expiry_date: new Date().toISOString().split('T')[0],
    storage_area: 'Fridge'
  })

  const supabase = createClient()
  const queryClient = useQueryClient()
  const isDemoMode = (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')) || !process.env.NEXT_PUBLIC_SUPABASE_URL

  const addMutation = useMutation({
    mutationFn: async (newItemData: any) => {
      if (isDemoMode) {
        const saved = localStorage.getItem('fridgemind_local_items')
        const items = saved ? JSON.parse(saved) : []
        const itemWithId = { ...newItemData, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }
        localStorage.setItem('fridgemind_local_items', JSON.stringify([...items, itemWithId]))
        return itemWithId
      }

      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('fridge_items').insert([{ ...newItemData, user_id: user?.id }]).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
      toast.success('Item added to fridge!')
      setIsAddModalOpen(false)
      setAddStep('method')
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'pcs',
        category: 'Vegetables',
        expiry_date: new Date().toISOString().split('T')[0],
        storage_area: 'Fridge'
      })
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
        setIsAddModalOpen(false)
      }
    } catch (err) {
      console.error('Upload Error:', err)
      toast.error('Scan failed. Please try a clearer image.', { id: loader })
      setIsScanning(false)
    }
  }

  return (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0b] border-white/10 p-0 overflow-hidden glass-dark rounded-[2.5rem]">
        <div className="p-10">
          <DialogHeader className="mb-10 flex flex-row items-center justify-between">
            <DialogTitle className="text-3xl font-heading text-white tracking-tight">
              {addStep === 'method' ? 'Addition Method' : 'Item Specifications'}
            </DialogTitle>
          </DialogHeader>

          {addStep === 'method' ? (
              <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="file" 
                    id="receipt-upload-global" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                  {[
                    { id: 'quick', name: 'Quick Add', sub: 'Manual entry', icon: Plus, color: 'text-primary' },
                    { id: 'barcode', name: 'Barcode', sub: 'Scan package', icon: Barcode, color: 'text-cyan-400' },
                    { id: 'receipt', name: 'Receipt', sub: 'AI extraction', icon: Upload, color: 'text-violet-400' },
                    { id: 'photo', name: 'Photo', sub: 'Visual scan', icon: Camera, color: 'text-amber-400' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      disabled={isScanning}
                      onClick={() => {
                        if (method.id === 'quick') {
                          setAddStep('details')
                        } else {
                          document.getElementById('receipt-upload-global')?.click()
                        }
                      }}
                      className="flex flex-col items-center justify-center p-8 rounded-[2rem] glass border-white/5 hover:border-white/20 transition-all group disabled:opacity-50"
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 bg-white/5 ${method.color}`}>
                        {isScanning && (method.id === 'receipt' || method.id === 'photo') ? (
                          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <method.icon className="h-8 w-8" />
                        )}
                      </div>
                      <div className="font-bold text-white text-sm tracking-widest uppercase">{method.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-2 tracking-widest uppercase opacity-40">{method.sub}</div>
                    </button>
                  ))}
              </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">Item Designation</label>
                  <Input 
                    placeholder="e.g. Organic Milk" 
                    className="h-16 rounded-2xl bg-white/5 border-white/10 glass" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">Quantity</label>
                    <Input 
                      type="number"
                      className="h-16 rounded-2xl bg-white/5 border-white/10 glass" 
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">Unit</label>
                    <Input 
                      placeholder="pcs" 
                      className="h-16 rounded-2xl bg-white/5 border-white/10 glass" 
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">Expiry Threshold</label>
                  <Input 
                    type="date" 
                    className="h-16 rounded-2xl bg-white/5 border-white/10 glass" 
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-bold tracking-widest uppercase text-xs" onClick={() => setAddStep('method')}>Abort</Button>
                <Button 
                  className="h-16 flex-1 rounded-2xl font-bold bg-white text-black hover:bg-white/90 gap-3 tracking-widest uppercase text-xs" 
                  onClick={() => addMutation.mutate(newItem)}
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? 'Processing...' : 'Confirm'} <CheckCircle2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
