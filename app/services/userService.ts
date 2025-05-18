import { authService } from "./authService"
import { Movie } from "@/app/services/movieService"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface UpdateUserRequest {
  lastPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  name: string
  email: string
  visibilityPublic: boolean
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
  ratedList?: {
    id: string
    movie: Movie
    rate: number
    comment: string
  }[]
  ranking?: {
    posicao: number
    total: number
    percentil: number
    avaliacoes: number
    nivel: string
    proximoNivel: {
      nome: string
      avaliacoesNecessarias: number
    }
  }
  totalFilmes?: number
  filmesAssistidosPorGenero?: {
    genero: string
    quantidade: number
  }[]
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
  },

  async changePasswordById(id: string, data: UpdateUserRequest) {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_URL}/users/${id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to change password')
      }

      return true
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  },

  async updateProfile(id: string, data: UpdateProfileRequest): Promise<User | void> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.text()
        try {
          const parsedError = JSON.parse(errorData)
          throw new Error(parsedError.detail || 'Failed to update profile')
        } catch {
          throw new Error(errorData || 'Failed to update profile')
        }
      }

      // Verifica se há conteúdo na resposta
      const text = await response.text()
      if (!text) {
        return // Se não houver conteúdo, apenas retorna (operação foi bem sucedida)
      }

      try {
        // Tenta fazer o parse do JSON apenas se houver conteúdo
        return JSON.parse(text)
      } catch (e) {
        console.warn('Resposta não é um JSON válido:', text)
        // Se não for um JSON válido, apenas retorna (operação foi bem sucedida)
        return
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }
}
