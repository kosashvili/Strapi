"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminDb } from "@/lib/admin-auth-simple"
import AdminLayout from "./admin-layout"

export default function AdminDashboard() {
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const result = await adminDb.getProjectCount()
      if (result.success) {
        setProjectCount(result.data)
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "..." : projectCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
