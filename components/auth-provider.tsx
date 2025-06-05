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
    const getUser = async () => {
      // If Supabase is not configured, skip auth
      if (!hasSupabaseConfig) {
        console.log("Supabase not configured, skipping authentication")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await safeAuth.getSession()

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
        setLoading(false)
      }
    }

    getUser()

    // Only set up auth state listener if Supabase is available
    if (!hasSupabaseConfig) {
      setLoading(false)
      return
    }

    let subscription: any = null

    try {
      const authListener = safeAuth.onAuthStateChange((event: string, session: any) => {
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

      subscription = authListener.data?.subscription
    } catch (error) {
      console.warn("Failed to set up auth listener:", error)
      setLoading(false)
    }

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
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
