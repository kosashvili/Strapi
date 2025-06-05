"use client"

import { hasSupabaseConfig } from "@/lib/supabase"

export function SimpleStatus() {
  if (!hasSupabaseConfig) {
    return (
      <div className="text-xs text-blue-400 text-center mb-4 p-2 bg-blue-900/20 border border-blue-800 rounded">
        {">"} Demo Mode: Supabase not configured
      </div>
    )
  }

  return (
    <div className="text-xs text-green-400 text-center mb-4 p-2 bg-green-900/20 border border-green-800 rounded">
      {">"} Live Mode: Supabase configured
    </div>
  )
}
