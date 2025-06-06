// Ultra-defensive Supabase client for public data only
import type { SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

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

// Ultra-defensive client creation with extensive error checking
export async function createSupabaseClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseConfig) {
    console.warn("Supabase not configured")
    return null
  }

  try {
    const { createClient } = await import("@supabase/supabase-js")

    // Create client with minimal configuration to avoid auth issues
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Disable session persistence to avoid auth issues
        autoRefreshToken: false, // Disable auto refresh
        detectSessionInUrl: false, // Disable URL session detection
      },
      global: {
        headers: {
          "X-Client-Info": "lightberry-public-client",
        },
      },
    })

    // Defensive check - ensure client and its properties exist
    if (!client) {
      console.error("Supabase createClient returned null/undefined")
      return null
    }

    // Additional safety check for client structure
    if (typeof client !== "object") {
      console.error("Supabase client is not an object")
      return null
    }

    // Check if client has the expected methods
    if (!client.from || typeof client.from !== "function") {
      console.error("Supabase client missing 'from' method")
      return null
    }

    console.log("✅ Supabase client created successfully")
    return client
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}

// Ultra-safe wrapper for database operations with extensive error handling
export async function safeSupabaseOperation<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  fallback: T,
  operationName = "operation",
): Promise<{ data: T; error: string | null; isUsingFallback: boolean }> {
  // Early return if no config
  if (!hasSupabaseConfig) {
    console.log(`${operationName}: Using fallback (no config)`)
    return { data: fallback, error: "Supabase not configured", isUsingFallback: true }
  }

  let client: SupabaseClient | null = null

  try {
    // Create client with timeout
    const clientPromise = createSupabaseClient()
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Client creation timeout")), 5000),
    )

    client = await Promise.race([clientPromise, timeoutPromise])

    if (!client) {
      throw new Error("Failed to create Supabase client")
    }

    // Defensive check before using client
    if (!client || typeof client !== "object" || !client.from) {
      throw new Error("Invalid Supabase client structure")
    }

    // Execute operation with timeout
    const operationPromise = operation(client)
    const operationTimeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Operation timeout")), 8000),
    )

    const result = await Promise.race([operationPromise, operationTimeoutPromise])

    console.log(`✅ ${operationName}: Success`)
    return { data: result, error: null, isUsingFallback: false }
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error"
    console.warn(`${operationName}: Failed (${errorMessage}), using fallback`)

    return {
      data: fallback,
      error: errorMessage,
      isUsingFallback: true,
    }
  } finally {
    // Clean up client if needed (though not necessary for our use case)
    client = null
  }
}

// Completely remove any auth-related functionality to avoid destructuring errors
export const safeAuth = {
  // Stub methods that always return safe defaults
  getSession: async () => {
    console.warn("Auth not available in public client")
    return { data: { session: null }, error: null }
  },

  onAuthStateChange: () => {
    console.warn("Auth state change not available in public client")
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            console.log("Auth subscription unsubscribed (stub)")
          },
        },
      },
    }
  },

  signOut: async () => {
    console.warn("Sign out not available in public client")
    return { error: null }
  },
}
