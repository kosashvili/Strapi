import { safeSupabaseOperation } from "@/lib/supabase"
import type { Project } from "@/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const adminDb = {
  // Get all projects with defensive error handling
  async getProjects(): Promise<{ success: boolean; data: Project[]; error?: string }> {
    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        // Defensive check before using client
        if (!client || !client.from) {
          throw new Error("Invalid client")
        }

        const { data, error } = await client.from("projects").select("*").order("created_at", { ascending: false })

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        // Ensure data is an array
        return Array.isArray(data) ? data : []
      },
      [], // Fallback to empty array
      "Get projects",
    )

    return {
      success: !result.isUsingFallback,
      data: result.data,
      error: result.error || undefined,
    }
  },

  // Create a new project with validation
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
      async (client: SupabaseClient) => {
        if (!client || !client.from) {
          throw new Error("Invalid client")
        }

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

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        return data
      },
      null,
      "Create project",
    )

    return {
      success: !result.isUsingFallback,
      data: result.data || undefined,
      error: result.error || undefined,
    }
  },

  // Update a project with validation
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
      async (client: SupabaseClient) => {
        if (!client || !client.from) {
          throw new Error("Invalid client")
        }

        // Clean up the updates object
        const cleanUpdates: any = {}
        if (updates.title) cleanUpdates.title = updates.title.trim()
        if (updates.description) cleanUpdates.description = updates.description.trim()
        if (updates.visitUrl) cleanUpdates.visitUrl = updates.visitUrl.trim()
        if (updates.imageUrl !== undefined) {
          cleanUpdates.imageUrl = updates.imageUrl?.trim() || null
        }

        const { data, error } = await client.from("projects").update(cleanUpdates).eq("id", id).select().single()

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        return data
      },
      null,
      "Update project",
    )

    return {
      success: !result.isUsingFallback,
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
      async (client: SupabaseClient) => {
        if (!client || !client.from) {
          throw new Error("Invalid client")
        }

        const { error } = await client.from("projects").delete().eq("id", id)

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        return true
      },
      false,
      "Delete project",
    )

    return {
      success: !result.isUsingFallback,
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
      async (client: SupabaseClient) => {
        if (!client || !client.from) {
          throw new Error("Invalid client")
        }

        const { data, error } = await client.from("projects").select("*").eq("id", id).single()

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        return data
      },
      null,
      "Get project",
    )

    return {
      success: !result.isUsingFallback,
      data: result.data || undefined,
      error: result.error || undefined,
    }
  },
}
