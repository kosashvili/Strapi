"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  // If on login page, just render children
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // If loading or not authenticated, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // If not authenticated and not on login page, this will redirect in the AuthProvider

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
              onClick={signOut}
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
        {children}
      </div>
    </div>
  )
}
