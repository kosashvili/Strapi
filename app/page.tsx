"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { supabase, safeSupabaseOperation } from "@/lib/supabase"
import type { Project } from "@/types"
import { DataStatus } from "@/components/data-status"

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Fallback projects data
  const fallbackProjects: Project[] = [
    {
      id: "1",
      title: "Neural Canvas",
      description:
        "AI-powered drawing tool that transforms sketches into digital art using machine learning algorithms.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Neural+Canvas",
      visitUrl: "https://example.com/neural-canvas",
    },
    {
      id: "2",
      title: "Quantum Todo",
      description: "Task management app with probabilistic scheduling and uncertainty-based priority systems.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Quantum+Todo",
      visitUrl: "https://example.com/quantum-todo",
    },
    {
      id: "3",
      title: "Syntax Poetry",
      description:
        "Code-to-poetry generator that converts programming syntax into readable verse and artistic expressions.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Syntax+Poetry",
      visitUrl: "https://example.com/syntax-poetry",
    },
    {
      id: "4",
      title: "Memory Palace VR",
      description: "Virtual reality memory training application using spatial mnemonics and 3D environments.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Memory+Palace+VR",
      visitUrl: "https://example.com/memory-palace",
    },
    {
      id: "5",
      title: "Chaos Calculator",
      description: "Mathematical visualization tool for exploring fractal patterns and chaotic systems in real-time.",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Chaos+Calculator",
      visitUrl: "https://example.com/chaos-calculator",
    },
  ]

  async function fetchProjects() {
    setLoading(true)
    setConnectionError(null)

    // Use safe wrapper that never throws
    const result = await safeSupabaseOperation(
      async () => {
        if (!supabase) {
          throw new Error("Supabase client not available")
        }

        const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        return data || []
      },
      fallbackProjects,
      "Fetch projects",
    )

    // Always set projects (either from DB or fallback)
    setProjects(result.data)
    setIsUsingFallback(result.isUsingFallback)
    setConnectionError(result.error)
    setLoading(false)

    // Log the result for debugging
    if (result.isUsingFallback) {
      console.log("🔄 Using fallback data:", result.error)
    } else {
      console.log("✅ Using live data from Supabase")
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">LIGHTBERRY EXPERIMENTAL LAB</h1>
          <p className="text-gray-400 text-center mt-2 text-sm md:text-base">
            {">"} Exploring the boundaries of digital creativity
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">EXPERIMENTAL PROJECTS</h2>
            <div className="h-px bg-gray-800 w-full"></div>
          </div>

          <DataStatus isUsingFallback={isUsingFallback} />

          {/* Projects Grid */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading projects...</p>
              </div>
            ) : (
              projects.map((project) => (
                <Card key={project.id} className="bg-white text-black border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Image */}
                      <div className="md:col-span-1">
                        <div className="aspect-video md:aspect-square relative">
                          <Image
                            src={project.imageUrl || "/placeholder.svg"}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="md:col-span-2 p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">{project.title}</h3>
                          <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            asChild
                            className="bg-black text-white hover:bg-gray-800 font-mono uppercase tracking-wider"
                          >
                            <Link href={project.visitUrl}>[VISIT]</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">{">"} LIGHTBERRY EXPERIMENTAL LAB © 2024</p>
          <p className="text-gray-600 text-xs mt-1">Building the future, one experiment at a time</p>
        </div>
      </footer>
    </div>
  )
}
