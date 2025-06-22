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
  description: string
}

export interface RankingUser {
  currentRank: number
  totalUsers: number
}

export interface ReadRateDto {
  id: string
  movie: Movie
  rate: number
  comment: string
}

export interface ReadAllUserDto {
  id: string
  name: string
  email: string
  role: string
  visibilityPublic: boolean
  photo?: string
  createdAt: string
  genre: string
  description?: string
  ratedList: ReadRateDto[]
  rankingUser?: RankingUser | null
  topGenres: string[]
  rateCount: number
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
  genre: string
  description?: string
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
  rankingUser?: {
    currentRank: number
    totalUsers: number
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
  },

  async getAllUsers(): Promise<ReadAllUserDto[]> {
    try {
      const token = authService.getToken()

      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        console.error(`Erro ao buscar usuários: ${response.statusText}`)
        return []
      }

      const data = await response.json()
      // Extrair o content da resposta
      const users: ReadAllUserDto[] = data.content || data || []
      return users
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      return []
    }
  },

  async getUserPhotoById(id: string): Promise<string | null> {
    try {
      const token = authService.getToken()

      const response = await fetch(`${API_URL}/users/${id}/photo`, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        return null
      }

      const contentType = response.headers.get('content-type')
      
      // Se for uma imagem, tratar como blob
      if (contentType && contentType.startsWith('image/')) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
      
      // Se não for imagem, tentar como texto (pode ser base64)
      const text = await response.text()
      
      // Verificar se é base64
      if (text.startsWith('data:image/') || text.startsWith('iVBORw0KGgo') || text.startsWith('PNG')) {
        // Se já tem o prefixo data:image/, usar diretamente
        if (text.startsWith('data:image/')) {
          return text
        }
        // Se é PNG em base64 puro, adicionar o prefixo
        if (text.startsWith('iVBORw0KGgo') || text.startsWith('PNG')) {
          return `data:image/png;base64,${text}`
        }
      }
      
      return null
    } catch (error) {
      console.error("Erro ao buscar foto do usuário:", error)
      return null
    }
  }
}
