// A completely isolated, simplified admin authentication system
import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if we have valid configuration
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

const adminStorageKey = "lightberry-admin-auth-token"

const createAdminSupabaseClient = () => {
  if (!hasSupabaseConfig) return null
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: adminStorageKey,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
    if (!client) {
      console.error("❌ Admin Auth: createClient returned null/undefined!")
      return null
    }
    return client
  } catch (error) {
    console.error("❌ Admin Auth: Error during createClient:", error)
    return null
  }
}

// Create a simple admin auth helper
export const adminAuth = {
  // Login function
  async login(email: string, password: string) {
    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabase client initialization failed for login" }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data?.session && data.user) {
        // localStorage is managed by Supabase client with custom storageKey
        return { success: true }
      }
      // Fallback for user info if needed, though Supabase client should handle session
      if (data?.user && typeof window !== "undefined") {
        localStorage.setItem("adminUserEmail", data.user.email || "N/A") // Example of manual storage if needed
      }

      return { success: false, error: "No session or user returned" }
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" }
    }
  },

  // Logout function
  async logout() {
    const supabase = createAdminSupabaseClient()
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.warn("Error during Supabase sign out:", error)
      }
    }
    // Additional manual cleanup if any
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminUserEmail")
    }
    return { success: true }
  },

  // Check if user is logged in
  async isLoggedIn() {
    if (typeof window === "undefined") return false
    if (!hasSupabaseConfig) return false

    const supabase = createAdminSupabaseClient()
    if (!supabase) return false

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return Boolean(session)
    } catch (error) {
      console.warn("isLoggedIn check failed:", error)
      return false
    }
  },

  // Get current user
  async getUser() {
    if (typeof window === "undefined") return null
    if (!hasSupabaseConfig) return null

    const supabase = createAdminSupabaseClient()
    if (!supabase) return null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user ? { id: user.id, email: user.email } : null
    } catch (error) {
      console.warn("getUser check failed:", error)
      return null
    }
  },

  // Require authentication or redirect
  async requireAuth() {
    if (typeof window !== "undefined" && !(await this.isLoggedIn())) {
      redirect("/admin/login")
    }
  },
}

// Create a database helper that uses the admin token
export const adminDb = {
  async getProjects() {
    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      return { success: false, data: [], error: "Supabase client initialization failed for getProjects" }
    }
    // Auth is handled by the client's stored session due to custom storageKey
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
      if (error) return { success: false, data: [], error: error.message }
      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, data: [], error: error.message || "Failed to fetch projects" }
    }
  },

  async deleteProject(id: string) {
    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabase client initialization failed for deleteProject" }
    }
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to delete project" }
    }
  },

  async getProjectCount() {
    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      return { success: false, data: null, error: "Supabase client initialization failed for getProjectCount" }
    }
    try {
      const { count, error } = await supabase.from("projects").select("*", { count: "exact", head: true })
      if (error) return { success: false, data: null, error: error.message }
      return { success: true, data: count }
    } catch (error: any) {
      return { success: false, data: null, error: error.message || "Failed to get project count" }
    }
  },
}
