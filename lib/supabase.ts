// lib/supabase.ts

import type { SupabaseClient } from "@supabase/supabase-js"

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

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl))

// Debug logging (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔧 Supabase Configuration (lib/supabase.ts):")
  console.log("- URL provided:", Boolean(supabaseUrl))
  console.log("- URL valid:", isValidUrl(supabaseUrl))
  console.log("- Key provided:", Boolean(supabaseAnonKey))
  console.log("- Has config:", hasSupabaseConfig)
}

let clientInstance: SupabaseClient | null = null
let clientInitializationPromise: Promise<SupabaseClient | null> | null = null

async function createAndInitializeClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseConfig) {
    console.warn("Supabase not configured. Cannot initialize client.")
    return null
  }

  try {
    const { createClient } = await import("@supabase/supabase-js")
    const newClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Recommended to be false for Next.js
      },
    })
    console.log("✅ Supabase client created successfully (Singleton)")
    return newClient
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    return null
  }
}

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (clientInstance) {
    return clientInstance
  }

  if (clientInitializationPromise) {
    return clientInitializationPromise
  }

  clientInitializationPromise = createAndInitializeClient()

  try {
    clientInstance = await clientInitializationPromise
  } catch (error) {
    // Error already logged in createAndInitializeClient
  } finally {
    clientInitializationPromise = null
  }

  return clientInstance
}

// Safe auth methods
export const safeAuth = {
  getSession: async () => {
    if (!hasSupabaseConfig) return { data: { session: null }, error: null }
    try {
      const client = await getSupabaseClient()
      if (!client?.auth) return { data: { session: null }, error: new Error("Auth not available") }
      return await client.auth.getSession()
    } catch (error) {
      console.warn("Auth getSession failed:", error)
      return { data: { session: null }, error }
    }
  },
  getUser: async () => {
    if (!hasSupabaseConfig) return { data: { user: null }, error: null }
    try {
      const client = await getSupabaseClient()
      if (!client?.auth) return { data: { user: null }, error: new Error("Auth not available") }
      return await client.auth.getUser()
    } catch (error) {
      console.warn("Auth getUser failed:", error)
      return { data: { user: null }, error }
    }
  },
  signInWithPassword: async (credentials: { email: string; password: string }) => {
    if (!hasSupabaseConfig)
      return { data: { user: null, session: null }, error: new Error("Authentication not available") }
    try {
      const client = await getSupabaseClient()
      if (!client?.auth) return { data: { user: null, session: null }, error: new Error("Auth not available") }
      return await client.auth.signInWithPassword(credentials)
    } catch (error) {
      console.warn("Auth signIn failed:", error)
      return { data: { user: null, session: null }, error }
    }
  },
  signOut: async () => {
    if (!hasSupabaseConfig) return { error: null }
    try {
      const client = await getSupabaseClient()
      if (!client?.auth) return { error: null }
      return await client.auth.signOut()
    } catch (error) {
      console.warn("Auth signOut failed:", error)
      return { error }
    }
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // This needs to be handled carefully due to its synchronous return expectation for the subscription object
    let unsubscribe = () => {}
    if (hasSupabaseConfig) {
      getSupabaseClient()
        .then((client) => {
          if (client?.auth) {
            const {
              data: { subscription },
            } = client.auth.onAuthStateChange(callback)
            if (subscription) {
              unsubscribe = subscription.unsubscribe
            }
          } else {
            console.warn("Auth state change listener: Supabase client or auth not available.")
          }
        })
        .catch((error) => {
          console.warn("Auth state change listener setup failed:", error)
        })
    }
    return { data: { subscription: { unsubscribe: () => unsubscribe() } } }
  },
}

// Test function
export async function testSupabaseConnection() {
  if (!hasSupabaseConfig) return { success: false, error: "Supabase not configured" }
  try {
    const client = await getSupabaseClient()
    if (!client) return { success: false, error: "Supabase client not available" }

    const healthCheckUrl = `${supabaseUrl.replace("/rest/v1", "")}/rest/v1/`
    const response = await fetch(healthCheckUrl, {
      method: "GET",
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const { error } = await client.from("projects").select("id", { count: "exact", head: true })
    if (error) throw error
    return { success: true, data: "Connection successful" }
  } catch (error: any) {
    console.error("❌ Connection test failed:", error)
    return { success: false, error: error.message }
  }
}

// Safe wrapper for Supabase operations
export async function safeSupabaseOperation<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  fallback: T,
  operationName = "operation",
): Promise<{ data: T; error: string | null; isUsingFallback: boolean }> {
  if (!hasSupabaseConfig) {
    return { data: fallback, error: "Supabase not configured", isUsingFallback: true }
  }
  try {
    const client = await getSupabaseClient()
    if (!client) throw new Error("Supabase client initialization failed")

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Operation timeout")), 8000),
    )
    const result = await Promise.race([operation(client), timeoutPromise])
    return { data: result, error: null, isUsingFallback: false }
  } catch (error: any) {
    console.warn(`${operationName} failed, using fallback:`, error.message)
    return { data: fallback, error: error.message, isUsingFallback: true }
  }
}
