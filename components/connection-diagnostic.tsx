"use client"

import { useEffect, useState } from "react"
import { testSupabaseConnection, hasSupabaseConfig } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DiagnosticResult {
  step: string
  status: "pending" | "success" | "error" | "skipped"
  message: string
}

export function ConnectionDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    setResults([])

    const steps: DiagnosticResult[] = [
      { step: "Environment Variables", status: "pending", message: "Checking..." },
      { step: "URL Validation", status: "pending", message: "Checking..." },
      { step: "Network Connectivity", status: "pending", message: "Checking..." },
      { step: "Supabase API", status: "pending", message: "Checking..." },
    ]

    // Step 1: Check environment variables
    setResults([...steps])

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      steps[0] = {
        step: "Environment Variables",
        status: "error",
        message: `Missing: ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL " : ""}${!supabaseKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : ""}`,
      }
      steps[1].status = "skipped"
      steps[2].status = "skipped"
      steps[3].status = "skipped"
      setResults([...steps])
      setIsRunning(false)
      return
    }

    steps[0] = { step: "Environment Variables", status: "success", message: "All variables present" }
    setResults([...steps])

    // Step 2: URL Validation
    try {
      new URL(supabaseUrl)
      steps[1] = { step: "URL Validation", status: "success", message: "URL format is valid" }
    } catch {
      steps[1] = { step: "URL Validation", status: "error", message: "Invalid URL format" }
      steps[2].status = "skipped"
      steps[3].status = "skipped"
      setResults([...steps])
      setIsRunning(false)
      return
    }
    setResults([...steps])

    // Step 3: Network Connectivity
    try {
      const baseUrl = supabaseUrl.replace("/rest/v1", "")
      const response = await fetch(`${baseUrl}/rest/v1/`, {
        method: "HEAD",
        headers: {
          apikey: supabaseKey,
        },
      })

      if (response.ok) {
        steps[2] = { step: "Network Connectivity", status: "success", message: "Can reach Supabase servers" }
      } else {
        steps[2] = {
          step: "Network Connectivity",
          status: "error",
          message: `HTTP ${response.status}: ${response.statusText}`,
        }
        steps[3].status = "skipped"
        setResults([...steps])
        setIsRunning(false)
        return
      }
    } catch (error: any) {
      steps[2] = { step: "Network Connectivity", status: "error", message: error.message }
      steps[3].status = "skipped"
      setResults([...steps])
      setIsRunning(false)
      return
    }
    setResults([...steps])

    // Step 4: Supabase API Test
    try {
      const result = await testSupabaseConnection()
      if (result.success) {
        steps[3] = { step: "Supabase API", status: "success", message: result.data || "Connection successful" }
      } else {
        steps[3] = { step: "Supabase API", status: "error", message: result.error }
      }
    } catch (error: any) {
      steps[3] = { step: "Supabase API", status: "error", message: error.message }
    }

    setResults([...steps])
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "pending":
        return "⏳"
      case "skipped":
        return "⏭️"
      default:
        return "❓"
    }
  }

  const getStatusColor = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "pending":
        return "text-yellow-400"
      case "skipped":
        return "text-gray-500"
      default:
        return "text-gray-400"
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800 mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Connection Diagnostic</CardTitle>
        <Button
          onClick={runDiagnostic}
          disabled={isRunning}
          size="sm"
          variant="outline"
          className="border-gray-700 hover:bg-gray-800"
        >
          {isRunning ? "Running..." : "Run Test"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{getStatusIcon(result.status)}</span>
              <span className="text-sm">{result.step}</span>
            </div>
            <span className={`text-xs ${getStatusColor(result.status)}`}>{result.message}</span>
          </div>
        ))}

        {results.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-800">
            <div className="text-xs text-gray-400">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50)}...</p>
              <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "Missing"}</p>
              <p>Config Valid: {hasSupabaseConfig ? "Yes" : "No"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
