"use client"

import { hasSupabaseConfig } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SimpleStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <Card className="bg-gray-900 border-gray-800 mb-4">
      <CardHeader>
        <CardTitle className="text-sm">System Status</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Environment:</p>
            <p className={hasSupabaseConfig ? "text-green-400" : "text-yellow-400"}>
              {hasSupabaseConfig ? "✓ Configured" : "⚠ Demo Mode"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Data Source:</p>
            <p className={hasSupabaseConfig ? "text-blue-400" : "text-gray-400"}>
              {hasSupabaseConfig ? "Database" : "Static"}
            </p>
          </div>
        </div>

        {!hasSupabaseConfig && (
          <div className="mt-3 p-2 bg-blue-900/20 border border-blue-800 rounded">
            <p className="text-blue-300 font-medium">Demo Mode Active</p>
            <p className="text-blue-400 text-xs mt-1">
              The site is running with sample data. To enable live data management, configure your Supabase environment
              variables.
            </p>
          </div>
        )}

        {hasSupabaseConfig && (
          <div className="mt-3 text-xs text-gray-400">
            <p>URL: {supabaseUrl?.substring(0, 30)}...</p>
            <p>Key: {supabaseKey ? "Present" : "Missing"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
