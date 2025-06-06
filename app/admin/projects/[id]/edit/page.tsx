"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProjectForm } from "@/components/project-form"
import { adminDb } from "@/lib/admin-db"
import type { Project } from "@/types"

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadProject() {
      try {
        const result = await adminDb.getProject(params.id)

        if (result.success && result.data) {
          setProject(result.data)
        } else {
          setError(result.error || "Project not found")
        }
      } catch (err) {
        setError("Failed to load project")
      } finally {
        setInitialLoading(false)
      }
    }

    loadProject()
  }, [params.id])

  const handleSubmit = async (data: any) => {
    setLoading(true)
    setError(null)

    try {
      const result = await adminDb.updateProject(params.id, data)

      if (result.success) {
        router.push("/admin/projects")
      } else {
        setError(result.error || "Failed to update project")
      }
    } catch (err) {
      setError("Failed to update project")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Project not found</p>
      </div>
    )
  }

  return <ProjectForm project={project} onSubmit={handleSubmit} loading={loading} error={error} />
}
