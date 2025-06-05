"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { safeAuth, hasSupabaseConfig, getSupabaseClient } from "@/lib/supabase" // Added getSupabaseClient
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true
    let authSubUnsubscribe: (() => void) | null = null

    const initializeAuth = async () => {
      if (!hasSupabaseConfig) {
        console.log("AuthProvider: Supabase not configured, skipping auth.")
        if (mounted) setLoading(false)
        return
      }

      // Ensure client is attempted to be initialized
      await getSupabaseClient()

      // Get initial session
      try {
        const { data, error } = await safeAuth.getSession()
        if (!mounted) return

        if (error) console.warn("AuthProvider: Auth session error:", error)

        if (data?.session?.user) {
          setUser({ id: data.session.user.id, email: data.session.user.email || "" })
        } else if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
          router.push("/admin/login")
        }
      } catch (e) {
        console.warn("AuthProvider: Failed to get initial session:", e)
      } finally {
        if (mounted) setLoading(false)
      }

      // Set up auth state listener
      try {
        const {
          data: { subscription },
        } = safeAuth.onAuthStateChange((event: string, session: any) => {
          if (!mounted) return
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || "" })
          } else {
            setUser(null)
            if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
              router.push("/admin/login")
            }
          }
          setLoading(false) // Ensure loading is set to false after state change
        })
        authSubUnsubscribe = subscription?.unsubscribe
      } catch (e) {
        console.warn("AuthProvider: Failed to set up auth listener:", e)
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      if (authSubUnsubscribe) {
        try {
          authSubUnsubscribe()
        } catch (error) {
          console.warn("AuthProvider: Error unsubscribing from auth:", error)
        }
      }
    }
  }, [pathname, router])

  const signOut = async () => {
    if (!hasSupabaseConfig) {
      console.warn("AuthProvider: Cannot sign out, Supabase not configured.")
      return
    }
    try {
      await safeAuth.signOut()
      setUser(null)
      router.push("/admin/login")
    } catch (error) {
      console.warn("AuthProvider: Sign out error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
