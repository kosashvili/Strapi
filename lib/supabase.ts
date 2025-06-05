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
let supabaseInitialized = false

// Initialize Supabase client safely
async function initializeSupabase() {
  if (supabaseInitialized || !hasSupabaseConfig) {
    return supabase
  }

  try {
    const { createClient } = await import("@supabase/supabase-js")

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })

    supabaseInitialized = true

    if (typeof window !== "undefined") {
      console.log("✅ Supabase client created successfully")
    }

    return supabase
  } catch (error) {
    console.warn("Failed to create Supabase client:", error)
    supabaseInitialized = true // Mark as initialized to prevent retries
    return null
  }
}

// Initialize immediately if we have config
if (hasSupabaseConfig && typeof window !== "undefined") {
  initializeSupabase()
}

// Safe auth methods that never throw
export const safeAuth = {
  getSession: async () => {
    if (!hasSupabaseConfig) {
      return { data: { session: null }, error: null }
    }

    try {
      const client = await initializeSupabase()
      if (!client?.auth) {
        return { data: { session: null }, error: new Error("Auth not available") }
      }

      return await client.auth.getSession()
    } catch (error) {
      console.warn("Auth getSession failed:", error)
      return { data: { session: null }, error }
    }
  },

  getUser: async () => {
    if (!hasSupabaseConfig) {
      return { data: { user: null }, error: null }
    }

    try {
      const client = await initializeSupabase()
      if (!client?.auth) {
        return { data: { user: null }, error: new Error("Auth not available") }
      }

      return await client.auth.getUser()
    } catch (error) {
      console.warn("Auth getUser failed:", error)
      return { data: { user: null }, error }
    }
  },

  signInWithPassword: async (credentials: { email: string; password: string }) => {
    if (!hasSupabaseConfig) {
      return { data: { user: null }, error: new Error("Authentication not available") }
    }

    try {
      const client = await initializeSupabase()
      if (!client?.auth) {
        return { data: { user: null }, error: new Error("Auth not available") }
      }

      return await client.auth.signInWithPassword(credentials)
    } catch (error) {
      console.warn("Auth signIn failed:", error)
      return { data: { user: null }, error }
    }
  },

  signOut: async () => {
    if (!hasSupabaseConfig) {
      return { error: null }
    }

    try {
      const client = await initializeSupabase()
      if (!client?.auth) {
        return { error: null }
      }

      return await client.auth.signOut()
    } catch (error) {
      console.warn("Auth signOut failed:", error)
      return { error }
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!hasSupabaseConfig) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    // Return a promise that resolves to the subscription
    const setupListener = async () => {
      try {
        const client = await initializeSupabase()
        if (!client?.auth) {
          return { data: { subscription: { unsubscribe: () => {} } } }
        }

        return client.auth.onAuthStateChange(callback)
      } catch (error) {
        console.warn("Auth state change listener failed:", error)
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
    }

    // For immediate use, return a dummy subscription
    const dummySubscription = { data: { subscription: { unsubscribe: () => {} } } }

    // Set up the real listener asynchronously
    setupListener().then((realSubscription) => {
      if (realSubscription && realSubscription.data?.subscription) {
        // Replace the dummy with the real subscription
        Object.assign(dummySubscription.data.subscription, realSubscription.data.subscription)
      }
    })

    return dummySubscription
  },
}

// Test function to check basic connectivity
export async function testSupabaseConnection() {
  if (!hasSupabaseConfig) {
    return { success: false, error: "Supabase not configured" }
  }

  try {
    const client = await initializeSupabase()
    if (!client) {
      return { success: false, error: "Supabase client not available" }
    }

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
    if (client?.from) {
      const { data, error } = await client.from("projects").select("count", { count: "exact", head: true })
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
  if (!hasSupabaseConfig) {
    return {
      data: fallback,
      error: "Supabase not configured",
      isUsingFallback: true,
    }
  }

  try {
    // Ensure client is initialized
    const client = await initializeSupabase()
    if (!client) {
      throw new Error("Supabase client initialization failed")
    }

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

// Export a getter function for the client
export async function getSupabaseClient() {
  return await initializeSupabase()
}

// Export the client (but always check if it exists before using)
export { supabase }
