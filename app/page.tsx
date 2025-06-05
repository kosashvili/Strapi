"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface StrapiProject {
  id: number
  attributes: {
    title: string
    description: string
    img: string
    link: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

interface Project {
  id: number
  title: string
  description: string
  img: string
  link: string
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      // Strapi REST API endpoint - adjust the URL to your Strapi instance
      const response = await fetch("http://localhost:1337/api/projects?populate=*")
      if (!response.ok) {
        throw new Error("Failed to fetch projects from Strapi")
      }
      const strapiData = await response.json()

      // Transform Strapi data structure to our Project interface
      const transformedProjects: Project[] = strapiData.data.map((item: StrapiProject) => ({
        id: item.id,
        title: item.attributes.title,
        description: item.attributes.description,
        img: item.attributes.img,
        link: item.attributes.link,
      }))

      setProjects(transformedProjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      // Fallback data for demo purposes
      setProjects([
        {
          id: 1,
          title: "Weather App",
          description: "A simple weather forecasting app with real-time data.",
          img: "/placeholder.svg?height=200&width=300",
          link: "https://weather.lightberry.app",
        },
        {
          id: 2,
          title: "Task Manager",
          description: "Minimalist productivity tool for managing daily tasks.",
          img: "/placeholder.svg?height=200&width=300",
          link: "https://tasks.lightberry.app",
        },
        {
          id: 3,
          title: "Color Palette Generator",
          description: "Generate beautiful color schemes for your projects.",
          img: "/placeholder.svg?height=200&width=300",
          link: "https://colors.lightberry.app",
        },
        {
          id: 4,
          title: "Markdown Editor",
          description: "Real-time markdown editor with live preview functionality.",
          img: "/placeholder.svg?height=200&width=300",
          link: "https://markdown.lightberry.app",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading experiments...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">LIGHTBERRY EXPERIMENTAL LAB</h1>
          <div className="w-24 h-px bg-white mx-auto"></div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 border border-red-500 bg-red-900/20 rounded">
            <p className="text-red-300">Strapi API Error: {error}</p>
            <p className="text-sm text-red-400 mt-1">Make sure your Strapi server is running on localhost:1337</p>
            <p className="text-sm text-red-400">Showing demo data instead</p>
          </div>
        )}

        {/* Projects Grid */}
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white text-black p-6 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="md:w-1/3 flex-shrink-0">
                  <div className="relative aspect-video w-full bg-gray-200 rounded overflow-hidden">
                    <Image
                      src={project.img || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-3">{project.title}</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
                  </div>

                  {/* Visit Button */}
                  <div className="flex justify-start">
                    <Link
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors duration-200 font-medium"
                    >
                      VISIT →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Lightberry Experimental Lab</p>
        </div>
      </div>
    </div>
  )
}
