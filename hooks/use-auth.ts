"use client"

import { useContext } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/config"

export function useAuth() {
  const context = useContext(AuthContext)
  const router = useRouter()

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return {
    ...context,
    signOut,
  }
}