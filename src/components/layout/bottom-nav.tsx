'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Refrigerator, ChefHat, ShoppingCart, MessageCircleHeart } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Fridge', href: '/fridge', icon: Refrigerator },
  { name: 'Recipes', href: '/recipes', icon: ChefHat },
  { name: 'Shop', href: '/shopping', icon: ShoppingCart },
  { name: 'Chat', href: '/nutrition', icon: MessageCircleHeart },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f111a]/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            {isActive && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
          </Link>
        )
      })}
    </nav>
  )
}
