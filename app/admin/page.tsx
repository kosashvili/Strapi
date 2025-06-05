"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleStatus } from "@/components/simple-status"
import { safeSupabaseOperation, supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const result = await safeSupabaseOperation(
        async () => {
          if (!supabase) {
            throw new Error("Supabase not available")
          }
          const { count, error } = await supabase.from("projects").select("*", { count: "exact", head: true })
          if (error) throw error
          return count
        },
        null,
        "Fetch project count",
      )

      setProjectCount(result.data)
      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <SimpleStatus />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? "..." : (projectCount ?? "Demo")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
