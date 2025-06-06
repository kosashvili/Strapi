"use client"

import { useEffect, useState } from "react"
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
import { adminDb } from "@/lib/admin-db"
import { Plus, Edit, Trash2, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import type { Project } from "@/types"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await adminDb.getProjects()
      setProjects(result.data)

      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const result = await adminDb.deleteProject(id)

      if (result.success) {
        setProjects(projects.filter((p) => p.id !== id))
      } else {
        setError(result.error || "Failed to delete project")
      }
    } catch (err) {
      setError("Failed to delete project")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus size={16} className="mr-2" />
            Add Project
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-4">
            <p className="text-red-200">{error}</p>
            <Button variant="outline" size="sm" onClick={loadProjects} className="mt-2">
              <RefreshCw size={14} className="mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No projects found</p>
              <Button asChild>
                <Link href="/admin/projects/new">
                  <Plus size={16} className="mr-2" />
                  Create your first project
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden sm:table-cell">URL</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{project.title}</p>
                          <p className="text-sm text-gray-400 md:hidden">
                            {project.description.length > 50
                              ? `${project.description.substring(0, 50)}...`
                              : project.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs">
                        <p className="truncate">{project.description}</p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <a
                          href={project.visitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Visit
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild className="border-gray-700 hover:bg-gray-800">
                            <Link href={`/admin/projects/${project.id}/edit`}>
                              <Edit size={14} className="mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-700 text-red-400 hover:bg-red-900/20"
                              >
                                <Trash2 size={14} className="mr-1" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Are you sure you want to delete "{project.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(project.id)}
                                  className="bg-red-600 hover:bg-red-700"
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
