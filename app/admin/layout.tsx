"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { adminAuth } from "@/lib/admin-auth"
import { hasSupabaseConfig } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut, Home, FolderOpen, User } from "lucide-react"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setLoading(false)
      return
    }

    // If Supabase is not configured, redirect to login to show error
    if (!hasSupabaseConfig) {
      router.push("/admin/login")
      return
    }

    async function checkAuth() {
      try {
        // Check if user is authenticated
        const isAuth = await adminAuth.isAuthenticated()

        if (!isAuth) {
          router.push("/admin/login")
          return
        }

        // Get current user
        const currentUser = await adminAuth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen to auth state changes
    const {
      data: { subscription },
    } = adminAuth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        router.push("/admin/login")
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      await adminAuth.signOut()
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
      // Force redirect even if logout fails
      router.push("/admin/login")
    }
  }

  // Show login page without layout
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                    pathname === "/admin"
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Home size={16} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/projects"
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                    pathname.startsWith("/admin/projects")
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <FolderOpen size={16} />
                  <span>Projects</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <User size={16} />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-2">
          <div className="flex space-x-4">
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                pathname === "/admin" ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Home size={16} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/projects"
              className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                pathname.startsWith("/admin/projects")
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              <FolderOpen size={16} />
              <span>Projects</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
