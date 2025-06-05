// A completely isolated, simplified admin authentication system
import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if we have valid configuration
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

// Create a simple admin auth helper
export const adminAuth = {
  // Login function
  async login(email: string, password: string) {
    if (!hasSupabaseConfig) {
      return { success: false, error: "Supabase not configured" }
    }

    try {
      // Create a fresh client just for this operation
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data?.session) {
        // Store the session token in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("adminToken", data.session.access_token)
          localStorage.setItem(
            "adminUser",
            JSON.stringify({
              id: data.user?.id,
              email: data.user?.email,
            }),
          )
        }
        return { success: true }
      }

      return { success: false, error: "No session returned" }
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" }
    }
  },

  // Logout function
  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
    }

    // Also try to sign out from Supabase if possible
    if (hasSupabaseConfig) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        await supabase.auth.signOut()
      } catch (error) {
        console.warn("Error during sign out:", error)
      }
    }

    return { success: true }
  },

  // Check if user is logged in
  isLoggedIn() {
    if (typeof window === "undefined") return false
    return Boolean(localStorage.getItem("adminToken"))
  },

  // Get current user
  getUser() {
    if (typeof window === "undefined") return null
    const userJson = localStorage.getItem("adminUser")
    if (!userJson) return null
    try {
      return JSON.parse(userJson)
    } catch (error) {
      return null
    }
  },

  // Require authentication or redirect
  requireAuth() {
    if (typeof window !== "undefined" && !this.isLoggedIn()) {
      redirect("/admin/login")
    }
  },
}

// Create a database helper that uses the admin token
export const adminDb = {
  async getProjects() {
    if (!hasSupabaseConfig) {
      return { success: false, data: [], error: "Supabase not configured" }
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Get the admin token
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null

      if (!token) {
        return { success: false, data: [], error: "Not authenticated" }
      }

      // Set the auth token for this request
      supabase.auth.setSession({ access_token: token, refresh_token: "" })

      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) {
        return { success: false, data: [], error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, data: [], error: error.message || "Failed to fetch projects" }
    }
  },

  async deleteProject(id: string) {
    if (!hasSupabaseConfig) {
      return { success: false, error: "Supabase not configured" }
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Get the admin token
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null

      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      // Set the auth token for this request
      supabase.auth.setSession({ access_token: token, refresh_token: "" })

      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to delete project" }
    }
  },

  async getProjectCount() {
    if (!hasSupabaseConfig) {
      return { success: false, data: null, error: "Supabase not configured" }
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Get the admin token
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null

      if (!token) {
        return { success: false, data: null, error: "Not authenticated" }
      }

      // Set the auth token for this request
      supabase.auth.setSession({ access_token: token, refresh_token: "" })

      const { count, error } = await supabase.from("projects").select("*", { count: "exact", head: true })

      if (error) {
        return { success: false, data: null, error: error.message }
      }

      return { success: true, data: count }
    } catch (error: any) {
      return { success: false, data: null, error: error.message || "Failed to get project count" }
    }
  },
}
