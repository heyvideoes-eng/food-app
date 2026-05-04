'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Refrigerator, 
  ChefHat, 
  Trash2, 
  ShoppingCart, 
  MessageCircleHeart, 
  Award,
  LogOut,
  User,
  Plus,
  Activity,
  Menu,
  X
} from 'lucide-react'
import { createClient } from '../../lib/supabase/client'
import { Button } from '../ui/button'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { AddItemModal } from '../modals/add-item-modal'

const navItems = [
  { name: 'Home',     href: '/',          icon: Home },
  { name: 'Fridge',   href: '/fridge',     icon: Refrigerator },
  { name: 'Recipes',  href: '/recipes',    icon: ChefHat },
  { name: 'Waste',    href: '/waste',      icon: Trash2 },
  { name: 'Shop',     href: '/shopping',   icon: ShoppingCart },
  { name: 'Nutrition', href: '/nutrition', icon: MessageCircleHeart },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { setIsAddModalOpen } = useStore()
  const supabase = createClient()
  
  const isLandingPage = pathname === '/'
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      } else if (!isLoginPage && !isLandingPage) {
        router.push('/login')
      }
      setIsReady(true)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
        if (!isLoginPage && !isLandingPage) router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!isReady) return <div className="min-h-screen bg-[#050506]" />
  if (isLoginPage) return <>{children}</>

  return (
    <div className="flex min-h-screen bg-[#050506] text-white font-sans selection:bg-primary/30">
      
      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
      {!isLandingPage && (
        <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-black/20 p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
              <Refrigerator className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">FridgeMind</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/10' 
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-bold text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="pt-6 border-t border-white/5 mt-auto space-y-4">
            <Button 
              className="w-full h-12 rounded-xl bg-primary text-white font-bold gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Quick Add
            </Button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-white/30 hover:text-rose-400 transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* ─── Main Content Area ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative min-w-0">
        
        {/* Navigation Bar */}
        <header className={`flex items-center justify-between px-6 py-4 sticky top-0 z-40 ${isLandingPage ? 'bg-transparent' : 'bg-[#050506]/80 backdrop-blur-xl border-b border-white/5'}`}>
          <div className="flex items-center gap-3 lg:hidden" onClick={() => router.push('/')}>
            <Refrigerator className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold tracking-tight">FridgeMind</span>
          </div>
          
          {!isLandingPage && (
            <h2 className="hidden lg:block text-sm font-bold uppercase tracking-[0.2em] text-white/20">
              {navItems.find(i => i.href === pathname || (i.href !== '/' && pathname.startsWith(i.href)))?.name || 'Dashboard'}
            </h2>
          )}

          <div className="flex items-center gap-4">
             {user ? (
               <Link href="/profile" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
               </Link>
             ) : (
               <Link href="/login" className="px-5 py-2 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90">
                 Access
               </Link>
             )}
             
             {/* Mobile Menu Toggle */}
             {!isLandingPage && (
               <button 
                 className="lg:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               >
                 {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
               </button>
             )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>

        {/* Mobile Bottom Navigation (Only for logged in) */}
        {!isLandingPage && user && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050506]/90 backdrop-blur-2xl border-t border-white/5 pb-safe">
            <div className="flex items-center justify-around h-16">
              {navItems.slice(0, 5).map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive ? 'text-primary' : 'text-white/20'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#050506] border-r border-white/10 p-6 flex flex-col">
             <div className="flex items-center gap-3 mb-10">
                <Refrigerator className="h-6 w-6 text-primary" />
                <span className="text-xl font-heading font-bold">FridgeMind</span>
             </div>
             <nav className="flex-1 space-y-2">
                {navItems.map(item => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-sm font-bold"
                  >
                    <item.icon className="h-5 w-5" /> {item.name}
                  </Link>
                ))}
             </nav>
             <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 text-white/20">
                <LogOut className="h-5 w-5" /> Logout
             </button>
          </aside>
        </div>
      )}

      {/* Global Modals */}
      <AddItemModal />
    </div>
  )
}
