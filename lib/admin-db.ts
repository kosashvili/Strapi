import { safeSupabaseOperation, fallbackProjects } from "@/lib/supabase"
import type { Project } from "@/types"

// Local storage fallback
const STORAGE_KEY = "lightberry_projects"

// Get projects from localStorage as fallback
function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (error) {
    console.warn("Failed to parse stored projects:", error)
  }

  return fallbackProjects
}

// Save projects to localStorage as fallback
function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (error) {
    console.warn("Failed to save projects:", error)
  }
}

// Generate a simple ID for local storage
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const adminDb = {
  // Get all projects
  async getProjects(): Promise<{ success: boolean; data: Project[]; error?: string }> {
    const result = await safeSupabaseOperation(
      async (client) => {
        const { data, error } = await client.from("projects").select("*").order("created_at", { ascending: false })

        if (error) throw new Error(error.message)
        return Array.isArray(data) ? data : []
      },
      getStoredProjects(),
      "Get projects",
    )

    // If using fallback, save the result to localStorage
    if (result.isUsingFallback) {
      saveProjects(result.data)
    }

    return {
      success: !result.error,
      data: result.data,
      error: result.error || undefined,
    }
  },

  // Create a new project
  async createProject(
    project: Omit<Project, "id" | "created_at">,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    // Validate input
    if (!project.title || !project.description || !project.visitUrl) {
      return {
        success: false,
        error: "Title, description, and visit URL are required",
      }
    }

    const result = await safeSupabaseOperation(
      async (client) => {
        const { data, error } = await client
          .from("projects")
          .insert([
            {
              title: project.title.trim(),
              description: project.description.trim(),
              imageUrl: project.imageUrl?.trim() || null,
              visitUrl: project.visitUrl.trim(),
            },
          ])
          .select()
          .single()

        if (error) throw new Error(error.message)
        return data
      },
      null,
      "Create project",
    )

    // If using fallback, create in localStorage
    if (result.isUsingFallback) {
      try {
        const projects = getStoredProjects()
        const newProject: Project = {
          id: generateId(),
          title: project.title.trim(),
          description: project.description.trim(),
          imageUrl: project.imageUrl?.trim() || "",
          visitUrl: project.visitUrl.trim(),
          created_at: new Date().toISOString(),
        }

        projects.unshift(newProject)
        saveProjects(projects)

        return { success: true, data: newProject }
      } catch (error) {
        return { success: false, error: "Failed to create project" }
      }
    }

    return {
      success: !result.error && !!result.data,
      data: result.data || undefined,
      error: result.error || undefined,
    }
  },

  // Update a project
  async updateProject(
    id: string,
    updates: Partial<Omit<Project, "id" | "created_at">>,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    if (!id) {
      return {
        success: false,
        error: "Project ID is required",
      }
    }

    const result = await safeSupabaseOperation(
      async (client) => {
        // Clean up the updates object
        const cleanUpdates: any = {}
        if (updates.title) cleanUpdates.title = updates.title.trim()
        if (updates.description) cleanUpdates.description = updates.description.trim()
        if (updates.visitUrl) cleanUpdates.visitUrl = updates.visitUrl.trim()
        if (updates.imageUrl !== undefined) {
          cleanUpdates.imageUrl = updates.imageUrl?.trim() || null
        }

        const { data, error } = await client.from("projects").update(cleanUpdates).eq("id", id).select().single()

        if (error) throw new Error(error.message)
        return data
      },
      null,
      "Update project",
    )

    // If using fallback, update in localStorage
    if (result.isUsingFallback) {
      try {
        const projects = getStoredProjects()
        const projectIndex = projects.findIndex((p) => p.id === id)

        if (projectIndex === -1) {
          return { success: false, error: "Project not found" }
        }

        const updatedProject = {
          ...projects[projectIndex],
          ...updates,
          id, // Ensure ID doesn't change
          created_at: projects[projectIndex].created_at, // Preserve creation date
        }

        projects[projectIndex] = updatedProject
        saveProjects(projects)

        return { success: true, data: updatedProject }
      } catch (error) {
        return { success: false, error: "Failed to update project" }
      }
    }

    return {
      success: !result.error && !!result.data,
      data: result.data || undefined,
      error: result.error || undefined,
    }
  },

  // Delete a project
  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    if (!id) {
      return {
        success: false,
        error: "Project ID is required",
      }
    }

    const result = await safeSupabaseOperation(
      async (client) => {
        const { error } = await client.from("projects").delete().eq("id", id)
        if (error) throw new Error(error.message)
        return true
      },
      false,
      "Delete project",
    )

    // If using fallback, delete from localStorage
    if (result.isUsingFallback) {
      try {
        const projects = getStoredProjects()
        const filteredProjects = projects.filter((p) => p.id !== id)

        if (filteredProjects.length === projects.length) {
          return { success: false, error: "Project not found" }
        }

        saveProjects(filteredProjects)
        return { success: true }
      } catch (error) {
        return { success: false, error: "Failed to delete project" }
      }
    }

    return {
      success: !result.error && result.data,
      error: result.error || undefined,
    }
  },

  // Get a single project
  async getProject(id: string): Promise<{ success: boolean; data?: Project; error?: string }> {
    if (!id) {
      return {
        success: false,
        error: "Project ID is required",
      }
    }

    const result = await safeSupabaseOperation(
      async (client) => {
        const { data, error } = await client.from("projects").select("*").eq("id", id).single()

        if (error) throw new Error(error.message)
        return data
      },
      null,
      "Get project",
    )

    // If using fallback, get from localStorage
    if (result.isUsingFallback) {
      try {
        const projects = getStoredProjects()
        const project = projects.find((p) => p.id === id)

        if (!project) {
          return { success: false, error: "Project not found" }
        }

        return { success: true, data: project }
      } catch (error) {
        return { success: false, error: "Failed to get project" }
      }
    }

    return {
      success: !result.error && !!result.data,
      data: result.data || undefined,
      error: result.error || undefined,
    }
  },
}
