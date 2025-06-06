"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { staticProjects } from "@/lib/supabase"
import type { Project } from "@/types"
import { DataStatus } from "@/components/data-status"

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setProjects(staticProjects)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
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

          <DataStatus isUsingFallback={true} />

          {/* Projects Grid */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
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
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Image+Error"
                            }}
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
