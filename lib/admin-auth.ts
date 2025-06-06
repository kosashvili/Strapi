import { getSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export const adminAuth = {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabase not configured" }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        user: data.user || undefined,
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Sign up failed" }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabase not configured" }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        user: data.user || undefined,
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Sign in failed" }
    }
  },

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabase not configured" }
    }

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Sign out failed" }
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  },

  // Get current session
  async getSession() {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabaseClient()
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }

    return supabase.auth.onAuthStateChange(callback)
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session?.user
  },

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabase not configured" }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Password reset failed" }
    }
  },
}
