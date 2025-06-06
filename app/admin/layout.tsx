"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { adminAuth } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"
import { LogOut, Home, FolderOpen } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setLoading(false)
      return
    }

    // Check authentication
    if (!adminAuth.isAuthenticated()) {
      router.push("/admin/login")
      return
    }

    // Get user info
    const currentUser = adminAuth.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [pathname, router])

  const handleLogout = () => {
    adminAuth.logout()
    router.push("/admin/login")
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
              <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
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
