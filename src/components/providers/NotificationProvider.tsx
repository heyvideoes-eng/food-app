'use client'

import { useEffect, createContext, useContext, ReactNode } from 'react'
import { toast } from 'sonner'
import { differenceInDays, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Flame, Award } from 'lucide-react'
import React from 'react'

interface NotificationContextType {
  checkNow: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()

  const notifyWhatsApp = async (item: any, message: string) => {
    try {
       await fetch('/api/notifications/whatsapp', { 
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: `Alert for ${item.name}: ${message}` })
       })
       console.log(`[Twilio Link] WhatsApp notification dispatched for ${item.name}`)
    } catch (e) {
      console.error('WhatsApp gateway unreachable or unauthorized')
    }
  }

  const checkExpiry = async () => {
    try {
      const { data } = await supabase.from('fridge_items').select('*')
      if (!data) return

      data.forEach((item: any) => {
        const days = differenceInDays(parseISO(item.expiry_date), new Date())
        const storageKey = `notified_${item.id}_${item.expiry_date}`
        const alreadyNotified = localStorage.getItem(storageKey)

        if (days >= 0 && days <= 1 && !alreadyNotified) {
          const message = days === 0 ? 'Expiring today!' : 'Expiring tomorrow. Plan your meal!'
          
          toast(`Expiry Alert: ${item.name}`, {
            description: message,
            icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
            duration: 10000,
          })
          
          // Trigger WhatsApp Bridge
          notifyWhatsApp(item, message)
          
          localStorage.setItem(storageKey, 'true')
        }
      })
    } catch (err) {
      console.warn('Notification check failed:', err)
    }
  }

  useEffect(() => {
    // 1. Initial check on mount
    checkExpiry()

    // 2. Real-time Listener for live updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fridge_items' },
        (payload) => {
          console.log('Real-time update received:', payload)
          checkExpiry() // Re-run analysis immediately on change
          
          if (payload.eventType === 'INSERT') {
            toast.success(`New Item Tracked: ${payload.new.name}`, {
              icon: <Flame className="h-4 w-4 text-primary" />
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ checkNow: checkExpiry }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
