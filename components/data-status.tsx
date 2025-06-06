"use client"

import { hasSupabaseConfig } from "@/lib/supabase"

interface DataStatusProps {
  isUsingFallback: boolean
}

export function DataStatus({ isUsingFallback }: DataStatusProps) {
  if (!hasSupabaseConfig) {
    return (
      <div className="text-xs text-blue-400 text-center mb-4 p-2 bg-blue-900/20 border border-blue-800 rounded">
        {">"} Demo Mode: Showing sample projects (Supabase not configured)
      </div>
    )
  }

  if (isUsingFallback) {
    return (
      <div className="text-xs text-yellow-400 text-center mb-4 p-2 bg-yellow-900/20 border border-yellow-800 rounded">
        {">"} Offline Mode: Showing cached projects (Database temporarily unavailable)
      </div>
    )
  }

  return (
    <div className="text-xs text-green-400 text-center mb-4 p-2 bg-green-900/20 border border-green-800 rounded">
      {">"} Live Mode: Showing real-time projects from database
    </div>
  )
}
