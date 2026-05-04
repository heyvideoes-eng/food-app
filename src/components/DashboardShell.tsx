'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Refrigerator, 
  ChefHat, 
  ShoppingBag, 
  LogOut,
  Bell,
  Search,
  User,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const sidebarItems = [
  { name: 'System', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Inventory', icon: Refrigerator, href: '/dashboard/inventory' },
  { name: 'Studio', icon: ChefHat, href: '/dashboard/studio' },
  { name: 'Markets', icon: ShoppingBag, href: '/dashboard/markets' },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('Identity Alpha')

  useEffect(() => {
    const user = localStorage.getItem('fridgemind_user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        if (parsed.displayName) setUserName(parsed.displayName)
      } catch (e) {
        console.error('Identity fetch failed')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('fridgemind_user')
    document.cookie = "demo-mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    toast.success('Connection Terminated.')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#050508] flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 flex flex-col p-10 fixed h-full z-50 bg-[#050508]/80 backdrop-blur-3xl">
        <div className="flex items-center gap-4 mb-20 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-transform group-hover:scale-110 duration-500">
            <Refrigerator className="h-6 w-6 text-black" />
          </div>
          <span className="font-heading font-black text-xl tracking-tighter text-white uppercase">
            FRIDGEMIND<span className="text-primary italic">.ZERO</span>
          </span>
        </div>

        <nav className="flex-1 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 px-4">Core Modules</p>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-5 px-7 py-5 rounded-[2rem] transition-all duration-500 ${
                  isActive 
                    ? 'bg-primary text-black shadow-[0_20px_40px_rgba(var(--primary),0.2)] scale-[1.02]' 
                    : 'text-white/30 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-black' : 'group-hover:text-primary transition-colors duration-500'}`} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-black/40" 
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 space-y-8">
          <div className="flex items-center gap-5 px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-transparent border border-secondary/30 flex items-center justify-center text-secondary shadow-2xl">
              <User className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white truncate max-w-[140px] tracking-tight">{userName}</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Neural Link Active</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-5 px-7 py-5 rounded-[2rem] text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-500 w-full border border-transparent hover:border-rose-500/10"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Terminate Link</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 min-h-screen">
        <header className="h-28 border-b border-white/5 flex items-center justify-between px-16 sticky top-0 z-40 bg-[#050508]/60 backdrop-blur-2xl">
          <div className="flex items-center gap-5 bg-white/5 border border-white/10 px-8 h-14 rounded-2xl w-[450px] group focus-within:border-primary/40 focus-within:bg-white/[0.08] transition-all duration-500">
            <Search className="h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Query neural network..." 
              className="bg-transparent border-none focus:outline-none text-xs text-white placeholder:text-white/10 w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Node: Delta-7</span>
            </div>
            
            <button className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all duration-500 relative group">
              <Bell className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-secondary rounded-full border-[3px] border-[#050508] shadow-lg" />
            </button>
            
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-black shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform cursor-pointer">
              <Zap className="h-7 w-7" />
            </div>
          </div>
        </header>

        <div className="p-16 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
