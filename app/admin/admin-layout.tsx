"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { adminAuth, hasSupabaseConfig } from "@/lib/admin-auth"
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

  // If Supabase is not configured, show configuration message
  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <header className="border-b border-gray-800 py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-bold">LIGHTBERRY LAB ADMIN</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Admin Panel Not Available</h2>
            <p className="text-gray-400 mb-6">
              The admin panel requires Supabase configuration. Please set up your environment variables to enable
              authentication and project management.
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded p-4 text-left">
              <p className="text-sm text-gray-300 mb-2">Required environment variables:</p>
              <pre className="text-xs text-green-400">
                NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{"\n"}
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
              </pre>
            </div>
            <div className="mt-6">
              <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                <Link href="/">← Back to Homepage</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Handle sign out
  const handleSignOut = async () => {
    await adminAuth.logout()
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
        {children}
      </div>
    </div>
  )
}
