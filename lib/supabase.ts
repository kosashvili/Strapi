// Safe Supabase client that never throws errors

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate URL format
function isValidUrl(string: string) {
  if (!string) return false
  try {
    const url = new URL(string)
    return url.protocol === "https:" && url.hostname.includes("supabase")
  } catch (_) {
    return false
  }
}

// Check if we have valid configuration
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl))

// Debug logging (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔧 Supabase Configuration:")
  console.log("- URL provided:", Boolean(supabaseUrl))
  console.log("- URL valid:", isValidUrl(supabaseUrl))
  console.log("- Key provided:", Boolean(supabaseAnonKey))
  console.log("- Has config:", hasSupabaseConfig)
}

// Create a safe Supabase client
let supabase: any = null

if (hasSupabaseConfig) {
  try {
    // Dynamic import to avoid issues during build
    import("@supabase/supabase-js")
      .then(({ createClient }) => {
        try {
          supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
            },
          })

          if (typeof window !== "undefined") {
            console.log("✅ Supabase client created successfully")
          }
        } catch (error) {
          console.warn("Failed to create Supabase client:", error)
          supabase = null
        }
      })
      .catch((error) => {
        console.warn("Failed to import Supabase:", error)
        supabase = null
      })
  } catch (error) {
    console.warn("Failed to setup Supabase:", error)
    supabase = null
  }
}

// Safe auth methods that never throw
export const safeAuth = {
  getSession: async () => {
    if (!hasSupabaseConfig || !supabase?.auth) {
      return { data: { session: null }, error: null }
    }
    try {
      return await supabase.auth.getSession()
    } catch (error) {
      console.warn("Auth getSession failed:", error)
      return { data: { session: null }, error }
    }
  },

  signInWithPassword: async (credentials: { email: string; password: string }) => {
    if (!hasSupabaseConfig || !supabase?.auth) {
      return { data: { user: null }, error: new Error("Authentication not available") }
    }
    try {
      return await supabase.auth.signInWithPassword(credentials)
    } catch (error) {
      console.warn("Auth signIn failed:", error)
      return { data: { user: null }, error }
    }
  },

  signOut: async () => {
    if (!hasSupabaseConfig || !supabase?.auth) {
      return { error: null }
    }
    try {
      return await supabase.auth.signOut()
    } catch (error) {
      console.warn("Auth signOut failed:", error)
      return { error }
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!hasSupabaseConfig || !supabase?.auth) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    try {
      return supabase.auth.onAuthStateChange(callback)
    } catch (error) {
      console.warn("Auth state change listener failed:", error)
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  },
}

// Test function to check basic connectivity
export async function testSupabaseConnection() {
  if (!hasSupabaseConfig) {
    return { success: false, error: "Supabase not configured" }
  }

  if (!supabase) {
    return { success: false, error: "Supabase client not available" }
  }

  try {
    // First, test basic URL connectivity
    const baseUrl = supabaseUrl.replace("/rest/v1", "")
    const healthCheckUrl = `${baseUrl}/rest/v1/`

    const response = await fetch(healthCheckUrl, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // Now test Supabase client
    if (supabase?.from) {
      const { data, error } = await supabase.from("projects").select("count", { count: "exact", head: true })
      if (error) throw error
    }

    return { success: true, data: "Connection successful" }
  } catch (error: any) {
    console.error("❌ Connection test failed:", error)
    return { success: false, error: error.message }
  }
}

// Safe wrapper for Supabase operations
export async function safeSupabaseOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName = "operation",
): Promise<{ data: T; error: string | null; isUsingFallback: boolean }> {
  // If no Supabase config, return fallback immediately
  if (!hasSupabaseConfig || !supabase) {
    return {
      data: fallback,
      error: "Supabase not configured",
      isUsingFallback: true,
    }
  }

  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Operation timeout")), 8000),
    )

    const result = await Promise.race([operation(), timeoutPromise])

    return {
      data: result,
      error: null,
      isUsingFallback: false,
    }
  } catch (error: any) {
    console.warn(`${operationName} failed, using fallback:`, error.message)
    return {
      data: fallback,
      error: error.message,
      isUsingFallback: true,
    }
  }
}

// Export the client (but always check if it exists before using)
export { supabase }
