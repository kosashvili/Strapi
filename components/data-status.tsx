"use client"

import { hasSupabaseConfig } from "@/lib/supabase"

interface DataStatusProps {
  isUsingFallback: boolean
}

export function DataStatus({ isUsingFallback }: DataStatusProps) {
  if (!hasSupabaseConfig) {
    return (
      <div className="text-xs text-red-400 text-center mb-4 p-2 bg-red-900/20 border border-red-800 rounded">
        {">"} Configuration Required: Please set up Supabase to enable full functionality
      </div>
    )
  }

  if (isUsingFallback) {
    return (
      <div className="text-xs text-yellow-400 text-center mb-4 p-2 bg-yellow-900/20 border border-yellow-800 rounded">
        {">"} Offline Mode: Showing sample projects (Database temporarily unavailable)
      </div>
    )
  }

  return (
    <div className="text-xs text-green-400 text-center mb-4 p-2 bg-green-900/20 border border-green-800 rounded">
      {">"} Live Mode: Connected to Supabase database
    </div>
  )
}
