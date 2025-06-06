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
  const [authStatusLoading, setAuthStatusLoading] = useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true) // Assume true initially
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsSupabaseConfigured(hasSupabaseConfig) // Set based on actual config

    if (!hasSupabaseConfig) {
      setAuthStatusLoading(false)
      return
    }

    if (pathname === "/admin/login") {
      setAuthStatusLoading(false)
      return
    }

    async function checkAuth() {
      const loggedIn = await adminAuth.isLoggedIn()
      if (!loggedIn) {
        router.push("/admin/login")
      } else {
        const userInfo = await adminAuth.getUser()
        setUser(userInfo)
        setAuthStatusLoading(false)
      }
    }
    checkAuth()
  }, [pathname, router])

  const handleSignOut = async () => {
    await adminAuth.logout()
    setUser(null) // Clear user state locally
    router.push("/admin/login")
    router.refresh() // Ensure fresh state on login page
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (!isSupabaseConfigured) {
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
              Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
            </p>
            <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <Link href="/">← Back to Homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (authStatusLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <p>Authenticating...</p>
      </div>
    )
  }

  // If not loading and not on login page, but user is null (should have been redirected)
  // This is a fallback, redirect should happen in useEffect
  if (!user && pathname !== "/admin/login") {
    console.warn("AdminLayout: User is null but not on login page. Redirecting again.")
    router.push("/admin/login")
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    )
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
