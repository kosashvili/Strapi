// Strapi API helper functions
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"

export interface StrapiResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiProject {
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

export async function fetchProjects() {
  const response = await fetch(`${STRAPI_URL}/api/projects?populate=*`)

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`)
  }

  const data: StrapiResponse<StrapiProject> = await response.json()

  return data.data.map((item) => ({
    id: item.id,
    title: item.attributes.title,
    description: item.attributes.description,
    img: item.attributes.img,
    link: item.attributes.link,
  }))
}
