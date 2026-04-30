'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Refrigerator, Sparkles, ArrowRight, User } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function LoginPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter your name to continue')
      return
    }

    setLoading(true)

    try {
      // 1. Deterministic Identity (Email based on name)
      // This allows the user to resume their account by entering the same name
      const cleanName = name.trim().toLowerCase().replace(/\s+/g, '_')
      const dummyEmail = `${cleanName}@fridgemind.local`
      const dummyPassword = 'PermanentPassword123!' // Simple shared secret for demo-style persistence

      // Try to sign in first
      let { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword
      })

      // If sign in fails, try to sign up
      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
          options: {
            data: { display_name: name.trim() }
          }
        })
        
        if (signUpError) throw signUpError
        data = signUpData
      }
      
      if (!data.user) throw new Error('Auth failed')

      // 2. Setup user profile in local storage for UI
      const userData = {
        id: data.user.id,
        displayName: name.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
      }

      localStorage.setItem('fridgemind_user', JSON.stringify(userData))
      
      // 3. Set demo mode to false (we are using real persistence now)
      document.cookie = `demo-mode=false; path=/; max-age=86400`

      toast.success(`Welcome, ${mockUser.displayName}!`, {
        description: 'Your personal FridgeMind is ready.'
      })

      router.push('/')
      setTimeout(() => router.refresh(), 100)
    } catch (err: any) {
      console.error('Login Error:', err)
      toast.error('Secure access failed. Using offline mode.')
      
      // Fallback to old demo mode if Supabase fails
      const userId = `user_${Date.now()}`
      localStorage.setItem('fridgemind_user', JSON.stringify({ id: userId, displayName: name.trim() }))
      document.cookie = `demo-mode=true; path=/; max-age=86400`
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }
  const fadeUp: Variants = {
    hidden:  { opacity: 0, y: 20, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.21, 0.61, 0.35, 1] } }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden">
      {/* Ambient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm relative z-10"
      >
        {/* Icon */}
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Refrigerator className="w-10 h-10 text-primary" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-heading text-white tracking-tight">FridgeMind</h1>
          <p className="text-white/40 text-sm font-light">Your intelligent kitchen companion</p>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleAccess}
          className="space-y-4"
        >
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 pointer-events-none" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="w-full h-16 pl-12 pr-5 rounded-2xl bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.07] transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full h-16 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-white/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:scale-100 shadow-2xl shadow-white/10 tap-scale"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>Enter FridgeMind <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </motion.form>

        {/* Footer note */}
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <p className="text-[11px] text-white/20 font-bold uppercase tracking-widest">
            No account needed · Instant access
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
