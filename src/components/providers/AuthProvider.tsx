'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if auth is a valid Firebase Auth instance (not our build-time dummy)
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      const mockUser = localStorage.getItem('fridgemind_user')
      if (mockUser) {
        try {
          setUser(JSON.parse(mockUser))
        } catch (e) {
          console.error('Failed to parse local user:', e)
        }
      }
      setLoading(false)
      return
    }

    // Check for Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        setLoading(false)
        document.cookie = `firebase-user=${user.uid}; path=/; max-age=3600`
      } else {
        // Fallback: Check local storage for mock demo user
        const mockUser = localStorage.getItem('fridgemind_user')
        if (mockUser) {
          try {
            setUser(JSON.parse(mockUser))
          } catch (e) {
            console.error('Failed to parse local user:', e)
          }
        } else {
          setUser(null)
          document.cookie = 'firebase-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        }
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
