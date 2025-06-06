import type { Project } from "@/types"

const STORAGE_KEY = "lightberry_projects"

// Get projects from localStorage or use defaults
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

  // Return default projects if nothing stored
  return [
    {
      id: "1",
      title: "Neural Canvas",
      description:
        "AI-powered drawing tool that transforms sketches into digital art using machine learning algorithms.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Neural+Canvas",
      visitUrl: "https://example.com/neural-canvas",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Quantum Todo",
      description: "Task management app with probabilistic scheduling and uncertainty-based priority systems.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Quantum+Todo",
      visitUrl: "https://example.com/quantum-todo",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Syntax Poetry",
      description:
        "Code-to-poetry generator that converts programming syntax into readable verse and artistic expressions.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Syntax+Poetry",
      visitUrl: "https://example.com/syntax-poetry",
      created_at: new Date().toISOString(),
    },
  ]
}

// Save projects to localStorage
function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (error) {
    console.warn("Failed to save projects:", error)
  }
}

// Generate a simple ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const adminDb = {
  // Get all projects
  async getProjects(): Promise<{ success: boolean; data: Project[]; error?: string }> {
    try {
      const projects = getStoredProjects()
      return { success: true, data: projects }
    } catch (error) {
      return { success: false, data: [], error: "Failed to load projects" }
    }
  },

  // Create a new project
  async createProject(
    project: Omit<Project, "id" | "created_at">,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      if (!project.title || !project.description || !project.visitUrl) {
        return { success: false, error: "Title, description, and visit URL are required" }
      }

      const projects = getStoredProjects()
      const newProject: Project = {
        id: generateId(),
        title: project.title.trim(),
        description: project.description.trim(),
        imageUrl: project.imageUrl?.trim() || "",
        visitUrl: project.visitUrl.trim(),
        created_at: new Date().toISOString(),
      }

      projects.unshift(newProject) // Add to beginning
      saveProjects(projects)

      return { success: true, data: newProject }
    } catch (error) {
      return { success: false, error: "Failed to create project" }
    }
  },

  // Update a project
  async updateProject(
    id: string,
    updates: Partial<Omit<Project, "id" | "created_at">>,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      if (!id) {
        return { success: false, error: "Project ID is required" }
      }

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
  },

  // Delete a project
  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id) {
        return { success: false, error: "Project ID is required" }
      }

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
  },

  // Get a single project
  async getProject(id: string): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      if (!id) {
        return { success: false, error: "Project ID is required" }
      }

      const projects = getStoredProjects()
      const project = projects.find((p) => p.id === id)

      if (!project) {
        return { success: false, error: "Project not found" }
      }

      return { success: true, data: project }
    } catch (error) {
      return { success: false, error: "Failed to get project" }
    }
  },
}
