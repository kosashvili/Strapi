"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminAuth, hasSupabaseConfig } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuthStatus() {
      if (hasSupabaseConfig && (await adminAuth.isLoggedIn())) {
        router.push("/admin")
      } else {
        setCheckingAuth(false)
      }
      if (!hasSupabaseConfig) {
        setError("Supabase is not configured. Please set up your environment variables.")
      }
    }
    checkAuthStatus()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSupabaseConfig) {
      setError("Authentication is not available. Please configure Supabase.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await adminAuth.login(email, password)
      if (!result.success) {
        setError(result.error || "Login failed")
      } else {
        router.push("/admin")
        router.refresh() // To ensure layout re-evaluates auth
      }
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-center">LIGHTBERRY LAB ADMIN</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasSupabaseConfig &&
            !error && ( // Show config error only if no other error is set
              <Alert className="mb-4 bg-yellow-900 border-yellow-800 text-yellow-200">
                <AlertDescription>
                  Authentication is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and
                  NEXT_PUBLIC_SUPABASE_ANON_KEY.
                </AlertDescription>
              </Alert>
            )}
          {error && (
            <Alert className="mb-4 bg-red-900 border-red-800 text-white">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Inputs and button remain the same */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
