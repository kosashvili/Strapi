"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { safeAuth, hasSupabaseConfig } from "@/lib/supabase"
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
    let authSubscription: any = null

    const getUser = async () => {
      // If Supabase is not configured, skip auth
      if (!hasSupabaseConfig) {
        console.log("Supabase not configured, skipping authentication")
        if (mounted) {
          setLoading(false)
        }
        return
      }

      try {
        const { data, error } = await safeAuth.getSession()

        if (!mounted) return

        if (error) {
          console.warn("Auth session error:", error)
          setLoading(false)
          return
        }

        if (data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || "",
          })
        } else if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
          router.push("/admin/login")
        }
      } catch (error) {
        console.warn("Failed to get auth session:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const setupAuthListener = async () => {
      if (!hasSupabaseConfig) {
        return
      }

      try {
        const authListener = safeAuth.onAuthStateChange((event: string, session: any) => {
          if (!mounted) return

          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
            })
          } else {
            setUser(null)
            if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
              router.push("/admin/login")
            }
          }
          setLoading(false)
        })

        authSubscription = authListener.data?.subscription
      } catch (error) {
        console.warn("Failed to set up auth listener:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Initialize auth
    getUser()
    setupAuthListener()

    return () => {
      mounted = false
      if (authSubscription?.unsubscribe) {
        try {
          authSubscription.unsubscribe()
        } catch (error) {
          console.warn("Error unsubscribing from auth:", error)
        }
      }
    }
  }, [pathname, router])

  const signOut = async () => {
    if (!hasSupabaseConfig) {
      console.warn("Cannot sign out: Supabase not configured")
      return
    }

    try {
      await safeAuth.signOut()
      setUser(null)
      router.push("/admin/login")
    } catch (error) {
      console.warn("Sign out error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
