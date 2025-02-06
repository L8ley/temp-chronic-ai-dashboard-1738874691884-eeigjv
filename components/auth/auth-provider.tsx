"use client"

import { createContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null)
          
          if (event === 'SIGNED_IN' && pathname === '/') {
            router.push('/dashboard')
          } else if (event === 'SIGNED_OUT') {
            router.push('/')
          }
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [supabase.auth, router, pathname])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}