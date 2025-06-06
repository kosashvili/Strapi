// A completely standalone admin authentication system with no Supabase client-side auth
import { redirect } from "next/navigation"

// Simple token-based auth with localStorage
const TOKEN_KEY = "lightberry-admin-token"
const USER_KEY = "lightberry-admin-user"

// Hardcoded admin credentials for demo purposes
// In a real app, you would validate against a secure backend
const DEMO_EMAIL = "admin@example.com"
const DEMO_PASSWORD = "admin123"

export const adminAuth = {
  // Login function - completely standalone
  async login(email: string, password: string) {
    // Simple demo validation
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Create a simple token
      const token = `demo-token-${Date.now()}`

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify({ email }))
      }

      return { success: true }
    }

    return { success: false, error: "Invalid email or password" }
  },

  // Logout function
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  // Check if user is logged in
  isLoggedIn() {
    if (typeof window === "undefined") return false
    return Boolean(localStorage.getItem(TOKEN_KEY))
  },

  // Get current user
  getUser() {
    if (typeof window === "undefined") return null

    const userJson = localStorage.getItem(USER_KEY)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch (error) {
      return null
    }
  },

  // Require authentication or redirect
  requireAuth() {
    if (typeof window !== "undefined" && !this.isLoggedIn()) {
      redirect("/admin/login")
    }
  },
}

// Mock database operations for demo
export const adminDb = {
  // Demo projects data
  demoProjects: [
    {
      id: "1",
      title: "Neural Canvas",
      description:
        "AI-powered drawing tool that transforms sketches into digital art using machine learning algorithms.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Neural+Canvas",
      visitUrl: "https://example.com/neural-canvas",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Quantum Todo",
      description: "Task management app with probabilistic scheduling and uncertainty-based priority systems.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Quantum+Todo",
      visitUrl: "https://example.com/quantum-todo",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Syntax Poetry",
      description:
        "Code-to-poetry generator that converts programming syntax into readable verse and artistic expressions.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Syntax+Poetry",
      visitUrl: "https://example.com/syntax-poetry",
      created_at: new Date().toISOString(),
    },
  ],

  // Get all projects
  async getProjects() {
    // In a real app, this would fetch from your database
    return { success: true, data: this.demoProjects }
  },

  // Delete a project
  async deleteProject(id: string) {
    // In a real app, this would delete from your database
    this.demoProjects = this.demoProjects.filter((project) => project.id !== id)
    return { success: true }
  },

  // Get project count
  async getProjectCount() {
    return { success: true, data: this.demoProjects.length }
  },
}
