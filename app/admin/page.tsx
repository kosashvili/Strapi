"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleStatus } from "@/components/simple-status"
import { adminDb, hasSupabaseConfig } from "@/lib/admin-auth"
import AdminLayout from "./admin-layout"

export default function AdminDashboard() {
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!hasSupabaseConfig) {
        setLoading(false)
        return
      }

      const result = await adminDb.getProjectCount()

      if (result.success) {
        setProjectCount(result.data)
      } else {
        console.warn("Failed to fetch project count:", result.error)
      }

      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <SimpleStatus />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "..." : (projectCount ?? "N/A")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
