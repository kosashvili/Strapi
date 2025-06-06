"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Project } from "@/types"

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: Omit<Project, "id" | "created_at">) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function ProjectForm({ project, onSubmit, loading = false, error }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    imageUrl: project?.imageUrl || "",
    visitUrl: project?.visitUrl || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/admin/projects">
            <ArrowLeft size={16} className="mr-2" />
            Back to Projects
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{project ? "Edit Project" : "New Project"}</h1>
      </div>

      {error && (
        <Alert className="bg-red-900/20 border-red-800">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitUrl">Visit URL *</Label>
                <Input
                  id="visitUrl"
                  type="url"
                  value={formData.visitUrl}
                  onChange={(e) => handleChange("visitUrl", e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-gray-800 border-gray-700 min-h-[100px]"
                placeholder="Describe your project..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="https://example.com/image.jpg (optional)"
              />
              <p className="text-sm text-gray-400">Leave empty to use a placeholder image</p>
            </div>

            {formData.imageUrl && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=400&text=Invalid+Image+URL"
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild className="border-gray-700">
                <Link href="/admin/projects">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <Save size={16} className="mr-2" />
                {loading ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
