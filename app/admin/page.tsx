"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { adminDb } from "@/lib/admin-db"
import { hasSupabaseConfig, testSupabaseConnection } from "@/lib/supabase"
import { adminAuth } from "@/lib/admin-auth"
import { Plus, Database, AlertCircle, FolderOpen, User } from "lucide-react"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    loading: true,
    error: null as string | null,
  })
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        // Get current user
        const currentUser = await adminAuth.getCurrentUser()
        setUser(currentUser)

        // Test database connection
        if (hasSupabaseConfig) {
          const connected = await testSupabaseConnection()
          setDbConnected(connected)
        }

        // Get projects
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

  if (!hasSupabaseConfig) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle size={20} className="text-red-400" />
              <div>
                <p className="font-medium text-red-200">Supabase Not Configured</p>
                <p className="text-sm text-red-300 mt-1">
                  Please configure your Supabase environment variables to use the admin panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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

      {/* User Info Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <User size={20} className="text-blue-400" />
            <div>
              <p className="font-medium">Authenticated User</p>
              <p className="text-sm text-gray-400">{user?.email || "Loading..."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Status Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Database size={20} className={dbConnected ? "text-green-400" : "text-yellow-400"} />
            <div>
              <p className="font-medium">{dbConnected ? "Supabase Connected" : "Database Connection Issue"}</p>
              <p className="text-sm text-gray-400">
                {dbConnected ? "Live data from Supabase" : "Check your Supabase connection"}
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
            <CardTitle className="text-sm font-medium text-gray-400">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Supabase Auth</div>
            <p className="text-sm text-gray-400 mt-1">Secure authentication</p>
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
    </div>
  )
}
