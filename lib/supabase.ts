import { createClient } from "@supabase/supabase-js"
import type { Project } from "@/types"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if Supabase is configured
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.includes("supabase"))

// Create a singleton Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!hasSupabaseConfig) {
    console.warn("Supabase not configured")
    return null
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      return null
    }
  }

  return supabaseInstance
}

// Fallback projects data
export const fallbackProjects: Project[] = [
  {
    id: "1",
    title: "Neural Canvas",
    description: "AI-powered drawing tool that transforms sketches into digital art using machine learning algorithms.",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Neural+Canvas",
    visitUrl: "https://example.com/neural-canvas",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Quantum Todo",
    description: "Task management app with probabilistic scheduling and uncertainty-based priority systems.",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Quantum+Todo",
    visitUrl: "https://example.com/quantum-todo",
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    title: "Syntax Poetry",
    description:
      "Code-to-poetry generator that converts programming syntax into readable verse and artistic expressions.",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Syntax+Poetry",
    visitUrl: "https://example.com/syntax-poetry",
    created_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "4",
    title: "Memory Palace VR",
    description: "Virtual reality memory training application using spatial mnemonics and 3D environments.",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Memory+Palace+VR",
    visitUrl: "https://example.com/memory-palace",
    created_at: "2024-01-04T00:00:00Z",
  },
  {
    id: "5",
    title: "Chaos Calculator",
    description: "Mathematical visualization tool for exploring fractal patterns and chaotic systems in real-time.",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Chaos+Calculator",
    visitUrl: "https://example.com/chaos-calculator",
    created_at: "2024-01-05T00:00:00Z",
  },
]

// Safe database operations with fallback
export async function safeSupabaseOperation<T>(
  operation: (client: ReturnType<typeof createClient>) => Promise<T>,
  fallback: T,
  operationName = "operation",
): Promise<{ data: T; error: string | null; isUsingFallback: boolean }> {
  // Early return if no config
  if (!hasSupabaseConfig) {
    console.log(`${operationName}: Using fallback (no config)`)
    return { data: fallback, error: null, isUsingFallback: true }
  }

  try {
    const client = getSupabaseClient()

    if (!client) {
      throw new Error("Failed to create Supabase client")
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
  }
}

// Test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  if (!hasSupabaseConfig) return false

  try {
    const client = getSupabaseClient()
    if (!client) return false

    const { error } = await client.from("projects").select("count", { count: "exact", head: true })
    return !error
  } catch (error) {
    console.error("Supabase connection test failed:", error)
    return false
  }
}
