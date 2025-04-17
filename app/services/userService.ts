import { authService } from "./authService"
import { Movie } from "@/app/services/movieService"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}


export interface User {
  id: string
  name: string
  email: string
  photo?: string
  role: string
  visibilityPublic: boolean
  createdAt: string
  favorites: Movie[]
}

export const userService = {
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw response
      }

      const user: User = await response.json()
      return user
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    }
  },
  async getUserById(id: string): Promise<User | null> {
    try {
      const token = authService.getToken()

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        console.error(`Erro ao buscar usuário: ${response.statusText}`)
        return null
      }

      const user: User = await response.json()
      return user
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }
  },

  async postUserPhotoById(id: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    console.log("FormData conteúdo:", [...formData]);
  
    const token = authService.getToken()

    const response = await fetch(`${API_URL}/users/${id}/photo`, {
      method: "POST",
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload photo");
    }
  }
}
