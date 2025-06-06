"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminAuth } from "@/lib/admin-auth"
import { hasSupabaseConfig } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    async function checkAuth() {
      if (await adminAuth.isAuthenticated()) {
        router.push("/admin")
      }
    }

    if (hasSupabaseConfig) {
      checkAuth()
    }
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSupabaseConfig) {
      setError("Supabase authentication is not configured")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await adminAuth.signIn(email, password)

      if (result.success) {
        router.push("/admin")
      } else {
        setError(result.error || "Sign in failed")
      }
    } catch (err) {
      setError("Sign in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSupabaseConfig) {
      setError("Supabase authentication is not configured")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await adminAuth.signUp(email, password)

      if (result.success) {
        setSuccess("Account created successfully! Please check your email to verify your account.")
        setActiveTab("signin")
      } else {
        setError(result.error || "Sign up failed")
      }
    } catch (err) {
      setError("Sign up failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSupabaseConfig) {
      setError("Supabase authentication is not configured")
      return
    }

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setResetLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await adminAuth.resetPassword(email)

      if (result.success) {
        setSuccess("Password reset email sent! Please check your inbox.")
      } else {
        setError(result.error || "Password reset failed")
      }
    } catch (err) {
      setError("Password reset failed. Please try again.")
    } finally {
      setResetLoading(false)
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <CardTitle className="text-2xl">Authentication Not Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              Supabase authentication is not configured. Please set up your Supabase project and add the required
              environment variables.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/" className="flex items-center justify-center">
                Back to Home
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <p className="text-gray-400 text-sm">Lightberry Experimental Lab</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-900/50 border-red-800 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-900/50 border-green-800 text-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gray-700">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gray-700">
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="reset" className="data-[state=active]:bg-gray-700">
                Reset
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signin-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signin-password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                      placeholder="Create password (min 6 characters)"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4 mt-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={resetLoading}>
                  <Mail size={16} className="mr-2" />
                  {resetLoading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
