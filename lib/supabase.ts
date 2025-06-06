// Completely static approach - no client-side Supabase
export const hasSupabaseConfig = false // Force static mode

// Static fallback data
const staticProjects = [
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

// Simple static operation that never fails
export async function safeSupabaseOperation<T>(
  operation: any,
  fallback: T,
  operationName = "operation",
): Promise<{ data: T; error: string | null; isUsingFallback: boolean }> {
  console.log(`${operationName}: Using static data (no Supabase)`)

  // Always return fallback data immediately
  return {
    data: fallback,
    error: null,
    isUsingFallback: true,
  }
}

// No auth functionality at all
export const safeAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
  signOut: async () => ({ error: null }),
}

// Export static projects for use
export { staticProjects }
