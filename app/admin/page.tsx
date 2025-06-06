"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { adminDb } from "@/lib/admin-db"
import { Plus, Database, AlertCircle, FolderOpen, HardDrive } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    loading: true,
    error: null as string | null,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await adminDb.getProjects()
        setStats({
          totalProjects: result.data.length,
          loading: false,
          error: result.success ? null : result.error || "Failed to load data",
        })
      } catch (error) {
        setStats({
          totalProjects: 0,
          loading: false,
          error: "Failed to load statistics",
        })
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus size={16} className="mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Status Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <HardDrive size={20} className="text-green-400" />
            <div>
              <p className="font-medium">Local Storage Mode</p>
              <p className="text-sm text-gray-400">
                Data is stored locally in your browser. No external database required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loading ? "..." : stats.totalProjects}</div>
            {stats.error && (
              <div className="flex items-center mt-2 text-sm text-red-400">
                <AlertCircle size={14} className="mr-1" />
                {stats.error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Active</div>
            <p className="text-sm text-gray-400 mt-1">System operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/admin/projects">
                <FolderOpen size={14} className="mr-2" />
                Manage Projects
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/" target="_blank">
                <Database size={14} className="mr-2" />
                View Site
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-900/20 border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-200">Local Storage Mode</p>
              <p className="text-sm text-blue-300 mt-1">
                Your projects are stored locally in your browser. They will persist between sessions but won't be shared
                across devices or browsers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
