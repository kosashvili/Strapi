"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ProjectForm } from "@/components/project-form"
import { toast } from "sonner"
import type { Project } from "@/types"

export default function EditProjectPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single()

        if (error) throw error

        if (data) {
          setProject(data)
        } else {
          toast.error("Project not found")
          router.push("/admin/projects")
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        toast.error("Failed to load project")
        router.push("/admin/projects")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, router])

  if (loading) {
    return <div className="text-center py-8">Loading project...</div>
  }

  if (!project) {
    return null
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <ProjectForm project={project} isEditing />
    </div>
  )
}
