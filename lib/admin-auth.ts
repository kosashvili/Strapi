import { getSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export const adminAuth = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        return { success: false, error: "Supabase not configured" }
      }

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
      console.error("Sign in error:", error)
      return { success: false, error: error.message || "Sign in failed" }
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        return { success: false, error: "Supabase not configured" }
      }

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
      console.error("Sign up error:", error)
      return { success: false, error: error.message || "Sign up failed" }
    }
  },

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        return { success: false, error: "Supabase not configured" }
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message || "Sign out failed" }
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return null

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
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return null

      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession()
      return !!session?.user
    } catch (error) {
      console.error("Error checking authentication:", error)
      return false
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        return { success: false, error: "Supabase not configured" }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Reset password error:", error)
      return { success: false, error: error.message || "Password reset failed" }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.warn("Cannot listen to auth state changes - Supabase not configured")
        return { data: { subscription: { unsubscribe: () => {} } } }
      }

      return supabase.auth.onAuthStateChange(callback)
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  },
}
