// Simple Supabase client for public data only
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

// Simple client creation - no singleton, no complex initialization
export async function createSupabaseClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseConfig) {
    return null
  }

  try {
    const { createClient } = await import("@supabase/supabase-js")
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn("Failed to create Supabase client:", error)
    return null
  }
}

// Safe wrapper for database operations
export async function safeSupabaseOperation<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  fallback: T,
  operationName = "operation",
): Promise<{ data: T; error: string | null; isUsingFallback: boolean }> {
  if (!hasSupabaseConfig) {
    return { data: fallback, error: "Supabase not configured", isUsingFallback: true }
  }

  try {
    const client = await createSupabaseClient()
    if (!client) {
      throw new Error("Failed to create Supabase client")
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
