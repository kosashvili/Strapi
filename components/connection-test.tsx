"use client"

import { useEffect, useState } from "react"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ConnectionTest() {
  const [status, setStatus] = useState<"testing" | "success" | "error" | "not-configured">("testing")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function testConnection() {
      if (!hasSupabaseConfig) {
        setStatus("not-configured")
        setMessage("Supabase environment variables are not configured.")
        return
      }

      if (!supabase) {
        setStatus("error")
        setMessage("Supabase client could not be created.")
        return
      }

      try {
        // Test basic connection with timeout
        const testPromise = supabase.from("projects").select("count", { count: "exact", head: true })
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 5000),
        )

        const { data, error } = await Promise.race([testPromise, timeoutPromise])

        if (error) {
          throw error
        }

        setStatus("success")
        setMessage(`Connection successful! Database is accessible.`)
      } catch (error: any) {
        setStatus("error")
        setMessage(`Connection failed: ${error.message}`)
        console.error("Connection test failed:", error)
      }
    }

    testConnection()
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "not-configured":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "testing":
        return "Testing Connection"
      case "success":
        return "Database Connected"
      case "error":
        return "Connection Failed"
      case "not-configured":
        return "Not Configured"
      default:
        return "Unknown Status"
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800 mb-4">
      <CardHeader>
        <CardTitle className={getStatusColor()}>{getStatusText()}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-300">{message}</p>
        {status === "error" && (
          <div className="mt-2 text-xs text-gray-400">
            <p>Troubleshooting steps:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Verify your NEXT_PUBLIC_SUPABASE_URL is correct</li>
              <li>Verify your NEXT_PUBLIC_SUPABASE_ANON_KEY is correct</li>
              <li>Check if the projects table exists in your database</li>
              <li>Ensure Row Level Security policies allow access</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
