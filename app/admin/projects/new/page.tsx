"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProjectForm } from "@/components/project-form"
import { adminDb } from "@/lib/admin-db"

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    setLoading(true)
    setError(null)

    try {
      const result = await adminDb.createProject(data)

      if (result.success) {
        router.push("/admin/projects")
      } else {
        setError(result.error || "Failed to create project")
      }
    } catch (err) {
      setError("Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return <ProjectForm onSubmit={handleSubmit} loading={loading} error={error} />
}
