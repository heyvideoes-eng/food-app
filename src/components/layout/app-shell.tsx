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
  Flame,
  MoreHorizontal,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationCenter } from './notification-center'
import { AddItemModal } from '../modals/add-item-modal'
import { useStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'

// Primary 5 nav items shown in the bottom bar
const primaryNav = [
  { name: 'Home',      href: '/',          icon: Home },
  { name: 'Fridge',   href: '/fridge',     icon: Refrigerator },
  { name: 'Recipes',  href: '/recipes',    icon: ChefHat },
  { name: 'Waste',    href: '/waste',      icon: Trash2 },
  { name: 'Shop',     href: '/shopping',   icon: ShoppingCart },
]

// Overflow items shown in the "More" sheet
const overflowNav = [
  { name: 'Nutrition', href: '/nutrition', icon: MessageCircleHeart },
  { name: 'Rewards',   href: '/rewards',   icon: Award },
  { name: 'Profile',   href: '/profile',   icon: User },
]

// All nav for desktop sidebar
const allNav = [...primaryNav.slice(1), ...overflowNav]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const { setIsAddModalOpen } = useStore()
  const supabase = createClient()
  
  const isLandingPage = pathname === '/'
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
      } else if (!isLoginPage && !isLandingPage) {
        router.push('/login')
      }
      setIsReady(true)
    })

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
        if (!isLoginPage && !isLandingPage) {
          router.push('/login')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  // Fetch Profile for sidebar
  const { data: profile } = useQuery({
    queryKey: ['sidebar_profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return data
    },
    enabled: !!user
  })

  // Close more sheet on route change
  useEffect(() => { setShowMore(false) }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!isReady) {
    return <div className="min-h-screen bg-[#0a0a0b]" />
  }

  if (!user && !isLoginPage && !isLandingPage) {
    return null
  }

  if (isLoginPage) return <>{children}</>

  const currentPageName = [...primaryNav, ...overflowNav].find(i => 
    i.href === pathname || (i.href !== '/' && pathname.startsWith(i.href))
  )?.name || 'Dashboard'

  return (
    <div className="flex min-h-screen w-full bg-transparent text-[#f1f1f1] selection:bg-primary/30 font-sans">
      
      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
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
            {[{ name: 'Home', href: '/', icon: Home }, ...allNav].map((item) => {
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
                    <span className="font-bold text-[14px] tracking-tight">{item.name}</span>
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
                <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || user?.email}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate">{profile?.full_name || user?.user_metadata?.display_name || 'Guardian'}</span>
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

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative min-w-0">

        {/* Landing page nav — mobile-friendly */}
        {isLandingPage && (
          <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-5 md:px-12 py-4 md:py-6 z-50">
            <div className="flex items-center gap-2">
              <Refrigerator className="h-5 w-5 text-primary" />
              <span className="text-base md:text-xl font-heading font-bold text-white tracking-widest uppercase">FridgeMind</span>
            </div>
            {/* Mobile: single Access button only */}
            <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden md:flex items-center gap-8">
                {primaryNav.filter(i => i.name !== 'Home').slice(0, 3).map(item => (
                  <Link key={item.name} href={item.href} className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/40 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                ))}
              </div>
              <Link href="/login" className="px-5 py-2 rounded-full glass text-[11px] tracking-[0.2em] uppercase font-bold text-white border border-white/10 hover:bg-white/10 transition-colors tap-scale">
                Access
              </Link>
            </div>
          </nav>
        )}

        {/* Desktop Content Header */}
        {!isLandingPage && (
          <header className="hidden lg:flex items-center justify-between px-8 py-6 bg-black/10 backdrop-blur-xl sticky top-0 z-40 h-20 border-b border-white/5">
            <h2 className="text-xl font-heading font-bold text-white tracking-tight">
              {currentPageName}
            </h2>
            <div className="flex items-center gap-6">
              <NotificationCenter />
            </div>
          </header>
        )}

        {/* Mobile Content Header */}
        {!isLandingPage && (
          <header className="lg:hidden flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-2xl sticky top-0 z-40 border-b border-white/5" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
            <div className="flex items-center gap-2.5 tap-scale" onClick={() => router.push('/')}>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-white/10">
                <Refrigerator className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-[15px] font-heading font-bold text-white tracking-tight leading-none block">FridgeMind</span>
                <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest leading-none">{currentPageName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary tap-scale"
              >
                <Plus className="h-4 w-4" />
              </button>
              <NotificationCenter />
            </div>
          </header>
        )}

        {/* Content Area */}
        <div className={`flex-1 ${isLandingPage ? '' : 'bg-black/5'} relative z-10`}>
          <div className={isLandingPage ? 'w-full' : 'w-full max-w-7xl mx-auto px-4 pt-5 pb-32 md:px-6 lg:px-12 lg:pt-8 lg:pb-12'}>
            {children}
          </div>
        </div>

        {/* ─── Mobile Bottom Navigation ─────────────────────────── */}
        {!isLandingPage && (
          <>
            {/* "More" sheet that slides up */}
            <AnimatePresence>
              {showMore && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setShowMore(false)}
                  />
                  {/* Sheet */}
                  <motion.div
                    key="sheet"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 0.8 }}
                    className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111113]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[2rem] overflow-hidden"
                  >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-10 h-1 rounded-full bg-white/20" />
                    </div>

                    <div className="px-6 pb-4 pt-2">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">More Modules</p>
                      <div className="grid grid-cols-3 gap-3">
                        {overflowNav.map(item => {
                          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all tap-scale ${
                                isActive 
                                  ? 'bg-primary/10 border-primary/30 text-primary' 
                                  : 'bg-white/[0.03] border-white/5 text-white/50 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <item.icon className="h-6 w-6" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                            </Link>
                          )
                        })}
                        <button
                          onClick={handleLogout}
                          className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white/30 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all tap-scale"
                        >
                          <LogOut className="h-6 w-6" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                        </button>
                      </div>
                    </div>

                    {/* safe area spacing */}
                    <div style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Bottom Tab Bar */}
            <nav 
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0f]/90 backdrop-blur-3xl border-t border-white/[0.06]"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
            >
              <div className="flex items-center justify-around px-2 h-[62px]">
                {primaryNav.map(item => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative tap-scale"
                    >
                      <motion.div
                        animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-300 ${
                          isActive ? 'bg-primary/15' : ''
                        }`}
                      >
                        <item.icon className={`h-[22px] w-[22px] transition-colors duration-300 ${
                          isActive ? 'text-primary' : 'text-white/30'
                        }`} />
                      </motion.div>
                      <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                        isActive ? 'text-primary' : 'text-white/20'
                      }`}>
                        {item.name}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveDot"
                          className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-primary shadow-[0_0_8px_2px_rgba(148,163,184,0.4)]"
                        />
                      )}
                    </Link>
                  )
                })}

                {/* More button */}
                <button
                  onClick={() => setShowMore(v => !v)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 h-full tap-scale"
                >
                  <motion.div
                    animate={showMore ? { rotate: 90 } : { rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-300 ${
                      showMore ? 'bg-white/10' : ''
                    }`}
                  >
                    {showMore 
                      ? <X className="h-[22px] w-[22px] text-white/60" />
                      : <MoreHorizontal className="h-[22px] w-[22px] text-white/30" />
                    }
                  </motion.div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/20">More</span>
                </button>
              </div>
            </nav>
          </>
        )}

        {/* Global Modals */}
        <AddItemModal />
      </main>
    </div>
  )
}
