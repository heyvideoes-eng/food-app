'use client'

import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  User, 
  Refrigerator,
  Lock,
  Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Identity required to initialize node.')
      return
    }

    setIsLoading(true)
    
    // Simulate system initialization
    setTimeout(() => {
      localStorage.setItem('fridgemind_user', JSON.stringify({
        displayName: name.trim(),
        id: `node_${Date.now()}`,
        status: 'active'
      }))
      document.cookie = `demo-mode=true; path=/; max-age=86400`
      toast.success(`Welcome to the Grid, ${name.trim()}`)
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#050508]">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-primary/10 border border-primary/20 text-primary mb-4 animate-float">
            <Refrigerator className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-black text-white tracking-tight">Access Node</h1>
            <p className="text-white/40 text-sm font-light tracking-widest uppercase">FridgeMind Zero Neural Link</p>
          </div>
        </div>

        <form onSubmit={handleInitialize} className="space-y-6">
          <div className="relative group">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Identity Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-20 pl-16 pr-8 rounded-3xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all duration-500"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full h-20 rounded-3xl bg-white text-black font-black text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-6 w-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>Initialize Connection <ArrowRight className="h-5 w-5" /></>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-20">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Neural AI</span>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
