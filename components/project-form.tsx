"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { Project } from "@/types"

interface ProjectFormProps {
  project?: Project
  isEditing?: boolean
}

export function ProjectForm({ project, isEditing = false }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || "")
  const [description, setDescription] = useState(project?.description || "")
  const [imageUrl, setImageUrl] = useState(project?.imageUrl || "")
  const [visitUrl, setVisitUrl] = useState(project?.visitUrl || "")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check authentication first
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("You must be logged in to perform this action")
      }

      const projectData = {
        title,
        description,
        imageUrl,
        visitUrl,
      }

      if (isEditing && project) {
        // Update existing project
        const { error } = await supabase.from("projects").update(projectData).eq("id", project.id)

        if (error) {
          console.error("Update error:", error)
          throw new Error(`Failed to update project: ${error.message}`)
        }

        toast.success("Project updated successfully")
      } else {
        // Create new project
        const { error } = await supabase.from("projects").insert([projectData])

        if (error) {
          console.error("Insert error:", error)
          throw new Error(`Failed to create project: ${error.message}`)
        }

        toast.success("Project created successfully")
      }

      router.push("/admin/projects")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving project:", error)
      toast.error(error.message || `Failed to ${isEditing ? "update" : "create"} project`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm">
              Project Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="text-sm">
              Image URL
            </label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="visitUrl" className="text-sm">
              Visit URL
            </label>
            <Input
              id="visitUrl"
              value={visitUrl}
              onChange={(e) => setVisitUrl(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/projects")}
              className="border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
