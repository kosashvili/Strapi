import { safeSupabaseOperation } from "@/lib/supabase"
import type { Project } from "@/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const adminDb = {
  // Get all projects
  async getProjects(): Promise<{ success: boolean; data: Project[]; error?: string }> {
    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        const { data, error } = await client.from("projects").select("*").order("created_at", { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
      },
      [],
      "Get projects",
    )

    return {
      success: !result.isUsingFallback,
      data: result.data,
      error: result.error || undefined,
    }
  },

  // Create a new project
  async createProject(
    project: Omit<Project, "id" | "created_at">,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        const { data, error } = await client
          .from("projects")
          .insert([
            {
              title: project.title,
              description: project.description,
              imageUrl: project.imageUrl,
              visitUrl: project.visitUrl,
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

    return {
      success: !result.isUsingFallback,
      data: result.data || undefined,
      error: result.error || undefined,
    }
  },

  // Update a project
  async updateProject(
    id: string,
    updates: Partial<Omit<Project, "id" | "created_at">>,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        const { data, error } = await client.from("projects").update(updates).eq("id", id).select().single()

        if (error) throw new Error(error.message)
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
    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        const { error } = await client.from("projects").delete().eq("id", id)

        if (error) throw new Error(error.message)
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
    const result = await safeSupabaseOperation(
      async (client: SupabaseClient) => {
        const { data, error } = await client.from("projects").select("*").eq("id", id).single()

        if (error) throw new Error(error.message)
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
