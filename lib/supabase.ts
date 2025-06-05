import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate URL format
function isValidUrl(string: string) {
  try {
    const url = new URL(string)
    return url.protocol === "https:" && url.hostname.includes("supabase")
  } catch (_) {
    return false
  }
}

// Check if we have valid configuration
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl))

// Debug logging (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔧 Supabase Configuration:")
  console.log("- URL provided:", Boolean(supabaseUrl))
  console.log("- URL valid:", isValidUrl(supabaseUrl))
  console.log("- Key provided:", Boolean(supabaseAnonKey))
  console.log("- Has config:", hasSupabaseConfig)
}

let supabase: any = null

// Only create client if we have valid configuration
if (hasSupabaseConfig) {
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

    console.log("Testing basic connectivity to:", healthCheckUrl)

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

    console.log("✅ Basic connectivity test passed")

    // Now test Supabase client
    const { data, error } = await supabase.from("projects").select("count", { count: "exact", head: true })

    if (error) {
      throw error
    }

    return { success: true, data: `Found ${data?.length || 0} projects` }
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

// Export the client and config status
export { supabase, hasSupabaseConfig }
