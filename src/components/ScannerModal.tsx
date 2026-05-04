'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { NeuralCache } from '@/lib/persistence'
import { addDays } from 'date-fns'

export function ScannerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isScanning, setIsScanning] = useState(false)
  const queryClient = useQueryClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    const loader = toast.loading('Neural models analyzing receipt...', {
      style: { background: '#050508', border: '1px solid rgba(193, 255, 114, 0.2)', color: '#fff' }
    })

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

        // Update Neural Cache
        const currentInventory = NeuralCache.getInventory()
        const newItems = result.items.map((item: any) => ({
          ...item,
          id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          expiry_date: addDays(new Date(), item.estimated_expiry_days).toISOString().split('T')[0]
        }))
        
        NeuralCache.saveInventory([...newItems, ...currentInventory])

        toast.success(`Node Updated: Extracted ${result.items?.length} items.`, { id: loader })
        queryClient.invalidateQueries({ queryKey: ['fridge_items'] })
        setIsScanning(false)
        onClose()
      }
    } catch (err) {
      console.error('Upload Error:', err)
      toast.error('Scan failed. Please check connection.', { id: loader })
      setIsScanning(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050508]/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl glass-card relative z-10 !p-12 overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>

            <div className="text-center space-y-4 mb-12">
               <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center animate-float">
                  <Camera className="h-10 w-10" />
               </div>
               <h2 className="text-4xl font-heading font-black text-white">Neural Scan</h2>
               <p className="text-white/40 font-light">Upload a receipt or snap a photo to auto-populate your node.</p>
            </div>

            <div className="space-y-6">
               <label className="group relative block w-full aspect-video rounded-[2.5rem] border-2 border-dashed border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer overflow-hidden">
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={isScanning} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                     <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                        {isScanning ? (
                           <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : (
                           <Upload className="h-8 w-8" />
                        )}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-white transition-all">
                        {isScanning ? 'Processing Grid...' : 'Deploy Data Link'}
                     </span>
                  </div>
               </label>

               <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI powered extraction enabled
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
