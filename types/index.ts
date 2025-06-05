export interface Project {
  id: string
  title: string
  description: string
  imageUrl: string
  visitUrl: string
  created_at?: string
}

export interface User {
  id: string
  email: string
}
