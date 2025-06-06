"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle the password reset flow
    const handlePasswordReset = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) return

      // Check if this is a password reset callback
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")
      const type = hashParams.get("type")

      if (type === "recovery" && accessToken && refreshToken) {
        // Set the session for password reset
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setError("Invalid or expired reset link")
        }
      }
    }

    handlePasswordReset()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    setError("")

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError("Authentication service not available")
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to admin after successful password reset
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-2xl">Password Updated</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              Your password has been successfully updated. You will be redirected to the admin panel.
            </p>
            <Button asChild className="w-full">
              <a href="/admin">Go to Admin Panel</a>
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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <p className="text-gray-400 text-sm">Enter your new password</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-900/50 border-red-800 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                  placeholder="Enter new password"
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Confirm new password"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="link" asChild className="text-gray-400 hover:text-white">
              <a href="/admin/login">Back to Login</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
