"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { Project } from "@/types"
import { hasSupabaseConfig, safeSupabaseOperation, safeAuth } from "@/lib/supabase" // Added safeAuth
import AdminLayout from "../admin-layout"
import type { SupabaseClient } from "@supabase/supabase-js"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    if (!hasSupabaseConfig) {
      toast.error("Database not configured. Please check your environment variables.")
      setLoading(false)
      return
    }

    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        const {
          data: { user },
          error: authError,
        } = await safeAuth.getUser() // Use safeAuth
        if (authError || !user) {
          throw new Error(authError?.message || "Authentication required")
        }
        const { data, error } = await client.from("projects").select("*").order("created_at", { ascending: false })
        if (error) throw new Error(`Database error: ${error.message}`)
        return data || []
      },
      [],
      "Fetch admin projects",
    )

    if (result.error) {
      toast.error(`Failed to load projects: ${result.error}`)
    }
    setProjects(result.data)
    setLoading(false)
  }

  async function deleteProject(id: string) {
    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        const { error } = await client.from("projects").delete().eq("id", id)
        if (error) throw error
        return true
      },
      false,
      "Delete project",
    )

    if (result.error) {
      toast.error(`Failed to delete project: ${result.error}`)
    } else {
      setProjects(projects.filter((project) => project.id !== id))
      toast.success("Project deleted successfully")
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button asChild>
            <Link href="/admin/projects/new">Add New Project</Link>
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400">No projects found</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/projects/new">Add Your First Project</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild className="border-gray-700 hover:bg-gray-800">
                            <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  This action cannot be undone. This will permanently delete the project.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => deleteProject(project.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
