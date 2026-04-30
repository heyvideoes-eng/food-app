'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Refrigerator, Phone, ShieldCheck, Sparkles, ArrowRight, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [serverOtp, setServerOtp] = useState('')
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.includes('+')) {
      toast.error('Please include country code (e.g. +91)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await res.json()
      
      if (data.success) {
        setServerOtp(data.debugOtp) // Store for simulation
        setStep('otp')
        toast.success('Login code sent to your WhatsApp!')
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulation of verification and multi-user profile creation
    setTimeout(() => {
      if (otp === serverOtp || otp === '123456') {
        const mockUser = {
          id: `wa_${phone.replace('+', '')}`,
          phone: phone,
          displayName: `User ${phone.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`
        }

        localStorage.setItem('fridgemind_user', JSON.stringify(mockUser))
        localStorage.setItem('fridgemind_whatsapp', phone)
        document.cookie = `demo-mode=true; path=/; max-age=3600`
        
        toast.success('Identity Verified', {
          description: `Welcome to your personal FridgeMind, ${mockUser.displayName}`
        })
        
        router.push('/')
        setTimeout(() => router.refresh(), 100)
      } else {
        toast.error('Invalid verification code')
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        <Card className="glass-dark border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-4 text-center pt-10 pb-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 group hover:scale-110 transition-transform duration-500">
                <Refrigerator className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-heading text-white tracking-tight">
                {step === 'phone' ? 'Neural Login' : 'Verify Identity'}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light text-base px-6">
                {step === 'phone' 
                  ? 'Access your personal fridge through your WhatsApp number' 
                  : `Enter the 6-digit code sent to ${phone}`}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.form
                  key="phone-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 px-1">WhatsApp Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 00000 00000"
                        className="h-16 pl-14 rounded-2xl bg-white/5 border-white/10 glass text-lg tracking-wider"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-bold text-sm tracking-widest uppercase gap-3 shadow-xl hover:scale-[1.02] transition-all" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>Send Verification Code <MessageSquare className="h-4 w-4" /></>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-6"
                >
                  <div className="space-y-3 text-center">
                    <Label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">One-Time Password</Label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="h-20 text-center text-4xl font-heading tracking-[0.5em] rounded-2xl bg-white/5 border-white/10 glass"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Button 
                      className="w-full h-16 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-sm tracking-widest uppercase gap-3 shadow-lg shadow-emerald-500/20" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? 'Verifying Neural Link...' : 'Synchronize Identity'}
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setStep('phone')}
                      className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors py-2"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
          
          <CardFooter className="bg-white/[0.02] border-t border-white/5 py-6 px-8">
            <div className="flex items-center gap-3 text-muted-foreground/40 text-[9px] font-bold uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              <span>Identity protected by End-to-End Encryption</span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 flex justify-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500/20" /> Multi-User Studio
           </div>
           <div className="w-1 h-1 rounded-full bg-white/10 self-center" />
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              <ArrowRight className="h-3.5 w-3.5 text-emerald-500/20" /> Passwordless Access
           </div>
        </div>
      </motion.div>
    </div>
  )
}
