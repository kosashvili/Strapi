"use client"

import { hasSupabaseConfig } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EnvCheck() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <Card className="bg-gray-900 border-gray-800 mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Environment Configuration</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="flex justify-between">
          <span>Supabase URL:</span>
          <span className={supabaseUrl ? "text-green-400" : "text-red-400"}>{supabaseUrl ? "✓ Set" : "✗ Missing"}</span>
        </div>
        <div className="flex justify-between">
          <span>Supabase Key:</span>
          <span className={supabaseKey ? "text-green-400" : "text-red-400"}>{supabaseKey ? "✓ Set" : "✗ Missing"}</span>
        </div>
        <div className="flex justify-between">
          <span>Overall Status:</span>
          <span className={hasSupabaseConfig ? "text-green-400" : "text-red-400"}>
            {hasSupabaseConfig ? "✓ Ready" : "✗ Not Configured"}
          </span>
        </div>
        {!hasSupabaseConfig && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-red-300">
            <p className="font-medium">Configuration Required:</p>
            <p>Add these environment variables to your .env.local file:</p>
            <pre className="mt-1 text-xs">
              NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{"\n"}
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
