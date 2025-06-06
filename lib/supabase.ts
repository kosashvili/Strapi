// lib/supabase.ts
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

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔧 Public Supabase Configuration (lib/supabase.ts):")
  console.log("- Has config:", hasSupabaseConfig)
}

let clientInstance: SupabaseClient | null = null
let clientInitializationPromise: Promise<SupabaseClient | null> | null = null

async function createAndInitializeClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseConfig) {
    console.warn("Public Supabase: Not configured. Cannot initialize client.")
    return null
  }
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const newClient = createClient(supabaseUrl, supabaseAnonKey)
    if (!newClient) {
      console.error("❌ Public Supabase: createClient returned null/undefined!")
      return null
    }
    console.log("✅ Public Supabase client created successfully (Singleton)")
    return newClient
  } catch (error) {
    console.error("❌ Failed to create Public Supabase client:", error)
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
    // Error already logged
  } finally {
    clientInitializationPromise = null
  }
  return clientInstance
}

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
    if (!client) {
      console.error(`❌ ${operationName}: Public Supabase client is not available.`)
      throw new Error("Supabase client initialization failed for public operation")
    }

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

export const safeAuth = {
  getSession: async () => {
    try {
      const client = await getSupabaseClient()
      if (!client) {
        throw new Error("Supabase client not initialized")
      }
      const { data, error } = await client.auth.getSession()
      return { data, error }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    let unsubscribe: (() => void) | undefined
    const setupSubscription = async () => {
      try {
        const client = await getSupabaseClient()
        if (!client) {
          console.error("Supabase client not initialized for auth subscription.")
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  console.warn("Attempted to unsubscribe before client was ready.")
                },
              },
            },
          }
        }
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange(callback)
        unsubscribe = subscription?.unsubscribe
        return { data: { subscription } }
      } catch (error: any) {
        console.error("Failed to set up auth state listener:", error)
        return { data: { subscription: null }, error: error.message }
      }
    }

    const subscriptionPromise = setupSubscription()

    return {
      data: {
        subscription: {
          unsubscribe: async () => {
            const { data, error } = await subscriptionPromise
            if (error) {
              console.warn("Error during unsubscription:", error)
              return
            }
            if (unsubscribe) {
              unsubscribe()
            } else {
              console.warn("No unsubscribe function available.")
            }
          },
        },
      },
    }
  },
  signOut: async () => {
    try {
      const client = await getSupabaseClient()
      if (!client) {
        throw new Error("Supabase client not initialized")
      }
      const { error } = await client.auth.signOut()
      return { error }
    } catch (error: any) {
      return { error: error.message }
    }
  },
}
