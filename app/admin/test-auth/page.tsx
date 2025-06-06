"use client"

import { useState, useEffect } from "react"
import { adminAuth } from "@/lib/admin-auth"
import { hasSupabaseConfig, getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tests, setTests] = useState<
    Array<{ name: string; status: "pending" | "success" | "error"; message?: string }>
  >([])

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setTests((prev) => prev.map((t) => (t.name === testName ? { ...t, status: "pending" } : t)))

    try {
      await testFn()
      setTests((prev) => prev.map((t) => (t.name === testName ? { ...t, status: "success", message: "Passed" } : t)))
    } catch (error: any) {
      setTests((prev) => prev.map((t) => (t.name === testName ? { ...t, status: "error", message: error.message } : t)))
    }
  }

  const initializeTests = () => {
    setTests([
      { name: "Supabase Configuration", status: "pending" },
      { name: "Supabase Client", status: "pending" },
      { name: "Authentication Status", status: "pending" },
      { name: "Session Management", status: "pending" },
      { name: "User Profile", status: "pending" },
    ])
  }

  const runAllTests = async () => {
    setLoading(true)
    initializeTests()

    // Test 1: Supabase Configuration
    await runTest("Supabase Configuration", async () => {
      if (!hasSupabaseConfig) {
        throw new Error("Supabase environment variables not configured")
      }
    })

    // Test 2: Supabase Client
    await runTest("Supabase Client", async () => {
      const client = getSupabaseClient()
      if (!client) {
        throw new Error("Failed to create Supabase client")
      }
    })

    // Test 3: Authentication Status
    await runTest("Authentication Status", async () => {
      const isAuth = await adminAuth.isAuthenticated()
      if (!isAuth) {
        throw new Error("User is not authenticated")
      }
    })

    // Test 4: Session Management
    await runTest("Session Management", async () => {
      const currentSession = await adminAuth.getSession()
      if (!currentSession) {
        throw new Error("No active session found")
      }
      setSession(currentSession)
    })

    // Test 5: User Profile
    await runTest("User Profile", async () => {
      const currentUser = await adminAuth.getCurrentUser()
      if (!currentUser) {
        throw new Error("No user data available")
      }
      setUser(currentUser)
    })

    setLoading(false)
  }

  const handleSignOut = async () => {
    try {
      await adminAuth.signOut()
      setUser(null)
      setSession(null)
      setTests([])
    } catch (error: any) {
      console.error("Sign out error:", error)
    }
  }

  useEffect(() => {
    // Listen to auth state changes
    const {
      data: { subscription },
    } = adminAuth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session)
      if (session?.user) {
        setUser(session.user)
        setSession(session)
      } else {
        setUser(null)
        setSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "pending":
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-900 text-green-200">Success</Badge>
      case "error":
        return <Badge className="bg-red-900 text-red-200">Error</Badge>
      case "pending":
        return <Badge className="bg-yellow-900 text-yellow-200">Running</Badge>
      default:
        return <Badge className="bg-gray-900 text-gray-200">Pending</Badge>
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Supabase Authentication Test</h1>
        <Alert className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Supabase is not configured. Please add your environment variables to test authentication.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Supabase Authentication Test</h1>
        <div className="flex space-x-2">
          <Button onClick={runAllTests} disabled={loading}>
            {loading ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
            Run Tests
          </Button>
          {user && (
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          )}
        </div>
      </div>

      {/* Current Auth Status */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Supabase Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Authentication</p>
              <p className="font-mono">{user ? "✅ Authenticated" : "❌ Not Authenticated"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <p className="font-mono">{user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">User ID</p>
              <p className="font-mono text-xs">{user?.id || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Session</p>
              <p className="font-mono">{session ? "✅ Active" : "❌ None"}</p>
            </div>
          </div>

          {session && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">View Session Details</summary>
              <pre className="mt-2 p-3 bg-gray-800 rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {tests.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Supabase Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {test.message && <span className="text-sm text-gray-400">{test.message}</span>}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supabase Testing Guide */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Supabase Authentication Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-800 rounded">
              <h4 className="font-semibold mb-2 text-blue-400">✅ What's Working</h4>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Pure Supabase Authentication</li>
                <li>• Email/Password sign up and sign in</li>
                <li>• Password reset via email</li>
                <li>• Session management and persistence</li>
                <li>• Real-time auth state changes</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-800 rounded">
              <h4 className="font-semibold mb-2 text-green-400">🔧 Configuration</h4>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configured" : "❌ Missing"}</li>
                <li>• Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configured" : "❌ Missing"}</li>
                <li>• Database: Connected to Supabase</li>
                <li>• Auth Provider: Supabase Auth only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
