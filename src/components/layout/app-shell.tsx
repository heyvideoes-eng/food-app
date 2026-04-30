'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Refrigerator, 
  ChefHat, 
  Trash2, 
  ShoppingCart, 
  MessageCircleHeart, 
  Award,
  LogOut,
  Search,
  Bell,
  User,
  Plus,
  Flame
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationCenter } from './notification-center'
import { AddItemModal } from '../modals/add-item-modal'
import { useStore } from '@/lib/store'

const navItems = [
  { name: 'Home', href: '/', icon: Home, status: '' },
  { name: 'Fridge', href: '/fridge', icon: Refrigerator, status: '3 expiring' },
  { name: 'Nutrition', href: '/nutrition', icon: MessageCircleHeart, status: '' },
  { name: 'Recipes', href: '/recipes', icon: ChefHat, status: '' },
  { name: 'Waste', href: '/waste', icon: Trash2, status: '' },
  { name: 'Shop', href: '/shopping', icon: ShoppingCart, status: '' },
  { name: 'Rewards', href: '/rewards', icon: Award, status: '+15 pts today' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchFocused, setSearchFocused] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const { setIsAddModalOpen } = useStore()
  
  const isLandingPage = pathname === '/'
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    const savedUser = localStorage.getItem('fridgemind_user')
    if (!savedUser && !isLoginPage && !isLandingPage) {
      router.push('/login')
    } else if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsReady(true)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('fridgemind_user')
    localStorage.removeItem('fridgemind_whatsapp')
    document.cookie = "demo-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setUser(null)
    router.push('/login')
  }

  if (!isReady) {
    return <div className="min-h-screen bg-[#0a0a0b]" />
  }

  if (!user && !isLoginPage && !isLandingPage) {
    return null
  }

  if (isLoginPage) return <>{children}</>

  return (
    <div className="flex min-h-screen w-full bg-transparent text-[#f1f1f1] selection:bg-primary/30 font-sans">
      {/* Desktop Sidebar - Hidden on landing page for full immersion */}
      {!isLandingPage && (
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl p-6 h-screen sticky top-0 z-20">
          <div className="flex items-center gap-3 px-2 mb-10 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-white/10 glass group-hover:scale-110 transition-transform duration-500">
              <Refrigerator className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-heading font-bold tracking-tight text-white">FridgeMind</span>
          </div>
          
          <div className="mb-8 px-2">
            <div className="glass-dark border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] text-amber-500/80 font-bold uppercase tracking-[0.2em]">7 Day Streak</div>
                  <div className="text-xs font-bold text-white">Eco Guardian</div>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex flex-col px-4 py-3 rounded-2xl transition-all duration-500 relative ${
                    isActive 
                      ? 'bg-white/5 text-white' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`h-5 w-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-[14px] tracking-tight">{item.name}</span>
                      {item.status && (
                        <span className={`text-[10px] font-medium opacity-60 tracking-wider ${isActive ? 'text-primary' : ''}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 -z-10"
                    />
                  )}
                </Link>
              )
            })}
          </nav>
          
          <div className="pt-6 space-y-4 border-t border-white/5 mt-auto">
            <Link 
              href="/profile"
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                pathname === '/profile' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                 <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate">{user?.displayName || 'Eco Guardian'}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Verified Identity</span>
              </div>
            </Link>

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white gap-3 shadow-sm group"
              onClick={() => useStore.getState().setIsAddModalOpen(true)}
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
              <span className="font-bold">Quick Add</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-4 px-4 h-12 rounded-2xl text-muted-foreground hover:text-white hover:bg-white/5" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Navigation Overlays for Landing Page */}
        {isLandingPage && (
           <nav className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-12 z-50 pointer-events-none">
              <div className="flex items-center gap-3 pointer-events-auto">
                <Refrigerator className="h-6 w-6 text-white" />
                <span className="text-xl font-heading font-bold text-white tracking-widest uppercase">FridgeMind</span>
              </div>
              <div className="flex items-center gap-8 pointer-events-auto">
                 {navItems.filter(i => i.name !== 'Home').slice(0, 3).map(item => (
                   <Link key={item.name} href={item.href} className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/40 hover:text-white transition-colors">
                      {item.name}
                   </Link>
                 ))}
                 <Link href="/login" className="px-6 py-2 rounded-full glass text-[10px] tracking-[0.3em] uppercase font-bold text-white">
                    Access
                 </Link>
              </div>
           </nav>
        )}

        {/* Desktop Content Header */}
        {!isLandingPage && (
          <header className="hidden lg:flex items-center justify-between px-8 py-6 bg-black/10 backdrop-blur-xl sticky top-0 z-40 h-20 border-b border-white/5">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-heading font-bold text-white tracking-tight">
                {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <div className={`relative transition-all duration-500 ${searchFocused ? 'w-80' : 'w-64'}`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search everything..." 
                  className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/30 focus-visible:bg-white/10 transition-all duration-500 placeholder:text-muted-foreground/30 text-sm"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter />
              </div>
            </div>
          </header>
        )}

        {/* Mobile Content Header */}
        {!isLandingPage && (
          <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-2xl sticky top-0 z-40 border-b border-white/5">
            <div className="flex items-center gap-2" onClick={() => router.push('/')}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-white/10 glass">
                <Refrigerator className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-heading font-bold text-white tracking-tight">FridgeMind</span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
            </div>
          </header>
        )}

        {/* Content Area */}
        <div className={`flex-1 ${isLandingPage ? '' : 'bg-black/5'}`}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
              className={isLandingPage ? 'w-full' : 'w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-12 pb-32 lg:pb-12'}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Nav - Only on non-landing pages */}
        {!isLandingPage && (
          <nav className="lg:hidden fixed bottom-0 w-full bg-black/40 backdrop-blur-3xl px-6 pt-2 pb-safe z-50 border-t border-white/5">
            <div className="flex justify-between items-center h-16">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center transition-all duration-300 relative ${
                      isActive ? 'text-primary' : 'text-muted-foreground/40'
                    }`}
                  >
                    <div className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                      <item.icon className={`h-6 w-6`} />
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="mobileActive" 
                        className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_#22c55e]" 
                      />
                    )}
                  </Link>
                )
              })}
              <Link 
                href="/profile"
                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all ${
                  pathname === '/profile' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full overflow-hidden border ${pathname === '/profile' ? 'border-primary' : 'border-white/10'}`}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
              </Link>
            </div>
          </nav>
        )}
        {/* Global Modals */}
        <AddItemModal />
      </main>
    </div>
  )
}

