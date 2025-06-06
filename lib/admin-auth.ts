// Simple admin authentication system
const ADMIN_CREDENTIALS = {
  email: "admin@lightberry.com",
  password: "lightberry2024",
}

const STORAGE_KEY = "lightberry_admin_session"

export const adminAuth = {
  // Login with email and password
  login(email: string, password: string): boolean {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      if (typeof window !== "undefined") {
        const session = {
          email,
          loginTime: Date.now(),
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      }
      return true
    }
    return false
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false

    try {
      const sessionData = localStorage.getItem(STORAGE_KEY)
      if (!sessionData) return false

      const session = JSON.parse(sessionData)
      return Date.now() < session.expires
    } catch {
      return false
    }
  },

  // Get current user info
  getCurrentUser() {
    if (typeof window === "undefined") return null

    try {
      const sessionData = localStorage.getItem(STORAGE_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      if (Date.now() >= session.expires) {
        this.logout()
        return null
      }

      return { email: session.email }
    } catch {
      return null
    }
  },

  // Logout
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  },
}
