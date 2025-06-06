"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { adminAuth } from "@/lib/admin-auth-simple"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If on login page, don't check auth
    if (pathname === "/admin/login") {
      setLoading(false)
      return
    }

    // Check if logged in
    if (!adminAuth.isLoggedIn()) {
      router.push("/admin/login")
      return
    }

    // Get user info
    const userInfo = adminAuth.getUser()
    setUser(userInfo)
    setLoading(false)
  }, [pathname, router])

  // If on login page, just render children
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const handleSignOut = () => {
    adminAuth.logout()
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="border-b border-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">LIGHTBERRY LAB ADMIN</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-gray-400">{user.email}</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6">
        <nav className="mb-6">
          <ul className="flex gap-4 border-b border-gray-800 pb-2">
            <li>
              <Link
                href="/admin"
                className={`${pathname === "/admin" ? "text-white" : "text-gray-400"} hover:text-white`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/projects"
                className={`${pathname.startsWith("/admin/projects") ? "text-white" : "text-gray-400"} hover:text-white`}
              >
                Projects
              </Link>
            </li>
            <li>
              <Link href="/" className="text-gray-400 hover:text-white" target="_blank">
                View Site
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mb-4 p-2 bg-yellow-900/20 border border-yellow-800 rounded text-yellow-400 text-xs">
          <p>⚠️ Demo Mode: This is a demo admin panel with mock data. Changes will not persist after page refresh.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
